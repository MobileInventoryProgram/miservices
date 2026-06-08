'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { FiFileText, FiDollarSign, FiImage, FiUsers, FiClipboard, FiLogOut, FiUser } from 'react-icons/fi';

const CATEGORIES = [
  {
    slug: 'documents',
    title: 'Documents',
    description: 'General documents, operating procedures, personnel & training',
    icon: FiFileText,
    color: 'bg-blue-500',
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    description: 'Current pricing schedules and print-ready leaflets',
    icon: FiDollarSign,
    color: 'bg-green-500',
  },
  {
    slug: 'assets',
    title: 'Assets',
    description: 'Downloadable logos, LinkedIn banners, and brand assets',
    icon: FiImage,
    color: 'bg-purple-500',
  },
  {
    slug: 'contacts',
    title: 'Contacts',
    description: 'Key contacts and directory documents',
    icon: FiUsers,
    color: 'bg-amber-500',
  },
  {
    slug: 'quoting',
    title: 'Quoting',
    description: 'Quoting guides and templates',
    icon: FiClipboard,
    color: 'bg-red-500',
  },
];

interface MembersDashboardProps {
  userName: string;
  userRole: 'franchisee' | 'admin';
  userTerritory?: string;
  categoryCounts: Record<string, number>;
}

export default function MembersDashboard({
  userName,
  userRole,
  userTerritory,
  categoryCounts,
}: MembersDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
              Members Area
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
            {userRole === 'franchisee' && userTerritory && (
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
        <h2 className="text-xl font-bold text-gray-900 font-helvetica mb-6">
          Documents
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.slug] || 0;
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/members/${cat.slug}`}
                className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${cat.color} text-white p-3 rounded-lg flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-dark-blue transition-colors font-helvetica">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {count} {count === 1 ? 'document' : 'documents'}
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
