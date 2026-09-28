import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { ukToday } from '@/lib/dates';
import { HEAD_OFFICE_SLUG } from '@/lib/franchisees/admin';
import type { FranchiseContract } from '@/lib/franchisees/contract';
import { sanityWriteClient } from '@/lib/sanity';
import ContractForm from './ContractForm';

export const metadata: Metadata = {
  title: 'Contract | Franchisee | Members Area | miServices',
};

export const dynamic = 'force-dynamic';

export default async function FranchiseContractPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members/actions');

  const franchise = await sanityWriteClient.fetch<{ _id: string; slug?: string; contract?: FranchiseContract } | null>(
    `*[_type == "franchisee" && _id == $id][0] { _id, "slug": slug.current, contract }`,
    { id: params.id }
  );
  if (!franchise) notFound();
  if (franchise.slug === HEAD_OFFICE_SLUG) redirect(`/members/franchisees/${params.id}`);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <ContractForm franchiseId={franchise._id} contract={franchise.contract || null} today={ukToday()} />
    </div>
  );
}
