import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getComplianceForFranchise } from '@/lib/compliance/status';
import { formatUkDate } from '@/lib/dates';
import { isEmailConfigured } from '@/lib/email/send';
import Checklist from '../../Checklist';
import RemindButton from './RemindButton';

export const metadata: Metadata = {
  title: 'Franchise compliance | Members Area | miServices',
};

/** Head Office: one franchise's full checklist, with review and tick-off controls */
export default async function FranchiseCompliancePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members/compliance');

  const compliance = await getComplianceForFranchise(params.id);
  if (!compliance) notFound();
  const c = compliance.counts;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {compliance.name}
            {compliance.compliant ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <FiCheckCircle className="h-3.5 w-3.5" /> Compliant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                <FiAlertCircle className="h-3.5 w-3.5" /> Not compliant
              </span>
            )}
          </span>
        }
        intro={`${c.done} of ${c.applicable} done · ${c.overdue + c.returned} overdue · ${c.submitted} awaiting review · last reminded ${
          compliance.lastReminded ? formatUkDate(compliance.lastReminded.slice(0, 10)) : 'never'
        }`}
        breadcrumbs={[{ label: 'Compliance', href: '/members/compliance' }, { label: compliance.name }]}
        actions={<RemindButton franchiseId={compliance.franchiseId} emailConfigured={isEmailConfigured()} />}
        width="5xl"
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Checklist items={compliance.items} franchiseId={compliance.franchiseId} />
      </div>
    </div>
  );
}
