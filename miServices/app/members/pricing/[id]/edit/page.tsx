import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession, getOwnedPriceList } from '@/lib/sanity';
import PriceListEditor from '@/components/pricing/PriceListEditor';

export const metadata: Metadata = {
  title: 'Edit Price List | Franchise Login | miServices',
};

export default async function EditPriceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (!session.user.franchiseeId && !session.user.territory) {
    redirect('/members');
  }

  const franchisee = await getFranchiseeForSession(session);

  if (!franchisee) {
    redirect('/members/pricing');
  }

  const { id } = await params;
  const priceList = await getOwnedPriceList(id, franchisee._id);

  if (!priceList) {
    notFound();
  }

  return (
    <PriceListEditor
      mode="franchise"
      saveUrl={`/api/members/pricing/${priceList._id}`}
      setDefaultUrl={`/api/members/pricing/${priceList._id}/default`}
      backHref="/members/pricing"
      backLabel="Back to My Pricing"
      initialTitle={priceList.title}
      initialIsDefault={priceList.isDefault}
      initialServiceRows={priceList.serviceRows || []}
      initialFlatRates={priceList.flatRates}
      initialAdditionalRoomRates={priceList.additionalRoomRates || { unfurnishedPerRoom: 0, furnishedPerRoom: 0 }}
      initialCancellationFee={priceList.cancellationFee ?? 0}
    />
  );
}
