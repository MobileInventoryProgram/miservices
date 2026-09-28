import 'server-only';
import { headingAnchor } from '@/lib/documents/standard';
import { HEAD_OFFICE_SLUG } from '@/lib/franchisees/admin';
import { addDays, daysBetween, formatUkDate, ukToday } from '@/lib/dates';
import { sanityWriteClient } from '@/lib/sanity';
import type { ComplianceCategory, ComplianceEvidence, ComplianceFrequency, RecordStatus } from './options';
import { calendarPeriods, isCalendarRule, onceDue, type DueRule } from './periods';

/**
 * Compliance status: every franchise's checklist worked out from the master
 * requirements, the franchise's own settings and what has been submitted.
 * Read fresh each time (uncached) so a submission or approval shows at once.
 */

export interface ComplianceSource {
  title: string;
  heading: string | null;
  href: string | null;
}

export interface Requirement extends DueRule {
  _id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  frequency: ComplianceFrequency;
  evidence: ComplianceEvidence;
  remindBefore: number;
  remindEvery: number;
  startsOn: string;
  order: number;
  sources: ComplianceSource[];
}

export interface RecordFile {
  _key: string;
  name: string;
  size: number | null;
  mimeType: string | null;
}

export interface ComplianceRecord {
  _id: string;
  franchiseId: string;
  requirementId: string;
  period: string;
  status: RecordStatus;
  files: RecordFile[];
  expiresOn: string | null;
  note: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  history: { action: string; by: string | null; at: string; note: string | null }[];
}

/** Where one item stands */
export type ItemState = 'done' | 'submitted' | 'returned' | 'overdue' | 'dueSoon' | 'todo' | 'notApplicable';

export interface ComplianceItem {
  key: string;
  requirement: Requirement;
  periodKey: string | null;
  periodLabel: string | null;
  due: string | null;
  state: ItemState;
  record: ComplianceRecord | null;
  /** Done items with an expiry (insurance, yearly confirmations): valid until */
  validUntil: string | null;
  /** Head Office gave this franchise extra days */
  extraDays: number;
}

export interface FranchiseCompliance {
  franchiseId: string;
  name: string;
  companyName: string;
  items: ComplianceItem[];
  counts: { overdue: number; returned: number; submitted: number; dueSoon: number; todo: number; done: number; applicable: number };
  compliant: boolean;
  lastReminded: string | null;
}

// ─── Loading ────────────────────────────────────────────────────

type Setting = { franchiseId: string; requirementId: string; notApplicable: boolean; extraDays: number };
type Franchise = { _id: string; name: string; companyName: string; joined: string; lastReminded: string | null };

const requirementFields = `
  _id, title, "description": coalesce(description, ""), category, frequency, evidence, askExpiry,
  dueWithinDays, monthlyDay, monthOffset, weeklyDay, annualMonth, annualDay,
  "remindBefore": coalesce(remindBefore, 7), "remindEvery": coalesce(remindEvery, 7),
  "startsOn": coalesce(startsOn, _createdAt), "order": coalesce(order, 999),
  "sources": sources[] {
    "title": document->title, "heading": headingText, headingKey,
    "slug": document->slug.current, "section": coalesce(document->section->slug.current, document->subcategory)
  }
`;

export const recordFields = `
  _id, "franchiseId": franchise._ref, "requirementId": requirement._ref, period, status,
  "files": coalesce(files[] { _key, "name": coalesce(name, asset->originalFilename, "File"), "size": asset->size, "mimeType": asset->mimeType }, []),
  expiresOn, note, submittedBy, submittedAt, reviewedBy, reviewedAt, reviewNote,
  "history": coalesce(history[] { action, by, at, note }, [])
`;

type RawRequirement = Omit<Requirement, 'sources'> & {
  sources?: { title?: string; heading?: string; headingKey?: string; slug?: string; section?: string }[] | null;
};

function toRequirement(r: RawRequirement): Requirement {
  return {
    ...r,
    startsOn: String(r.startsOn).slice(0, 10),
    sources: (r.sources || []).map((s) => ({
      title: s.title || 'Document',
      heading: s.heading || null,
      href: s.slug && s.section ? `/members/documents/${s.section}/${s.slug}${s.headingKey ? `#${headingAnchor(s.headingKey)}` : ''}` : null,
    })),
  };
}

/** Requirements in use, in checklist order */
export async function getRequirements({ includeArchived = false } = {}): Promise<(Requirement & { isActive: boolean })[]> {
  const rows = await sanityWriteClient.fetch<(RawRequirement & { isActive: boolean })[]>(
    `*[_type == "complianceRequirement" && !(_id in path("drafts.**"))${includeArchived ? '' : ' && isActive != false'}]
      | order(category asc, coalesce(order, 999) asc, title asc) { ${requirementFields}, "isActive": isActive != false }`
  );
  return rows.map((r) => ({ ...toRequirement(r), isActive: r.isActive }));
}

async function loadData(franchiseId?: string) {
  const filter = franchiseId ? ' && _id == $franchiseId' : '';
  const refFilter = franchiseId ? ' && franchise._ref == $franchiseId' : '';
  const data = await sanityWriteClient.fetch<{
    requirements: RawRequirement[];
    franchises: Franchise[];
    records: ComplianceRecord[];
    settings: Setting[];
  }>(
    `{
      "requirements": *[_type == "complianceRequirement" && !(_id in path("drafts.**")) && isActive != false]
        | order(category asc, coalesce(order, 999) asc, title asc) { ${requirementFields} },
      "franchises": *[_type == "franchisee" && !(_id in path("drafts.**")) && isActive == true && slug.current != $headOffice${filter}]
        | order(lower(coalesce(territory, companyName)) asc) {
          _id, "name": coalesce(territory, companyName), "companyName": coalesce(companyName, ""), "joined": _createdAt,
          "lastReminded": *[_type == "complianceReminder" && franchise._ref == ^._id] | order(sentAt desc)[0].sentAt
        },
      "records": *[_type == "complianceRecord" && !(_id in path("drafts.**"))${refFilter}] { ${recordFields} },
      "settings": *[_type == "complianceSetting" && !(_id in path("drafts.**"))${refFilter}] {
        "franchiseId": franchise._ref, "requirementId": requirement._ref,
        "notApplicable": notApplicable == true, "extraDays": coalesce(extraDays, 0)
      }
    }`,
    { headOffice: HEAD_OFFICE_SLUG, franchiseId: franchiseId || '' }
  );
  return { ...data, requirements: data.requirements.map(toRequirement) };
}

// ─── Working out states ─────────────────────────────────────────

function stateFromDue(due: string | null, today: string, remindBefore: number): ItemState {
  if (!due) return 'todo';
  if (due < today) return 'overdue';
  return daysBetween(today, due) <= remindBefore ? 'dueSoon' : 'todo';
}

function stateFromRecord(record: ComplianceRecord): ItemState | null {
  if (record.status === 'approved') return 'done';
  if (record.status === 'notApplicable') return 'notApplicable';
  if (record.status === 'submitted') return 'submitted';
  if (record.status === 'returned') return 'returned';
  return null;
}

/** Rolling items (annual with expiry, ongoing): valid until the expiry, or a year after approval */
function rollingExpiry(requirement: Requirement, record: ComplianceRecord): string | null {
  if (requirement.frequency === 'ongoing' || !record.expiresOn) {
    const approved = (record.reviewedAt || record.submittedAt || '').slice(0, 10);
    return approved ? addDays(approved, 365) : null;
  }
  return record.expiresOn;
}

function itemsFor(requirement: Requirement, franchise: Franchise, records: ComplianceRecord[], setting: Setting | undefined, today: string): ComplianceItem[] {
  const base = { requirement, extraDays: setting?.extraDays || 0 };
  const shift = (due: string | null) => (due && base.extraDays ? addDays(due, base.extraDays) : due);
  const joined = franchise.joined.slice(0, 10);
  const from = requirement.startsOn > joined ? requirement.startsOn : joined;

  if (setting?.notApplicable) {
    return [{ ...base, key: `${requirement._id}:na`, periodKey: null, periodLabel: null, due: null, state: 'notApplicable', record: null, validUntil: null }];
  }

  // One period per month / week / year
  if (isCalendarRule(requirement)) {
    return calendarPeriods(requirement, today, from).map((p) => {
      const record = records.find((r) => r.period === p.key) || null;
      const due = shift(p.due);
      return {
        ...base,
        key: `${requirement._id}:${p.key}`,
        periodKey: p.key,
        periodLabel: p.label,
        due,
        state: (record && stateFromRecord(record)) || stateFromDue(due, today, requirement.remindBefore),
        record,
        validUntil: null,
      };
    });
  }

  // Once
  if (requirement.frequency === 'once') {
    const record = records.find((r) => r.period === 'once') || null;
    const due = shift(onceDue(requirement, from));
    return [
      {
        ...base,
        key: `${requirement._id}:once`,
        periodKey: 'once',
        periodLabel: null,
        due,
        state: (record && stateFromRecord(record)) || stateFromDue(due, today, requirement.remindBefore),
        record,
        validUntil: null,
      },
    ];
  }

  // Rolling: annual with an expiry date, or ongoing standards confirmed each year
  const latest = [...records].sort((a, b) => (b.submittedAt || b.reviewedAt || '').localeCompare(a.submittedAt || a.reviewedAt || ''))[0] || null;
  const key = `${requirement._id}:rolling`;
  if (!latest) {
    const due = shift(onceDue(requirement, from));
    return [{ ...base, key, periodKey: null, periodLabel: null, due, state: stateFromDue(due, today, requirement.remindBefore), record: null, validUntil: null }];
  }
  const recordState = stateFromRecord(latest);
  if (recordState !== 'done') {
    return [{ ...base, key, periodKey: latest.period, periodLabel: null, due: null, state: recordState || 'todo', record: latest, validUntil: null }];
  }
  const expiry = shift(rollingExpiry(requirement, latest));
  const state: ItemState = !expiry ? 'done' : expiry < today ? 'overdue' : daysBetween(today, expiry) <= requirement.remindBefore ? 'dueSoon' : 'done';
  return [{ ...base, key, periodKey: state === 'done' ? latest.period : null, periodLabel: null, due: expiry, state, record: latest, validUntil: expiry }];
}

function summarise(franchise: Franchise, items: ComplianceItem[]): FranchiseCompliance {
  const counts = { overdue: 0, returned: 0, submitted: 0, dueSoon: 0, todo: 0, done: 0, applicable: 0 };
  for (const item of items) {
    if (item.state !== 'notApplicable') counts.applicable++;
    if (item.state === 'overdue') counts.overdue++;
    else if (item.state === 'returned') counts.returned++;
    else if (item.state === 'submitted') counts.submitted++;
    else if (item.state === 'dueSoon') counts.dueSoon++;
    else if (item.state === 'todo') counts.todo++;
    else if (item.state === 'done') counts.done++;
  }
  return {
    franchiseId: franchise._id,
    name: franchise.name,
    companyName: franchise.companyName,
    items,
    counts,
    compliant: counts.overdue === 0 && counts.returned === 0,
    lastReminded: franchise.lastReminded,
  };
}

function build(data: Awaited<ReturnType<typeof loadData>>, today: string): FranchiseCompliance[] {
  return data.franchises.map((franchise) => {
    const items = data.requirements.flatMap((requirement) =>
      itemsFor(
        requirement,
        franchise,
        data.records.filter((r) => r.franchiseId === franchise._id && r.requirementId === requirement._id),
        data.settings.find((s) => s.franchiseId === franchise._id && s.requirementId === requirement._id),
        today
      )
    );
    return summarise(franchise, items);
  });
}

/** One franchise's checklist (null for Head Office or an inactive franchise) */
export async function getComplianceForFranchise(franchiseId: string, today = ukToday()): Promise<FranchiseCompliance | null> {
  return build(await loadData(franchiseId), today)[0] || null;
}

/** Every franchise's checklist, for Head Office */
export async function getComplianceOverview(today = ukToday()): Promise<FranchiseCompliance[]> {
  return build(await loadData(), today);
}

/** Submissions waiting for Head Office, oldest first */
export async function getReviewQueue(): Promise<(ComplianceRecord & { franchiseName: string; requirementTitle: string; periodLabel: string | null })[]> {
  const rows = await sanityWriteClient.fetch<(ComplianceRecord & { franchiseName: string; requirementTitle: string; frequency: string })[]>(
    `*[_type == "complianceRecord" && status == "submitted" && !(_id in path("drafts.**"))] | order(submittedAt asc) {
      ${recordFields},
      "franchiseName": coalesce(franchise->territory, franchise->companyName, "Franchise"),
      "requirementTitle": coalesce(requirement->title, "Requirement"),
      "frequency": requirement->frequency
    }`
  );
  return rows.map((r) => ({ ...r, periodLabel: periodLabel(r.period) }));
}

/** "September 2026", "Week of 29 Sept 2026", "2026", or null for one-off and rolling items */
export function periodLabel(period: string | null | undefined): string | null {
  if (!period) return null;
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' });
  }
  if (/^\d{4}$/.test(period)) return period;
  if (/^\d{4}-W\d{2}$/.test(period)) return `Week ${Number(period.slice(6))}, ${period.slice(0, 4)}`;
  return null;
}

/** "Due 30 Sept 2026", "Overdue since …", "Valid until …" */
export function dueText(item: Pick<ComplianceItem, 'state' | 'due' | 'validUntil'>): string {
  if (item.state === 'done') return item.validUntil ? `Valid until ${formatUkDate(item.validUntil)}` : 'Done';
  if (!item.due) return item.state === 'todo' ? 'No deadline' : '';
  return item.state === 'overdue' ? `Overdue since ${formatUkDate(item.due)}` : `Due ${formatUkDate(item.due)}`;
}
