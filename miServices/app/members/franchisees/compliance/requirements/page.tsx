import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import { getDocumentIndex } from '@/lib/help/search';
import { sanityWriteClient } from '@/lib/sanity';
import RequirementsManager, { type EditableRequirement } from './RequirementsManager';

export const metadata: Metadata = {
  title: 'Requirements | Compliance | Members Area | miServices',
};

export default async function RequirementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/members/login');
  if (session.user.role !== 'admin') redirect('/members/actions');

  const [requirements, index] = await Promise.all([
    sanityWriteClient.fetch<EditableRequirement[]>(
      `*[_type == "complianceRequirement" && !(_id in path("drafts.**"))] | order(category asc, coalesce(order, 999) asc, title asc) {
        _id, title, "description": coalesce(description, ""), category, frequency, evidence, "askExpiry": askExpiry == true,
        dueWithinDays, monthlyDay, "monthOffset": monthOffset == true, weeklyDay, annualMonth, annualDay,
        "remindBefore": coalesce(remindBefore, 7), "remindEvery": coalesce(remindEvery, 7), "isActive": isActive != false,
        "sources": coalesce(sources[] { "documentId": document._ref, headingKey, headingText }, [])
      }`
    ),
    getDocumentIndex(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Requirements"
        intro="What every franchise has to comply with. Changes apply to all franchises straight away."
        breadcrumbs={[{ label: 'Franchisees', href: '/members/franchisees' }, { label: 'Compliance', href: '/members/franchisees/compliance' }, { label: 'Requirements' }]}
        width="5xl"
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <RequirementsManager requirements={requirements} outlines={index.outlines} />
      </div>
    </div>
  );
}
