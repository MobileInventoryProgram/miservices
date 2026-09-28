import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { profileFormData } from '@/lib/franchisees/profile';
import { getFranchiseeForSession } from '@/lib/sanity';
import EditProfileForm from './EditProfileForm';

export const metadata: Metadata = {
  title: 'Edit Profile | Members Area | miServices',
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

  return (
    <EditProfileForm
      territory={franchisee.territory || session.user.territory || ''}
      initialData={profileFormData(franchisee)}
    />
  );
}
