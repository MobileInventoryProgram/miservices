import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession, getSharedTemplates } from '@/lib/sanity';
import DuplicateForm from './DuplicateForm';

export const metadata: Metadata = {
  title: 'Duplicate Template | My Pricing | Members Area | miServices',
};

export default async function DuplicateTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (!session.user.franchiseeId && !session.user.territory) {
    redirect('/members');
  }

  const franchisee = await getFranchiseeForSession(session);

  if (!franchisee) {
    redirect('/members/pricing');
  }

  const templates = await getSharedTemplates();

  if (templates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-helvetica">
            No Templates Available
          </h1>
          <p className="mt-2 text-gray-500">
            There are no shared templates available to duplicate.
          </p>
        </div>
      </div>
    );
  }

  const { templateId: preselectedTemplateId } = await searchParams;

  return (
    <DuplicateForm
      templates={templates}
      preselectedTemplateId={preselectedTemplateId}
    />
  );
}
