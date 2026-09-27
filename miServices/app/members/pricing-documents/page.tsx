import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import { getAdminPriceLists, getFranchiseeForSession, getPriceListsForFranchisee } from '@/lib/sanity';
import PricingDocumentsListing, { type LeafletListItem } from './PricingDocumentsListing';

export const metadata: Metadata = {
  title: 'Pricing Documents | Members Area | miServices',
};

export default async function PricingDocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const isAdmin = session.user.role === 'admin';
  const franchisee = await getFranchiseeForSession(session);

  if (franchisee) {
    const lists = await getPriceListsForFranchisee(franchisee._id);
    const toItem = (list: (typeof lists)[number]): LeafletListItem => ({
      _id: list._id,
      title: list.title,
      isDefault: list.isDefault,
      shareToken: list.shareEnabled ? list.shareToken || null : null,
      canTurnOffLink: isAdmin || list.isOwned,
    });

    return (
      <PricingDocumentsListing
        text={(await getMembersText()).pricingDocuments}
        ownedLists={lists.filter((l) => l.isOwned).map(toItem)}
        sharedLists={lists.filter((l) => !l.isOwned).map(toItem)}
        sharedHeading="Shared Price Lists"
      />
    );
  }

  // Head office admins without a franchisee see every admin template
  if (isAdmin) {
    const templates = await getAdminPriceLists();
    return (
      <PricingDocumentsListing
        text={(await getMembersText()).pricingDocuments}
        sharedLists={templates.map((list) => ({
          _id: list._id,
          title: list.title,
          isDefault: list.isDefault,
          shareToken: list.shareEnabled ? list.shareToken || null : null,
          canTurnOffLink: true,
        }))}
        sharedHeading="Price List Templates"
      />
    );
  }

  redirect('/members');
}
