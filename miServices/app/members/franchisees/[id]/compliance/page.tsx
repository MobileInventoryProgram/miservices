import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getComplianceForFranchise } from '@/lib/compliance/status';
import { formatUkDate } from '@/lib/dates';
import { isEmailConfigured } from '@/lib/email/send';
import Checklist from '../../compliance/Checklist';
import RemindButton from './RemindButton';

export const metadata: Metadata = {
  title: 'Compliance | Franchisee | Members Area | miServices',
};

/** Head Office: one franchise's compliance, with review and tick-off controls */
export default async function FranchiseCompliancePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members/actions');

  const compliance = await getComplianceForFranchise(params.id);
  if (!compliance) notFound();
  const c = compliance.counts;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {compliance.compliant ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              <FiCheckCircle className="h-3.5 w-3.5" /> Compliant
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
              <FiAlertCircle className="h-3.5 w-3.5" /> Not compliant
            </span>
          )}
          <span>
            {c.done} of {c.applicable} done · {c.overdue + c.returned} overdue · {c.submitted} awaiting review · last reminded{' '}
            {compliance.lastReminded ? formatUkDate(compliance.lastReminded.slice(0, 10)) : 'never'}
          </span>
          <Link href="/members/franchisees/compliance" className="text-brand-light-blue hover:text-brand-dark-blue">
            All franchises
          </Link>
        </div>
        <RemindButton franchiseId={compliance.franchiseId} emailConfigured={isEmailConfigured()} />
      </div>
      <Checklist items={compliance.items} franchiseId={compliance.franchiseId} />
    </div>
  );
}
