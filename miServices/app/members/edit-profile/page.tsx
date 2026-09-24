import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession, urlFor } from '@/lib/sanity';
import EditProfileForm from './EditProfileForm';

export const metadata: Metadata = {
  title: 'Edit Profile | Franchise Login | miServices',
};

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (!session.user.franchiseeId && !session.user.territory) {
    redirect('/members');
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

  const firstOwner = franchisee.owners?.[0];
  const ownerProfilePictureUrl = firstOwner?.profilePicture?.asset?.url || null;

  return (
    <EditProfileForm
      territory={franchisee.territory || session.user.territory || ''}
      initialData={{
        locationDescription: franchisee.locationDescription || [],
        ownerFirstName: firstOwner?.firstName || '',
        ownerLastName: firstOwner?.lastName || '',
        ownerEmail: firstOwner?.email || '',
        ownerPhone: firstOwner?.phone || '',
        ownerProfilePictureUrl,
        townsCities: franchisee.townsCities || '',
        testimonials: (franchisee.testimonials || []).map((t, i) => ({
          _key: t._key || `testimonial-${i}`,
          clientName: t.clientName || '',
          clientRole: t.clientRole || '',
          quote: t.quote || '',
          rating: t.rating ?? 5,
        })),
        qualifications: {
          yearsExperience: franchisee.qualifications?.yearsExperience ?? null,
          dbsChecked: franchisee.qualifications?.dbsChecked ?? false,
          certifications: franchisee.qualifications?.certifications || [],
          additionalInfo: franchisee.qualifications?.additionalInfo || '',
        },
        teamMembers: (franchisee.teamMembers || []).map((tm, i) => ({
          _key: tm._key || `team-${i}`,
          name: tm.name || '',
          role: tm.role || '',
          bio: tm.bio || '',
          photoUrl: tm.photo?.asset?.url || null,
          photoAssetId: null as string | null,
        })),
        highlightedServices: (franchisee.highlightedServices || []).map((hs, i) => ({
          _key: hs._key || `service-${i}`,
          serviceSlug: hs.serviceSlug || '',
          customServiceName: hs.customServiceName || '',
          description: hs.description || '',
        })),
        franchiseeId: franchisee._id,
      }}
    />
  );
}
