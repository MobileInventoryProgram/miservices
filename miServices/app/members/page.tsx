import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getContactsForScope } from '@/lib/crm/contacts';
import { getMemberScope } from '@/lib/members-access';
import { getMemberDocuments, getFranchiseeForSession, type DocumentTargetingParams } from '@/lib/sanity';
import MembersDashboard from './MembersDashboard';

export const metadata: Metadata = {
  title: 'Members Dashboard | miServices',
  description: 'miServices Franchise Login dashboard.',
};

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const [docs, franchisee, scope] = await Promise.all([
    getMemberDocuments(targeting),
    getFranchiseeForSession(session),
    getMemberScope(session),
  ]);

  const categoryCounts: Record<string, number> = {};
  for (const doc of docs) {
    categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
  }
  categoryCounts.contactRecords = scope ? (await getContactsForScope(scope)).length : 0;

  return (
    <MembersDashboard
      userName={session.user.name || session.user.email}
      userTerritory={franchisee?.territory || session.user.territory || undefined}
      hasFranchisee={!!franchisee}
      categoryCounts={categoryCounts}
    />
  );
}
