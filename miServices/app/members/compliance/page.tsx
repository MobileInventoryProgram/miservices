import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getComplianceOverview, getReviewQueue } from '@/lib/compliance/status';
import { isEmailConfigured } from '@/lib/email/send';
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

  // Franchises see their Actions instead
  redirect('/members/actions');
}
