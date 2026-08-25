'use client';

import { useState } from 'react';

interface ProfileTabsProps {
  territory: string;
  servicesContent: React.ReactNode;
  aboutContent: React.ReactNode;
  hasAboutContent: boolean;
}

export default function ProfileTabs({
  territory,
  servicesContent,
  aboutContent,
  hasAboutContent,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'about'>('services');

  // If no about content, just render services directly without tabs
  if (!hasAboutContent) {
    return <>{servicesContent}</>;
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-brand-light-blue text-brand-light-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Our Services
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'about'
              ? 'border-brand-light-blue text-brand-light-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          About {territory}
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-8">
        {activeTab === 'services' ? servicesContent : aboutContent}
      </div>
    </div>
  );
}
