import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import { getFranchiseeForSession, getMemberDocumentsByCategory } from '@/lib/sanity';
import { BRAND_ASSETS } from '@/lib/social/brand-assets';
import BrandAssetGallery from './BrandAssetGallery';
import MoreDownloads from './MoreDownloads';

export const metadata: Metadata = {
  title: 'Brand Assets | Franchise Login | miServices',
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
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members/assets" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Assets
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Brand Assets</h1>
          <p className="mt-1 text-blue-200">{(await getMembersText()).assets?.brandIntro}</p>
        </div>
      </div>

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
