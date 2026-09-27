'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiArrowRight, FiBookOpen, FiHelpCircle, FiSearch, FiX } from 'react-icons/fi';
import type { HelpSearchResults } from '@/lib/help/search';
import { helpTopic } from '@/lib/help/topics';

/**
 * Help Centre search box with results as you type. The search is kept in the
 * address (?q=) so it can be shared and survives Back.
 */
export default function HelpSearch({
  initial,
  onSearchingChange,
  noResults,
}: {
  initial: HelpSearchResults | null;
  /** Lets the page hide its topic list while showing results */
  onSearchingChange?: (searching: boolean) => void;
  /** Shown under "No matches" (e.g. contact Head Office) */
  noResults?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initial?.query || '');
  const [results, setResults] = useState<HelpSearchResults | null>(initial);
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    const q = query.trim();
    onSearchingChange?.(!!q);
    if (!q) {
      setResults(null);
      if (results) router.replace(pathname, { scroll: false });
      return;
    }
    if (results?.query === q) return;
    const request = ++latest.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/members/help/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as HelpSearchResults;
        if (request === latest.current && res.ok) {
          setResults(data);
          router.replace(`${pathname}?q=${encodeURIComponent(q)}`, { scroll: false });
        }
      } finally {
        if (request === latest.current) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasResults = !!results && (results.answers.length > 0 || results.sections.length > 0);

  return (
    <div className="space-y-6">
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <label htmlFor="help-search" className="sr-only">
          Search help
        </label>
        <input
          id="help-search"
          type="search"
          autoFocus={!initial}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question or search, e.g. holiday, check-out, company van"
          className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-12 pr-12 text-base shadow-sm focus:border-brand-light-blue focus:outline-none focus:ring-2 focus:ring-brand-light-blue/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear search"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-live="polite">
          {results && !hasResults && !loading && (
            <div className="space-y-4">
              <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
                No matches for “{results.query}”. Try a different word, or browse the topics.
              </p>
              {noResults}
            </div>
          )}

          {results && results.answers.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <FiHelpCircle className="h-4 w-4" /> Answers
              </h2>
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
                {results.answers.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/members/help/${a.slug}`} className="group flex items-start gap-3 px-5 py-4 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-brand-dark-blue">{a.question}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{a.preview}</p>
                        <p className="mt-1 text-xs text-gray-400">{helpTopic(a.topic)?.title}</p>
                      </div>
                      <FiArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-brand-dark-blue" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results && results.sections.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <FiBookOpen className="h-4 w-4" /> In the documents
              </h2>
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
                {results.sections.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="group block px-5 py-4 hover:bg-gray-50">
                      <p className="text-xs text-gray-500">{s.documentTitle}</p>
                      <p className="font-medium text-gray-900 group-hover:text-brand-dark-blue">{s.heading || 'Introduction'}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {s.snippet.map((part, i) =>
                          part.hit ? (
                            <mark key={i} className="rounded bg-yellow-100 px-0.5 text-gray-900">
                              {part.text}
                            </mark>
                          ) : (
                            <span key={i}>{part.text}</span>
                          )
                        )}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-sm text-brand-light-blue group-hover:text-brand-dark-blue">
                        Open section <FiArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
