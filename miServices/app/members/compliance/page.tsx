import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiShield } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getComplianceForFranchise, getComplianceOverview, getReviewQueue } from '@/lib/compliance/status';
import { isEmailConfigured } from '@/lib/email/send';
import { getMemberScope } from '@/lib/members-access';
import Checklist from './Checklist';
import Overview from './Overview';

export const metadata: Metadata = {
  title: 'Compliance | Members Area | miServices',
};

export default async function CompliancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');

  // Head Office: every franchise
  if (session.user.role === 'admin') {
    const [overview, queue] = await Promise.all([getComplianceOverview(), getReviewQueue()]);
    return (
      <Overview
        franchises={overview.map(({ items: _items, ...f }) => f)}
        reviewCount={queue.length}
        emailConfigured={isEmailConfigured()}
      />
    );
  }

  // A franchise: its own checklist
  const scope = await getMemberScope(session);
  const compliance = scope?.franchiseeId ? await getComplianceForFranchise(scope.franchiseeId) : null;
  const c = compliance?.counts;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Compliance"
        intro="What your franchise needs to have in place, send each month, and keep up to date."
        width="5xl"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {!compliance || !c ? (
          <p className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
            <FiShield className="h-5 w-5 text-gray-400" /> Compliance isn&apos;t tracked for your account.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Overdue', value: c.overdue + c.returned, tone: c.overdue + c.returned ? 'text-red-700' : 'text-gray-900' },
                { label: 'Due soon', value: c.dueSoon, tone: c.dueSoon ? 'text-amber-700' : 'text-gray-900' },
                { label: 'Awaiting review', value: c.submitted, tone: 'text-gray-900' },
                { label: 'Done', value: `${c.done} of ${c.applicable}`, tone: 'text-green-700' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className={`mt-1 text-2xl font-bold font-helvetica ${s.tone}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <Checklist items={compliance.items} mode="franchise" />
          </>
        )}
      </div>
    </div>
  );
}
