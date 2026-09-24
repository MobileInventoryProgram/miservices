'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FiFileText, FiDollarSign, FiImage, FiUsers, FiLogOut, FiUser } from 'react-icons/fi';

const CATEGORIES = [
  {
    slug: 'documents',
    title: 'Documents',
    description: 'General documents, operating procedures, personnel & training',
    icon: FiFileText,
    color: 'bg-blue-500',
    href: '/members/documents',
    countSlugs: ['documents'],
  },
  {
    slug: 'pricing-quoting',
    title: 'Pricing & Quoting',
    description: 'Your pricing, pricing documents and quoting guides',
    icon: FiDollarSign,
    color: 'bg-green-500',
    href: '/members/pricing-quoting',
    countSlugs: ['quoteRecords'],
    countNoun: 'quote',
  },
  {
    slug: 'assets',
    title: 'Assets',
    description: 'Downloadable logos, LinkedIn banners, and brand assets',
    icon: FiImage,
    color: 'bg-purple-500',
    href: '/members/assets',
    countSlugs: ['assets'],
  },
  {
    slug: 'contacts',
    title: 'Contacts',
    description: 'Your clients and prospects, ready to quote',
    icon: FiUsers,
    color: 'bg-amber-500',
    href: '/members/contacts',
    countSlugs: ['contactRecords'],
    countNoun: 'contact',
  },
];

interface MembersDashboardProps {
  userName: string;
  userTerritory?: string;
  hasFranchisee: boolean;
  categoryCounts: Record<string, number>;
}

export default function MembersDashboard({
  userName,
  userTerritory,
  hasFranchisee,
  categoryCounts,
}: MembersDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
              Franchise Login
            </h1>
            <p className="mt-1 text-blue-200">
              Welcome back, {userName}
              {userTerritory && (
                <span className="ml-2 text-sm bg-blue-800/50 px-2 py-0.5 rounded">
                  {userTerritory}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasFranchisee && (
              <Link
                href="/members/edit-profile"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FiUser className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/members/login' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
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
                      {cat.title}
                    </h3>
                    <p className="text-gray-500 mt-1">{cat.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {count} {'countNoun' in cat ? cat.countNoun : 'document'}{count === 1 ? '' : 's'}
                    </p>
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
