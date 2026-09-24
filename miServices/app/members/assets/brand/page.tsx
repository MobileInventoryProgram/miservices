import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession, getMemberDocumentsByCategory } from '@/lib/sanity';
import { BRAND_ASSETS } from '@/lib/social/brand-assets';
import BrandAssetGallery from './BrandAssetGallery';

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
          <p className="mt-1 text-blue-200">Banners, covers and profile pictures, sized for each channel</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <BrandAssetGallery
          assets={BRAND_ASSETS.map(({ key, label, channel, width, height, tip }) => ({ key, label, channel, width, height, tip }))}
          territory={territory}
        />

        {files.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-4">More downloads</h2>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
              {files.map((doc) => (
                <li key={doc._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/members/assets/files/${doc.slug}`} className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-dark-blue">
                    <FiFileText className="w-4 h-4 text-gray-400" />
                    {doc.title}
                  </Link>
                  {doc.file?.asset?.url && (
                    <a
                      href={`${doc.file.asset.url}?dl=`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FiDownload className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
