import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getContactFranchiseOptions, getContactsPage } from '@/lib/crm/contacts';
import { getMemberScope } from '@/lib/members-access';
import { TABLE_PAGE_SIZE, pageInfo, parsePage } from '@/lib/pagination';
import { getMemberDocumentsByCategory } from '@/lib/sanity';
import ContactsListing from './ContactsListing';

export const metadata: Metadata = {
  title: 'Contacts | Franchise Login | miServices',
};

type Search = { q?: string; status?: string; job?: string; franchise?: string; page?: string };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Search> }) {
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
    job: search.job || '',
    franchise: scope.isAdmin ? search.franchise || '' : '',
  };
  const page = parsePage(search.page);

  const [{ items, total }, directoryDocs, franchises] = await Promise.all([
    getContactsPage(scope, { ...filters, page, pageSize: TABLE_PAGE_SIZE }),
    getMemberDocumentsByCategory('contacts', {
      memberId: session.user.id,
      franchiseeId: session.user.franchiseeId || null,
      role: session.user.role,
    }),
    scope.isAdmin ? getContactFranchiseOptions() : Promise.resolve([]),
  ]);

  // Past the last page (e.g. an old link after records were removed): go to the last real page
  const lastPage = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE));
  if (page > lastPage) {
    const params = new URLSearchParams(Object.entries(search).filter(([k, v]) => k !== 'page' && typeof v === 'string' && v) as [string, string][]);
    if (lastPage > 1) params.set('page', String(lastPage));
    redirect(params.toString() ? `?${params}` : '?');
  }

  return (
    <ContactsListing
      contacts={items}
      paging={pageInfo(total, page, TABLE_PAGE_SIZE)}
      filters={filters}
      isAdmin={scope.isAdmin}
      canCreate={!!scope.franchiseeId}
      franchises={franchises}
      directoryCount={directoryDocs.length}
    />
  );
}
