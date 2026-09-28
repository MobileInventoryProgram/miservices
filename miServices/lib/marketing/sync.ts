import 'server-only';
import { formsDisabled } from '@/lib/forms';
import { sanityWriteClient } from '@/lib/sanity';
import { segmentId, type ListKey } from './lists';
import { addToSegment, allSegmentContacts, isMarketingConfigured, removeFromSegment, upsertContact } from './resend';

/**
 * Keeping Resend's marketing lists in step with the Members Area. Contacts
 * stay in Sanity; only people who agreed to marketing are copied to Resend,
 * and unsubscribes come back through the webhook.
 */

const isEmail = (email: unknown): email is string => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Everything about a contact the lists need */
interface ContactForSync {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  clientType?: string;
  archived?: boolean;
  franchiseName?: string;
  marketing?: { consent?: boolean; unsubscribedAt?: string | null };
}

const CONTACT_FOR_SYNC = `{ _id, firstName, lastName, companyName, email, clientType, archived, "franchiseName": franchise->companyName, marketing }`;

/**
 * Put a CRM contact on (or take them off) the Customers list to match their
 * consent. Records the outcome on the contact; never throws, so saving a
 * contact never fails because Resend is down.
 */
export async function syncContact(contactId: string, previousEmail?: string | null): Promise<{ ok: boolean; error?: string }> {
  if (!isMarketingConfigured()) return { ok: false, error: 'Email marketing is not set up' };
  try {
    const contact = await sanityWriteClient.fetch<ContactForSync | null>(`*[_type == "contact" && _id == $id][0] ${CONTACT_FOR_SYNC}`, { id: contactId });
    if (!contact) return { ok: true };
    const customers = await segmentId('customers');
    const email = contact.email?.trim().toLowerCase();

    // A changed email: the old address comes off the list
    if (previousEmail && isEmail(previousEmail) && previousEmail.toLowerCase() !== email) await removeFromSegment(previousEmail.toLowerCase(), customers);

    const wanted = !contact.archived && !!contact.marketing?.consent && isEmail(email);
    if (wanted) {
      const { unsubscribed } = await upsertContact({
        email: email!,
        firstName: contact.firstName,
        lastName: contact.lastName,
        properties: {
          source: 'crm',
          company: contact.companyName || '',
          client_type: contact.clientType || '',
          franchise: contact.franchiseName || '',
          crm_id: contact._id,
        },
      });
      await addToSegment(email!, customers);
      const patch: Record<string, unknown> = { 'marketing.syncedAt': new Date().toISOString() };
      if (unsubscribed && !contact.marketing?.unsubscribedAt) patch['marketing.unsubscribedAt'] = new Date().toISOString();
      await sanityWriteClient.patch(contactId).setIfMissing({ marketing: {} }).set(patch).unset(['marketing.syncError']).commit();
    } else if (isEmail(email)) {
      await removeFromSegment(email!, customers);
      await sanityWriteClient
        .patch(contactId)
        .setIfMissing({ marketing: {} })
        .set({ 'marketing.syncedAt': new Date().toISOString() })
        .unset(['marketing.syncError'])
        .commit();
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Marketing sync failed for contact ${contactId}:`, message);
    await sanityWriteClient
      .patch(contactId)
      .setIfMissing({ marketing: {} })
      .set({ 'marketing.syncError': message.slice(0, 200) })
      .commit()
      .catch(() => undefined);
    return { ok: false, error: message };
  }
}

/** Re-sync every CRM contact who agreed to marketing (the Lists tab's "Sync" button) */
export async function syncAllContacts(): Promise<{ synced: number; failed: number }> {
  const ids = await sanityWriteClient.fetch<string[]>(`*[_type == "contact" && marketing.consent == true && !(_id in path("drafts.**"))]._id`);
  let synced = 0;
  let failed = 0;
  for (const id of ids) {
    const result = await syncContact(id);
    if (result.ok) synced++;
    else failed++;
  }
  return { synced, failed };
}

/**
 * Someone ticked marketing consent on a website form. They go straight onto
 * a list in Resend (they aren't CRM contacts). Never throws, and gives up
 * after 8 seconds so the form still answers quickly.
 */
export async function addWebsiteSignup(input: { email: string; firstName?: string; lastName?: string; company?: string; source: string; list?: ListKey }) {
  if (!isMarketingConfigured() || !isEmail(input.email)) return;
  if (formsDisabled()) {
    console.log(`[forms disabled] marketing sign-up from ${input.source} not added`);
    return;
  }
  const work = (async () => {
    const email = input.email.trim().toLowerCase();
    await upsertContact({
      email,
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      properties: { source: input.source, company: input.company?.trim() || '' },
    });
    await addToSegment(email, await segmentId(input.list || 'customers'));
  })();
  try {
    await Promise.race([work, new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), 8000))]);
  } catch (error) {
    console.error(`Marketing sign-up from ${input.source} failed:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Make the Franchise network list match the network: franchise owners and
 * active franchisee logins. People who left come off; anyone who has
 * unsubscribed stays unsubscribed.
 */
export async function syncFranchiseNetwork(): Promise<{ added: number; removed: number; total: number }> {
  type Person = { email?: string; first?: string; last?: string; franchise?: string };
  const people = await sanityWriteClient.fetch<{ owners: Person[]; logins: Person[] }>(`{
    "owners": *[_type == "franchisee" && isActive != false && !(_id in path("drafts.**"))].owners[]{ email, "first": firstName, "last": lastName, "franchise": ^.companyName },
    "logins": *[_type == "member" && isActive == true && role == "franchisee"]{ email, "first": string::split(name, " ")[0], "franchise": franchisee->companyName }
  }`);
  const wanted = new Map<string, Person>();
  for (const p of [...people.owners, ...people.logins]) {
    const email = p.email?.trim().toLowerCase();
    if (isEmail(email) && !wanted.has(email!)) wanted.set(email!, p);
  }

  const network = await segmentId('network');
  const current = await allSegmentContacts(network);
  const have = new Set(current.map((c) => c.email.toLowerCase()));

  let added = 0;
  for (const [email, p] of Array.from(wanted)) {
    if (have.has(email)) continue;
    await upsertContact({ email, firstName: p.first || undefined, lastName: p.last || undefined, properties: { source: 'franchise-network', franchise: p.franchise || '' } });
    await addToSegment(email, network);
    added++;
  }
  let removed = 0;
  for (const c of current) {
    if (wanted.has(c.email.toLowerCase())) continue;
    await removeFromSegment(c.id, network);
    removed++;
  }
  return { added, removed, total: wanted.size };
}

/** An unsubscribe (or resubscribe) in Resend, reflected on matching CRM contacts */
export async function recordSubscription(email: string, unsubscribed: boolean) {
  const ids = await sanityWriteClient.fetch<string[]>(`*[_type == "contact" && lower(email) == $email && !(_id in path("drafts.**"))]._id`, {
    email: email.trim().toLowerCase(),
  });
  for (const id of ids) {
    const patch = sanityWriteClient.patch(id).setIfMissing({ marketing: {} });
    await (unsubscribed ? patch.set({ 'marketing.unsubscribedAt': new Date().toISOString() }) : patch.unset(['marketing.unsubscribedAt'])).commit();
  }
  return ids.length;
}
