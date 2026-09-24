import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import {
  getAdminPriceLists,
  getMemberDocuments,
  getFranchiseeForSession,
  getPriceListsForFranchisee,
  type DocumentTargetingParams,
} from '@/lib/sanity';
import { getMemberScope } from '@/lib/members-access';
import { getQuotesForScope } from '@/lib/quote/quotes';
import PricingQuotingCards from './PricingQuotingCards';

export const metadata: Metadata = {
  title: 'Pricing & Quoting | Franchise Login | miServices',
  description: 'Your pricing, pricing documents and quoting guides.',
};

export default async function PricingQuotingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const [docs, franchisee] = await Promise.all([
    getMemberDocuments(targeting),
    getFranchiseeForSession(session),
  ]);

  const categoryCounts: Record<string, number> = {};
  for (const doc of docs) {
    categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
  }

  const scope = await getMemberScope(session);
  const quoteCount = scope ? (await getQuotesForScope(scope)).length : 0;

  // Pricing Documents are generated from price lists, so count those
  const priceLists = franchisee
    ? await getPriceListsForFranchisee(franchisee._id)
    : session.user.role === 'admin'
      ? await getAdminPriceLists()
      : [];

  return (
    <PricingQuotingCards
      userRole={session.user.role}
      hasFranchisee={!!franchisee}
      categoryCounts={categoryCounts}
      priceListCount={priceLists.length}
      quoteCount={quoteCount}
    />
  );
}
