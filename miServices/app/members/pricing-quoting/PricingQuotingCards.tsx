'use client';

import Link from 'next/link';
import { FiArrowLeft, FiSliders, FiDollarSign, FiClipboard, FiList, FiEdit3 } from 'react-icons/fi';

type Tile = { title?: string; description?: string };

interface PricingQuotingCardsProps {
  /** Wording from the CMS (Franchise Login text) */
  text: { heading?: string; intro?: string; myPricing?: Tile; pricingDocuments?: Tile; quoting?: Tile; standardPriceLists?: Tile; quoteTemplate?: Tile };
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
  text,
}: PricingQuotingCardsProps) {
  const tiles = [
    {
      key: 'my-pricing',
      title: text.myPricing?.title,
      description: text.myPricing?.description,
      icon: FiSliders,
      color: 'bg-green-500',
      href: '/members/pricing',
      visible: hasFranchisee,
    },
    {
      key: 'pricing-documents',
      title: text.pricingDocuments?.title,
      description: text.pricingDocuments?.description,
      icon: FiDollarSign,
      color: 'bg-teal-500',
      href: '/members/pricing-documents',
      count: priceListCount,
      countNoun: 'price list',
      visible: true,
    },
    {
      key: 'quoting',
      title: text.quoting?.title,
      description: text.quoting?.description,
      icon: FiClipboard,
      color: 'bg-red-500',
      href: '/members/quoting',
      count: quoteCount,
      countNoun: 'quote',
      visible: true,
    },
    {
      key: 'all-pricing',
      title: text.standardPriceLists?.title,
      description: text.standardPriceLists?.description,
      icon: FiList,
      color: 'bg-indigo-500',
      href: '/members/pricing/admin',
      visible: userRole === 'admin',
    },
    {
      key: 'quote-template',
      title: text.quoteTemplate?.title,
      description: text.quoteTemplate?.description,
      icon: FiEdit3,
      color: 'bg-amber-500',
      href: '/members/quoting/template',
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
            {text.heading}
          </h1>
          <p className="mt-1 text-blue-200">
            {text.intro}
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
