import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import { getQuotesForScope } from '@/lib/quote/quotes';
import { getMemberDocumentsByCategory } from '@/lib/sanity';
import QuotesListing from './QuotesListing';

export const metadata: Metadata = {
  title: 'Quotes | Franchise Login | miServices',
};

export default async function QuotesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const scope = await getMemberScope(session);
  if (!scope) {
    redirect('/members/pricing-quoting');
  }

  const [quotes, guides] = await Promise.all([
    getQuotesForScope(scope),
    getMemberDocumentsByCategory('quoting', {
      memberId: session.user.id,
      franchiseeId: session.user.franchiseeId || null,
      role: session.user.role,
    }),
  ]);

  return <QuotesListing quotes={quotes} isAdmin={scope.isAdmin} canCreate={!!scope.franchiseeId} guideCount={guides.length} />;
}
