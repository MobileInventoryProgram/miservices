import { sanityWriteClient } from '@/lib/sanity';
import { scopeFilter, type MemberScope } from '@/lib/members-access';
import type { Contact } from '@/lib/crm/types';

export type { Contact } from '@/lib/crm/types';
export { contactName, franchisesIn } from '@/lib/crm/types';

/**
 * Contact reads, always limited to the member's scope. Uses the uncached
 * client so a contact shows up immediately after it's saved.
 */

const contactFields = `
  _id,
  firstName, lastName, companyName, email, phone, address, postcode,
  clientType, propertyCount, jobTypes, status, source, notes,
  "createdAt": coalesce(createdAt, _createdAt),
  "updatedAt": coalesce(updatedAt, _updatedAt),
  "franchiseId": franchise._ref,
  "franchiseName": franchise->companyName,
  "ownerId": owner._ref,
  "ownerName": owner->name
`;


export async function getContactsForScope(scope: MemberScope): Promise<Contact[]> {
  try {
    return await sanityWriteClient.fetch<Contact[]>(
      `*[_type == "contact" && archived != true${scopeFilter(scope)}]
        | order(coalesce(updatedAt, _updatedAt) desc) { ${contactFields} }`,
      { franchiseeId: scope.franchiseeId }
    );
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function getContactForScope(scope: MemberScope, contactId: string): Promise<Contact | null> {
  try {
    return await sanityWriteClient.fetch<Contact | null>(
      `*[_type == "contact" && _id == $contactId && archived != true${scopeFilter(scope)}][0] { ${contactFields} }`,
      { contactId, franchiseeId: scope.franchiseeId }
    );
  } catch (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
}

// ─── Paged list ─────────────────────────────────────────────────

export interface ContactFilters {
  q?: string;
  status?: string;
  job?: string;
  franchise?: string;
  page: number;
  pageSize: number;
}

/** Search/filter in the database and return one page plus the total */
export async function getContactsPage(scope: MemberScope, filters: ContactFilters): Promise<{ items: Contact[]; total: number }> {
  let filter = `_type == "contact" && archived != true${scopeFilter(scope)}`;
  const params: Record<string, unknown> = { franchiseeId: scope.franchiseeId };
  if (filters.status) {
    filter += ' && status == $status';
    params.status = filters.status;
  }
  if (filters.job) {
    filter += ' && $job in jobTypes';
    params.job = filters.job;
  }
  if (filters.franchise && scope.isAdmin) {
    filter += ' && franchise._ref == $franchise';
    params.franchise = filters.franchise;
  }
  const q = filters.q?.trim().replace(/[*"\\]/g, '');
  if (q) {
    filter += ' && [firstName, lastName, companyName, email, phone, postcode] match $q';
    params.q = q.split(/\s+/).map((word) => `${word}*`);
  }
  const start = (filters.page - 1) * filters.pageSize;
  params.start = start;
  params.end = start + filters.pageSize;

  try {
    return await sanityWriteClient.fetch<{ items: Contact[]; total: number }>(
      `{
        "items": *[${filter}] | order(coalesce(updatedAt, _updatedAt) desc) [$start...$end] { ${contactFields} },
        "total": count(*[${filter}])
      }`,
      params
    );
  } catch (error) {
    console.error('Error fetching contacts page:', error);
    return { items: [], total: 0 };
  }
}

export async function countContactsForScope(scope: MemberScope): Promise<number> {
  try {
    return await sanityWriteClient.fetch<number>(`count(*[_type == "contact" && archived != true${scopeFilter(scope)}])`, {
      franchiseeId: scope.franchiseeId,
    });
  } catch {
    return 0;
  }
}

/** Contacts, and leads added since the start of this month, for the dashboard */
export async function getContactDashboard(scope: MemberScope, now = new Date()): Promise<{ total: number; newLeads: number }> {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const mine = `_type == "contact" && archived != true${scopeFilter(scope)}`;
  try {
    return await sanityWriteClient.fetch<{ total: number; newLeads: number }>(
      `{ "total": count(*[${mine}]), "newLeads": count(*[${mine} && status == "lead" && coalesce(createdAt, _createdAt) >= $monthStart]) }`,
      { franchiseeId: scope.franchiseeId, monthStart }
    );
  } catch {
    return { total: 0, newLeads: 0 };
  }
}

/** Franchises that have contacts, for Head Office's franchise filter */
export async function getContactFranchiseOptions(): Promise<{ id: string; name: string }[]> {
  try {
    return await sanityWriteClient.fetch<{ id: string; name: string }[]>(
      `*[_type == "franchisee" && _id in *[_type == "contact" && archived != true].franchise._ref] | order(companyName asc) { "id": _id, "name": companyName }`
    );
  } catch {
    return [];
  }
}
