import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getContactDashboard } from '@/lib/crm/contacts';
import { getPendingDocumentDrafts } from '@/lib/documents/admin';
import { getMemberScope } from '@/lib/members-access';
import { getQuoteDashboard } from '@/lib/quote/quotes';
import { getFranchiseeForSession, getMemberDocuments, type DocumentTargetingParams } from '@/lib/sanity';
import { getComplianceForFranchise, getComplianceOverview } from '@/lib/compliance/status';
import MembersDashboard, { type DashboardData } from './MembersDashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Members Area | miServices',
  description: 'miServices Members Area dashboard.',
};

/** Documents published or updated this recently count as new */
const NEW_DOCUMENT_DAYS = 14;

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const isAdmin = session.user.role === 'admin';
  const targeting: DocumentTargetingParams = {
    memberId: session.user.id,
    franchiseeId: session.user.franchiseeId || null,
    role: session.user.role,
  };

  const [docs, franchisee, scope] = await Promise.all([getMemberDocuments(targeting), getFranchiseeForSession(session), getMemberScope(session)]);
  const [quotes, contacts, drafts, compliance] = await Promise.all([
    scope ? getQuoteDashboard(scope) : Promise.resolve(null),
    scope ? getContactDashboard(scope) : Promise.resolve(null),
    isAdmin ? getPendingDocumentDrafts() : Promise.resolve(null),
    complianceSummary(isAdmin, scope?.franchiseeId || null),
  ]);

  const documents = docs.filter((doc) => doc.category === 'documents' && doc.subcategory);
  const newSince = Date.now() - NEW_DOCUMENT_DAYS * 86_400_000;
  const newDocuments = documents
    .filter((doc) => doc.publishedAt && Date.parse(doc.publishedAt) >= newSince)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .map((doc) => ({ title: doc.title, href: `/members/documents/${doc.subcategory}/${doc.slug}`, publishedAt: doc.publishedAt }));

  const data: DashboardData = {
    firstName: (session.user.name || '').split(' ')[0] || 'there',
    territory: franchisee?.territory || session.user.territory || (isAdmin ? 'Head Office' : null),
    isAdmin,
    canCreate: !!scope?.franchiseeId,
    quotes,
    contacts,
    documents: { total: documents.length, newItems: newDocuments },
    drafts,
    compliance,
  };

  return <MembersDashboard data={data} />;
}

/** Compliance for the dashboard: a franchise's own items, or Head Office's summary */
async function complianceSummary(isAdmin: boolean, franchiseeId: string | null): Promise<DashboardData['compliance']> {
  try {
    if (isAdmin) {
      const overview = await getComplianceOverview();
      if (!overview.length) return null;
      return {
        kind: 'admin',
        total: overview.length,
        notCompliant: overview.filter((f) => !f.compliant).length,
        awaitingReview: overview.reduce((n, f) => n + f.counts.submitted, 0),
      };
    }
    const own = franchiseeId ? await getComplianceForFranchise(franchiseeId) : null;
    if (!own || !own.items.length) return null;
    const ORDER = ['overdue', 'returned', 'dueSoon'];
    return {
      kind: 'franchise',
      counts: own.counts,
      items: own.items
        .filter((i) => ORDER.includes(i.state))
        .sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || (a.due || '').localeCompare(b.due || ''))
        .slice(0, 4)
        .map((i) => ({ title: `${i.requirement.title}${i.periodLabel ? ` (${i.periodLabel})` : ''}`, state: i.state, due: i.due })),
    };
  } catch (error) {
    console.error('Dashboard compliance failed:', error);
    return null;
  }
}
