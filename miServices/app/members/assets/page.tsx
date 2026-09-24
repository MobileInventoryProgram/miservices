import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowLeft, FiEdit3, FiImage } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';

export const metadata: Metadata = {
  title: 'Assets | Franchise Login | miServices',
};

const TILES = [
  {
    href: '/members/assets/brand',
    title: 'Brand Assets',
    description: 'On-brand banners and covers for LinkedIn, Facebook, X, email and your profile picture — ready to download.',
    icon: FiImage,
    color: 'bg-purple-500',
  },
  {
    href: '/members/assets/social',
    title: 'Social Post Creator',
    description: 'Ready-made post templates: reviews, quotes, announcements, milestones, events and tips. Just add your words and a photo.',
    icon: FiEdit3,
    color: 'bg-brand-light-blue',
  },
];

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/members/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Assets</h1>
          <p className="mt-1 text-blue-200">Brand assets and social post templates</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className={`${tile.color} text-white p-4 rounded-lg flex-shrink-0`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-dark-blue transition-colors font-helvetica">
                      {tile.title}
                    </h2>
                    <p className="text-gray-500 mt-1">{tile.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
