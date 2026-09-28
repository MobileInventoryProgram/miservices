import 'server-only';
import { getHelpContact } from '@/lib/cms/members';
import { ukToday } from '@/lib/dates';
import { isEmailConfigured, sendEmail } from '@/lib/email/send';
import { complianceReminderEmail } from '@/lib/email/templates';
import { newKey } from '@/lib/documents/standard';
import { sanityWriteClient } from '@/lib/sanity';
import { actionable, dueForAutoReminder } from './schedule';
import { dueText, getComplianceOverview, type ComplianceItem, type FranchiseCompliance } from './status';

/**
 * Compliance reminder emails: one digest per franchise listing what they
 * still need to do. Only items the franchise can act on are included
 * (Head Office's own ticks, like fees, are left out).
 */

export interface ReminderResult {
  emailConfigured: boolean;
  /** Franchises emailed (or that would be, when email isn't set up) */
  franchises: { franchiseId: string; name: string; to: string[]; items: string[]; sent: boolean; error?: string }[];
}

type SentLog = { franchiseId: string; sentAt: string; items: { requirementId: string; period: string | null }[] };

const itemRef = (item: ComplianceItem) => `${item.requirement._id}|${item.periodKey || item.record?.period || ''}`;

async function recipientsFor(franchiseIds: string[]): Promise<Map<string, string[]>> {
  const rows = await sanityWriteClient.fetch<{ _id: string; owners: (string | null)[]; logins: string[] }[]>(
    `*[_type == "franchisee" && _id in $ids] {
      _id, "owners": owners[].email,
      "logins": *[_type == "member" && franchisee._ref == ^._id && isActive == true && role == "franchisee"].email
    }`,
    { ids: franchiseIds }
  );
  return new Map(
    rows.map((r) => [r._id, Array.from(new Set([...(r.owners || []), ...(r.logins || [])].filter((e): e is string => !!e && e.includes('@')).map((e) => e.trim().toLowerCase())))])
  );
}

async function lastSentFor(franchiseIds: string[]): Promise<SentLog[]> {
  return sanityWriteClient.fetch<SentLog[]>(
    `*[_type == "complianceReminder" && franchise._ref in $ids] | order(sentAt desc) [0...2000] {
      "franchiseId": franchise._ref, sentAt, "items": coalesce(items[] { "requirementId": requirement._ref, period }, [])
    }`,
    { ids: franchiseIds }
  );
}

function checklistUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || '';
  return `${base.replace(/\/$/, '')}/members/compliance`;
}

/**
 * Send reminders.
 * - `auto`: the daily run; each item is included only when it's due a reminder
 * - `manual`: Head Office pressed Send; every outstanding item the franchise can act on
 */
export async function sendComplianceReminders({
  kind,
  franchiseIds,
  by,
  onlyBehind = false,
}: {
  kind: 'auto' | 'manual';
  franchiseIds?: string[];
  by?: string;
  /** Manual "remind all overdue": only franchises with something overdue or sent back */
  onlyBehind?: boolean;
}): Promise<ReminderResult> {
  const today = ukToday();
  const overview = (await getComplianceOverview(today)).filter((f) => !franchiseIds || franchiseIds.includes(f.franchiseId));
  const ids = overview.map((f) => f.franchiseId);
  const [recipients, logs, contact] = await Promise.all([recipientsFor(ids), kind === 'auto' ? lastSentFor(ids) : Promise.resolve([]), getHelpContact()]);
  const emailConfigured = isEmailConfigured();

  const lastSent = (f: FranchiseCompliance, item: ComplianceItem) => {
    const ref = itemRef(item);
    return logs.find((l) => l.franchiseId === f.franchiseId && l.items.some((i) => `${i.requirementId}|${i.period || ''}` === ref))?.sentAt || null;
  };

  const result: ReminderResult = { emailConfigured, franchises: [] };
  for (const franchise of overview) {
    const outstanding = franchise.items.filter(actionable);
    const behind = outstanding.some((i) => i.state === 'overdue' || i.state === 'returned');
    const trigger =
      kind === 'manual' ? outstanding.length > 0 && (!onlyBehind || behind) : outstanding.some((i) => dueForAutoReminder(i, lastSent(franchise, i), today));
    if (!trigger) continue;

    const to = recipients.get(franchise.franchiseId) || [];
    const entry = {
      franchiseId: franchise.franchiseId,
      name: franchise.name,
      to,
      items: outstanding.map((i) => i.requirement.title),
      sent: false,
    } as ReminderResult['franchises'][number];
    result.franchises.push(entry);
    if (!emailConfigured) continue;
    if (!to.length) {
      entry.error = 'No email address for this franchise';
      continue;
    }

    const email = complianceReminderEmail({
      name: franchise.name,
      checklistUrl: checklistUrl(),
      items: outstanding.map((i) => ({
        title: `${i.requirement.title}${i.periodLabel ? ` (${i.periodLabel})` : ''}`,
        detail: i.state === 'returned' ? `Sent back by Head Office: ${i.record?.reviewNote || 'please check and resubmit'}` : dueText(i),
        overdue: i.state === 'overdue' || i.state === 'returned',
      })),
    });
    const sent = await sendEmail({ to, subject: email.subject, html: email.html, text: email.text, replyTo: contact.email || undefined });
    if (!sent.ok) {
      entry.error = sent.error;
      continue;
    }
    entry.sent = true;
    await sanityWriteClient.create({
      _type: 'complianceReminder',
      franchise: { _type: 'reference', _ref: franchise.franchiseId, _weak: true },
      items: outstanding.map((i) => ({
        _key: newKey(),
        _type: 'complianceReminderItem',
        requirement: { _type: 'reference', _ref: i.requirement._id, _weak: true },
        period: i.periodKey || i.record?.period || '',
        state: i.state,
      })),
      sentTo: to,
      sentAt: new Date().toISOString(),
      kind,
      sentBy: by || 'Automatic',
    });
  }
  return result;
}
