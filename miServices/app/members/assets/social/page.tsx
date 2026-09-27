import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import PageHeader from '@/components/members/PageHeader';
import SocialPostCreator from './SocialPostCreator';

export const metadata: Metadata = {
  title: 'Social Post Creator | Members Area | miServices',
};

export default async function SocialPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/members/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Social Post Creator"
        intro={(await getMembersText()).assets?.socialIntro}
        breadcrumbs={[{ label: 'Assets', href: '/members/assets' }, { label: 'Social Post Creator' }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SocialPostCreator />
      </div>
    </div>
  );
}
