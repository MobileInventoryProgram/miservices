import { getContactsForScope, contactName } from '@/lib/crm/contacts';
import type { MemberScope } from '@/lib/members-access';
import { getAdminPriceLists, getPriceListsForFranchisee } from '@/lib/sanity';
import { getQuoteTemplate } from '@/lib/quote/quotes';
import type { QuoteTemplate } from '@/lib/quote/template';

/** Contacts, price lists and template for the quote builder, for one franchise */
export async function getBuilderData(scope: MemberScope, franchiseId: string) {
  // A quote only uses the contacts of the franchise it belongs to
  const franchiseScope: MemberScope = { isAdmin: false, memberId: scope.memberId, franchiseeId: franchiseId };
  const [contacts, lists, adminTemplates, template] = await Promise.all([
    getContactsForScope(franchiseScope),
    getPriceListsForFranchisee(franchiseId),
    scope.isAdmin ? getAdminPriceLists() : Promise.resolve([]),
    getQuoteTemplate(),
  ]);

  const priceLists: { _id: string; title: string; group: string; isDefault?: boolean }[] = [
    ...lists.filter((l) => l.isOwned).map((l) => ({ _id: l._id, title: l.title, group: 'My price lists', isDefault: l.isDefault })),
    ...lists.filter((l) => !l.isOwned).map((l) => ({ _id: l._id, title: l.title, group: 'Shared price lists' })),
  ];
  // Admins can also quote from templates that aren't shared with franchisees
  for (const list of adminTemplates) {
    if (!priceLists.some((p) => p._id === list._id)) {
      priceLists.push({ _id: list._id, title: list.title, group: 'Head Office templates' });
    }
  }

  return {
    template,
    priceLists,
    contacts: contacts.map((c) => ({
      _id: c._id,
      name: contactName(c),
      companyName: c.companyName,
      email: c.email,
      propertyCount: c.propertyCount,
      jobTypes: c.jobTypes,
    })),
  };
}

/** Template text for editable sections, keyed by section */
export function editableDefaults(template: QuoteTemplate): Record<string, string> {
  return Object.fromEntries(template.sections.filter((s) => s.mode === 'editable').map((s) => [s.key, s.text]));
}

export function defaultValidUntil(template: QuoteTemplate): string {
  return new Date(Date.now() + template.validityDays * 86400000).toISOString().slice(0, 10);
}
