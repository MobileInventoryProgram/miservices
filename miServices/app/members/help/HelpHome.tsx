'use client';

import { useState } from 'react';
import type { HelpSearchResults } from '@/lib/help/search';
import HelpSearch from './HelpSearch';

/** Search on top; the topics and common questions (children) hide while showing results */
export default function HelpHome({
  initial,
  noResults,
  children,
}: {
  initial: HelpSearchResults | null;
  noResults: React.ReactNode;
  children: React.ReactNode;
}) {
  const [searching, setSearching] = useState(!!initial?.query);
  return (
    <div className="space-y-8">
      <HelpSearch initial={initial} onSearchingChange={setSearching} noResults={noResults} />
      <div hidden={searching}>{children}</div>
    </div>
  );
}
