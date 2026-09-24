'use client';

import Link from 'next/link';
import { FiArrowLeft, FiSliders, FiDollarSign, FiClipboard, FiList } from 'react-icons/fi';

interface PricingQuotingCardsProps {
  userRole: 'franchisee' | 'admin';
  hasFranchisee: boolean;
  categoryCounts: Record<string, number>;
  priceListCount: number;
  quoteCount: number;
}

export default function PricingQuotingCards({
  userRole,
  hasFranchisee,
  categoryCounts,
  priceListCount,
  quoteCount,
}: PricingQuotingCardsProps) {
  const tiles = [
    {
      key: 'my-pricing',
      title: 'My Pricing',
      description: 'Adjust your territory pricing and overrides',
      icon: FiSliders,
      color: 'bg-green-500',
      href: '/members/pricing',
      visible: hasFranchisee,
    },
    {
      key: 'pricing-documents',
      title: 'Pricing Documents',
      description: 'Print-ready PDF leaflets and shareable links for your price lists',
      icon: FiDollarSign,
      color: 'bg-teal-500',
      href: '/members/pricing-documents',
      count: priceListCount,
      countNoun: 'price list',
      visible: true,
    },
    {
      key: 'quoting',
      title: 'Quoting',
      description: 'Build and send bespoke quotes to your clients',
      icon: FiClipboard,
      color: 'bg-red-500',
      href: '/members/quoting',
      count: quoteCount,
      countNoun: 'quote',
      visible: true,
    },
    {
      key: 'all-pricing',
      title: 'All Pricing',
      description: 'View all franchisee price lists and admin templates',
      icon: FiList,
      color: 'bg-indigo-500',
      href: '/members/pricing/admin',
      visible: userRole === 'admin',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
            Pricing &amp; Quoting
          </h1>
          <p className="mt-1 text-blue-200">
            Your pricing, pricing documents and quoting guides
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {tiles
            .filter((tile) => tile.visible)
            .map((tile) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.key}
                  href={tile.href}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`${tile.color} text-white p-3 rounded-lg flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-dark-blue transition-colors font-helvetica">
                        {tile.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{tile.description}</p>
                      {tile.count !== undefined && (
                        <p className="text-sm text-gray-400 mt-2">
                          {tile.count} {tile.countNoun}{tile.count === 1 ? '' : 's'}
                        </p>
                      )}
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
