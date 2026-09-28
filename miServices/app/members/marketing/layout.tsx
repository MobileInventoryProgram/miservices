import { Metadata } from 'next';
import { FiAlertCircle } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import Tabs from '@/components/members/Tabs';
import { setupProblems } from '@/lib/marketing/lists';
import { adminOnly } from './guard';
import { MARKETING_TABS } from './tabs';

export const metadata: Metadata = {
  title: 'Email marketing | Members Area | miServices',
};

/** Head Office's marketing emails: campaigns and mailing lists, sent through Resend */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  await adminOnly();
  const problems = await setupProblems();
  const blocking = problems.filter((p) => !p.startsWith('Unsubscribes'));

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Email marketing" intro="Campaigns to customers, franchise enquiries and the franchise network, sent through Resend.">
        <Tabs tabs={MARKETING_TABS} label="Email marketing sections" />
      </PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {problems.length > 0 && (
          <div className={`rounded-lg border p-4 text-sm ${blocking.length ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-gray-200 bg-white text-gray-700'}`} role="status">
            <p className="flex items-center gap-2 font-medium">
              <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
              {blocking.length ? 'Email marketing isn’t ready to send yet' : 'Nearly there'}
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
