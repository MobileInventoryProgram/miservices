import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

/** Buttons for PageHeader `actions` (the header is white) */
export const headerPrimaryButton =
  'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-dark-blue text-white hover:bg-brand-light-blue transition-colors font-helvetica disabled:opacity-60';
export const headerSecondaryButton =
  'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60';

const WIDTHS = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const;

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Title bar at the top of every Members Area page: breadcrumbs, title,
 * optional intro and actions on the right.
 */
export default function PageHeader({
  title,
  intro,
  breadcrumbs,
  actions,
  children,
  width = '7xl',
  className = '',
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Match the page content's width so the title lines up with it */
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return (
    <header className={`border-b border-gray-200 bg-white ${className}`}>
      <div className={`mx-auto ${WIDTHS[width]} px-4 py-6 sm:px-6 lg:px-8`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
              {breadcrumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <FiChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-brand-dark-blue transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 font-helvetica md:text-3xl">{title}</h1>
            {intro && <div className="mt-1 text-gray-500">{intro}</div>}
          </div>
          {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </header>
  );
}
