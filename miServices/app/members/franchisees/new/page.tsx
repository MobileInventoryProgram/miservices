import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import NewFranchiseeForm from './NewFranchiseeForm';

export const metadata: Metadata = {
  title: 'Add Franchisee | Members Area | miServices',
};

export default async function NewFranchiseePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members');

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Add franchisee"
        intro="The franchise stays hidden from Our Network until you switch it on, so you can finish their profile first."
        breadcrumbs={[{ label: 'Franchisees', href: '/members/franchisees' }, { label: 'Add franchisee' }]}
        width="3xl"
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <NewFranchiseeForm />
      </div>
    </div>
  );
}
