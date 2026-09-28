import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { ukToday } from '@/lib/dates';
import { listFranchisees } from '@/lib/franchisees/admin';
import FranchiseesListing from './FranchiseesListing';

export const metadata: Metadata = {
  title: 'Franchisees | Members Area | miServices',
};

export default async function FranchiseesPage({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members');

  return <FranchiseesListing franchises={await listFranchisees()} today={ukToday()} initialFilter={searchParams.filter === 'contracts' ? 'contracts' : ''} />;
}
