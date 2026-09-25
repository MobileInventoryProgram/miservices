import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { pageNumbers } from '@/lib/pagination';

/**
 * Page controls for members lists. Use `hrefFor` for server-paged lists
 * (links) or `onPageChange` inside client components (buttons).
 */
export default function Pagination({
  page,
  totalPages,
  total,
  start,
  end,
  noun = 'items',
  hrefFor,
  onPageChange,
  hideSinglePage = false,
}: {
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  noun?: string;
  hrefFor?: (page: number) => string;
  onPageChange?: (page: number) => void;
  /** Hide entirely when everything fits on one page (short card lists) */
  hideSinglePage?: boolean;
}) {
  if (total === 0 || (hideSinglePage && totalPages <= 1)) return null;

  const base = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors';
  const idle = `${base} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`;
  const current = `${base} bg-brand-dark-blue text-white`;
  const disabled = `${base} border border-gray-100 bg-gray-50 text-gray-300`;

  const control = (target: number, label: React.ReactNode, className: string, ariaLabel?: string, isCurrent = false) => {
    if (hrefFor) {
      return (
        <Link href={hrefFor(target)} scroll={false} className={className} aria-label={ariaLabel} aria-current={isCurrent ? 'page' : undefined}>
          {label}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => onPageChange?.(target)} className={className} aria-label={ariaLabel} aria-current={isCurrent ? 'page' : undefined}>
        {label}
      </button>
    );
  };

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{start + 1}</span>–<span className="font-medium text-gray-700">{end}</span> of{' '}
        <span className="font-medium text-gray-700">{total}</span> {noun}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {page > 1 ? (
            control(page - 1, <FiChevronLeft className="h-4 w-4" />, idle, 'Previous page')
          ) : (
            <span className={disabled} aria-hidden="true">
              <FiChevronLeft className="h-4 w-4" />
            </span>
          )}
          {pageNumbers(page, totalPages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <span key={p}>{control(p, p, p === page ? current : idle, `Page ${p}`, p === page)}</span>
            )
          )}
          {page < totalPages ? (
            control(page + 1, <FiChevronRight className="h-4 w-4" />, idle, 'Next page')
          ) : (
            <span className={disabled} aria-hidden="true">
              <FiChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
