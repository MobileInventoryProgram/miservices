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
  const firstRender = useRef(true);

  useEffect(() => setPage(1), [items]);

  const paged = useMemo(() => slicePage(items, page, pageSize), [items, page, pageSize]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [paged.page]);

  return { ...paged, setPage, topRef };
}
