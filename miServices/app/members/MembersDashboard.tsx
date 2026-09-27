'use client';

import Link from 'next/link';
import PageHeader from '@/components/members/PageHeader';
import { FiFileText, FiDollarSign, FiImage, FiUsers, FiClock } from 'react-icons/fi';

type Tile = { title?: string; description?: string };

const CATEGORIES = [
  {
    slug: 'documents',
    icon: FiFileText,
    color: 'bg-blue-500',
    href: '/members/documents',
    countSlugs: ['documents'],
  },
  {
    slug: 'pricing-quoting',
    icon: FiDollarSign,
    color: 'bg-green-500',
    href: '/members/quoting',
    countSlugs: ['quoteRecords'],
    countNoun: 'quote',
  },
  {
    slug: 'assets',
    icon: FiImage,
    color: 'bg-purple-500',
    href: '/members/assets',
    countSlugs: [] as string[],
  },
  {
    slug: 'contacts',
    icon: FiUsers,
    color: 'bg-amber-500',
    href: '/members/contacts',
    countSlugs: ['contactRecords'],
    countNoun: 'contact',
  },
];

/** Head Office only tiles */
const ADMIN_TILES = [
  {
    slug: 'timesheets',
    icon: FiClock,
    color: 'bg-teal-500',
    href: '/members/timesheets',
    countSlugs: [] as string[],
    title: 'Staff Timesheets',
    description: 'Check-ins, hours and completed jobs for every member of staff, live from ServiceM8.',
  },
];

interface MembersDashboardProps {
  userName: string;
  userTerritory?: string;
  hasFranchisee: boolean;
  isAdmin?: boolean;
  categoryCounts: Record<string, number>;
  /** Tile wording from the CMS (Members Area text) */
  tiles?: Partial<Record<'documents' | 'pricing-quoting' | 'assets' | 'contacts', Tile>>;
  heading?: string;
}

export default function MembersDashboard({
  userName,
  userTerritory,
  hasFranchisee,
  isAdmin = false,
  categoryCounts,
  tiles = {},
  heading,
}: MembersDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={heading}
        intro={
          <>
            Welcome back, {userName}
            {userTerritory && <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{userTerritory}</span>}
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...CATEGORIES, ...(isAdmin ? ADMIN_TILES : [])].map((cat) => {
            const count = cat.countSlugs.reduce(
              (sum, slug) => sum + (categoryCounts[slug] || 0),
              0
            );
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`${cat.color} text-white p-4 rounded-lg flex-shrink-0`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-dark-blue transition-colors font-helvetica">
                      {'title' in cat ? cat.title : tiles[cat.slug as keyof typeof tiles]?.title}
                    </h3>
                    <p className="text-gray-500 mt-1">{'description' in cat ? cat.description : tiles[cat.slug as keyof typeof tiles]?.description}</p>
                    {cat.countSlugs.length > 0 && <p className="text-sm text-gray-400 mt-2">
                      {count} {'countNoun' in cat ? cat.countNoun : 'document'}{count === 1 ? '' : 's'}
                    </p>}
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
