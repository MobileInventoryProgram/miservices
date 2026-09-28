import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { franchiseActions } from '@/lib/compliance/actions';
import { getComplianceForFranchise } from '@/lib/compliance/status';
import { ukToday } from '@/lib/dates';
import { getMemberScope } from '@/lib/members-access';
import ActionsList from './ActionsList';

export const metadata: Metadata = {
  title: 'Actions | Members Area | miServices',
};

/** A franchise's to-do list from Head Office: what to send or confirm, and by when */
export default async function ActionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role === 'admin') redirect('/members/franchisees/compliance');

  const scope = await getMemberScope(session);
  const compliance = scope?.franchiseeId ? await getComplianceForFranchise(scope.franchiseeId) : null;
  const { actions, waiting } = franchiseActions(compliance);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Actions" intro="Things Head Office needs from you. Send or confirm each one and it comes off your list." width="4xl" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ActionsList actions={actions} waiting={waiting} today={ukToday()} />
      </div>
    </div>
  );
}
