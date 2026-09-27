import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiEdit3, FiImage } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getMembersText } from '@/lib/cms/members';
import PageHeader from '@/components/members/PageHeader';

export const metadata: Metadata = {
  title: 'Assets | Members Area | miServices',
};

const TILES = [
  {
    href: '/members/assets/brand',
    key: 'brand' as const,
    icon: FiImage,
    color: 'bg-purple-500',
  },
  {
    href: '/members/assets/social',
    key: 'social' as const,
    icon: FiEdit3,
    color: 'bg-brand-light-blue',
  },
];

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/members/login');
  }
  const text = (await getMembersText()).assets || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={text.heading} intro={text.intro} />
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
                      {text[tile.key]?.title}
                    </h2>
                    <p className="text-gray-500 mt-1">{text[tile.key]?.description}</p>
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
