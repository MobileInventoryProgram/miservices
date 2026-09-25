import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import {
  getFranchiseeForSession,
  getPriceListsForFranchisee,
} from '@/lib/sanity';
import PricingListing from './PricingListing';

export const metadata: Metadata = {
  title: 'My Pricing | Franchise Login | miServices',
};

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (!session.user.franchiseeId && !session.user.territory) {
    // Admins without a franchisee association get redirected to the admin view
    if (session.user.role === 'admin') {
      redirect('/members/pricing/admin');
    }
    redirect('/members/pricing-quoting');
  }

  const franchisee = await getFranchiseeForSession(session);

  if (!franchisee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-helvetica">
            Profile Not Found
          </h1>
          <p className="mt-2 text-gray-500">
            No franchisee profile found for your account.
          </p>
        </div>
      </div>
    );
  }

  const priceLists = await getPriceListsForFranchisee(franchisee._id);

  const ownedLists = priceLists.filter((pl) => pl.isOwned);
  const sharedTemplates = priceLists.filter((pl) => !pl.isOwned);

  return (
    <PricingListing
      text={(await getMembersText()).myPricing}
      franchiseeId={franchisee._id}
      territory={franchisee.territory || session.user.territory || ''}
      ownedLists={ownedLists}
      sharedTemplates={sharedTemplates}
    />
  );
}
