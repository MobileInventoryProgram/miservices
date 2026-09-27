import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getStandardPriceList } from '@/lib/sanity';
import PriceListEditor from '@/components/pricing/PriceListEditor';

export const metadata: Metadata = {
  title: 'Edit Standard Price List | Members Area | miServices',
};

export default async function EditStandardPriceListPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }
  if (session.user.role !== 'admin') {
    redirect('/members');
  }

  const { id } = await params;
  const priceList = await getStandardPriceList(id);
  if (!priceList) {
    notFound();
  }

  return (
    <PriceListEditor
      key={priceList._id}
      mode="admin"
      saveUrl={`/api/admin/pricing/${priceList._id}`}
      backHref="/members/pricing/admin"
      backLabel="Standard price lists"
      viewHref={`/members/pricing/${priceList._id}`}
      initialTitle={priceList.title}
      initialIsDefault={!!priceList.isDefault}
      initialAvailableToFranchisees={!!priceList.availableToFranchisees}
      initialFlyerNote={priceList.flyerNote || ''}
      initialServiceRows={priceList.serviceRows || []}
      initialFlatRates={priceList.flatRates || []}
      initialAdditionalRoomRates={priceList.additionalRoomRates || { unfurnishedPerRoom: 0, furnishedPerRoom: 0 }}
      initialCancellationFee={priceList.cancellationFee ?? 0}
    />
  );
}
