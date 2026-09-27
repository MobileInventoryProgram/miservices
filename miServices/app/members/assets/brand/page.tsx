import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import PageHeader from '@/components/members/PageHeader';
import { getFranchiseeForSession, getMemberDocumentsByCategory } from '@/lib/sanity';
import { BRAND_ASSETS } from '@/lib/social/brand-assets';
import BrandAssetGallery from './BrandAssetGallery';
import MoreDownloads from './MoreDownloads';

export const metadata: Metadata = {
  title: 'Brand Assets | Members Area | miServices',
};

export default async function BrandAssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/members/login');
  }

  const [franchisee, files] = await Promise.all([
    getFranchiseeForSession(session),
    getMemberDocumentsByCategory('assets', {
      memberId: session.user.id,
      franchiseeId: session.user.franchiseeId || null,
      role: session.user.role,
    }),
  ]);
  const territory = franchisee?.territory && franchisee.territory !== 'Head Office' ? franchisee.territory : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Brand Assets"
        intro={(await getMembersText()).assets?.brandIntro}
        breadcrumbs={[{ label: 'Assets', href: '/members/assets' }, { label: 'Brand Assets' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <BrandAssetGallery
          assets={BRAND_ASSETS.map(({ key, label, channel, width, height, tip }) => ({ key, label, channel, width, height, tip }))}
          territory={territory}
        />

        <MoreDownloads files={files.map((doc) => ({ _id: doc._id, title: doc.title, slug: doc.slug, url: doc.file?.asset?.url }))} />
      </div>
    </div>
  );
}
