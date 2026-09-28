import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiCheckCircle } from 'react-icons/fi';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getComplianceOverview } from '@/lib/compliance/status';
import ItemRow from '../ItemRow';

export const metadata: Metadata = {
  title: 'Review queue | Compliance | Members Area | miServices',
};

/** Head Office: everything franchises have sent, waiting to be checked (oldest first) */
export default async function ReviewQueuePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members/compliance');

  const overview = await getComplianceOverview();
  const waiting = overview
    .flatMap((f) => f.items.filter((i) => i.state === 'submitted').map((item) => ({ franchise: f, item })))
    .sort((a, b) => (a.item.record?.submittedAt || '').localeCompare(b.item.record?.submittedAt || ''));

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Review queue"
        intro={`${waiting.length} submission${waiting.length === 1 ? '' : 's'} waiting. Approve, or send back with a note saying what to change.`}
        breadcrumbs={[{ label: 'Compliance', href: '/members/compliance' }, { label: 'Review queue' }]}
        width="5xl"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {waiting.length === 0 ? (
          <p className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
            <FiCheckCircle className="h-8 w-8 text-green-500" /> Nothing waiting for review.
          </p>
        ) : (
          waiting.map(({ franchise, item }) => (
            <section key={`${franchise.franchiseId}-${item.key}`}>
              <p className="mb-1 text-sm text-gray-500">
                <Link href={`/members/compliance/franchise/${franchise.franchiseId}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                  {franchise.name}
                </Link>
              </p>
              <ul className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <ItemRow item={item} franchiseId={franchise.franchiseId} defaultOpen />
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
