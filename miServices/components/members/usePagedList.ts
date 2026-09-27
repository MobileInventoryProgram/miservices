'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { slicePage } from '@/lib/pagination';

/**
 * Client-side paging for lists that are already loaded. Goes back to page 1
 * when the list changes (e.g. a filter), and scrolls the list into view on
 * page change.
 */
export function usePagedList<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPage(1), [items]);

  const paged = useMemo(() => slicePage(items, page, pageSize), [items, page, pageSize]);

  // Only when the page number really changes: never on arrival (effects can run twice then)
  const shownPage = useRef(paged.page);
  useEffect(() => {
    if (shownPage.current === paged.page) return;
    shownPage.current = paged.page;
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [paged.page]);

  return { ...paged, setPage, topRef };
}
