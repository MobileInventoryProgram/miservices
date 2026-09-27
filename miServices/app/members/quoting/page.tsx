import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import { getContactForScope } from '@/lib/crm/contacts';
import { contactName } from '@/lib/crm/types';
import { getMemberScope } from '@/lib/members-access';
import { TABLE_PAGE_SIZE, pageInfo, parsePage } from '@/lib/pagination';
import { getQuoteFranchiseOptions, getQuotesPage } from '@/lib/quote/quotes';
import { getMemberDocumentsByCategory } from '@/lib/sanity';
import QuotesListing from './QuotesListing';

export const metadata: Metadata = {
  title: 'Quotes | Members Area | miServices',
};

type Search = { q?: string; status?: string; franchise?: string; contact?: string; page?: string };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const scope = await getMemberScope(session);
  if (!scope) {
    redirect('/members');
  }

  const search = await searchParams;
  const filters = {
    q: search.q || '',
    status: search.status || '',
    franchise: scope.isAdmin ? search.franchise || '' : '',
    contact: search.contact || '',
  };
  const page = parsePage(search.page);

  const [{ items, total }, guides, franchises, contact] = await Promise.all([
    getQuotesPage(scope, { ...filters, page, pageSize: TABLE_PAGE_SIZE }),
    getMemberDocumentsByCategory('quoting', {
      memberId: session.user.id,
      franchiseeId: session.user.franchiseeId || null,
      role: session.user.role,
    }),
    scope.isAdmin ? getQuoteFranchiseOptions() : Promise.resolve([]),
    filters.contact ? getContactForScope(scope, filters.contact) : Promise.resolve(null),
  ]);

  // Past the last page (e.g. an old link after records were removed): go to the last real page
  const lastPage = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE));
  if (page > lastPage) {
    const params = new URLSearchParams(Object.entries(search).filter(([k, v]) => k !== 'page' && typeof v === 'string' && v) as [string, string][]);
    if (lastPage > 1) params.set('page', String(lastPage));
    redirect(params.toString() ? `?${params}` : '?');
  }

  return (
    <QuotesListing
      text={(await getMembersText()).quotes}
      quotes={items}
      paging={pageInfo(total, page, TABLE_PAGE_SIZE)}
      filters={filters}
      contactLabel={contact ? contactName(contact) : null}
      isAdmin={scope.isAdmin}
      canCreate={!!scope.franchiseeId}
      franchises={franchises}
      guideCount={guides.length}
    />
  );
}
