import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { listUsers } from '@/lib/franchisees/admin';
import { sanityWriteClient } from '@/lib/sanity';
import UsersListing from './UsersListing';

export const metadata: Metadata = {
  title: 'Users | Members Area | miServices',
};

export default async function UsersPage({ searchParams }: { searchParams: { franchise?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members');

  const [users, franchises] = await Promise.all([
    listUsers(),
    sanityWriteClient.fetch<{ id: string; name: string }[]>(
      `*[_type == "franchisee" && isActive == true && !(_id in path("drafts.**"))] | order(lower(coalesce(territory, companyName)) asc) {
        "id": _id, "name": coalesce(territory, companyName)
      }`
    ),
  ]);

  return <UsersListing users={users} franchises={franchises} currentMemberId={session.user.id} initialFranchise={searchParams.franchise || ''} />;
}
