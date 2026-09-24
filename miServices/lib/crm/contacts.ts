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
