import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import EditProfileForm from '@/app/members/edit-profile/EditProfileForm';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseAdminDetail, HEAD_OFFICE_SLUG, mapPinFor } from '@/lib/franchisees/admin';
import { profileFormData } from '@/lib/franchisees/profile';
import { getFranchiseeById } from '@/lib/sanity';
import FranchiseeAdmin from './FranchiseeAdmin';

export const metadata: Metadata = {
  title: 'Franchisee | Members Area | miServices',
};

export default async function FranchiseePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members');

  const [franchisee, detail] = await Promise.all([getFranchiseeById(params.id), getFranchiseAdminDetail(params.id)]);
  if (!franchisee || !detail) notFound();

  const owner = franchisee.owners?.[0];
  const pin = await mapPinFor({ slug: franchisee.slug, postCodes: franchisee.postCodes, townsCities: franchisee.townsCities, mapTown: franchisee.mapTown });

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <FranchiseeAdmin
          franchise={{
            id: franchisee._id,
            slug: franchisee.slug,
            companyName: franchisee.companyName,
            territory: franchisee.territory || '',
            postCodes: franchisee.postCodes || '',
            townsCities: franchisee.townsCities || '',
            mapTown: franchisee.mapTown || '',
            tags: franchisee.tags || [],
            isHeadOffice: franchisee.slug === HEAD_OFFICE_SLUG,
          }}
          status={detail.status}
          checklist={{
            ownerName: !!(owner?.firstName && owner?.lastName),
            ownerEmail: !!owner?.email,
            areas: !!(franchisee.postCodes?.trim() || franchisee.townsCities?.trim() || franchisee.mapTown?.trim()),
            mapPin: pin,
            photo: !!(owner?.profilePicture?.asset || franchisee.areaImage?.asset),
            bio: !!franchisee.locationDescription?.length,
          }}
          logins={detail.logins}
          records={detail.records}
          currentMemberId={session.user.id}
        />

        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 font-helvetica">Public profile</h2>
          <p className="mb-4 text-sm text-gray-500">What visitors see on their Our Network page. The owner can also edit this from their own login.</p>
          <EditProfileForm territory={franchisee.territory || ''} initialData={profileFormData(franchisee)} adminFranchiseeId={franchisee._id} embedded />
        </section>
      </div>
    </>
  );
}
