import Link from 'next/link';
import Image from 'next/image';
import { FiPhone, FiMapPin } from 'react-icons/fi';
import type { SiteSettings } from '@/lib/cms/types';

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Footer from Site Settings */
export default function Footer({ site }: { site: SiteSettings }) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-6">
              <Image src="/logo.png" alt={`${site.siteName} Logo`} width={180} height={60} className="brightness-0 invert" />
            </div>
            {site.footerTagline && <p className="text-sm leading-relaxed mb-4">{site.footerTagline}</p>}
          </div>

          {(site.footerColumns || []).map((column) => (
            <div key={column._key || column.title}>
              <h3 className="text-white font-bold mb-4 font-helvetica">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {(column.links || []).map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="hover:text-brand-light-blue transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-white font-bold mb-4 font-helvetica">{site.footerContactHeading}</h3>
            <ul className="space-y-3 text-sm">
              {site.phone && (
                <li className="flex items-start gap-2">
                  <FiPhone className="w-5 h-5 text-brand-light-blue flex-shrink-0 mt-0.5" />
                  <a href={telHref(site.phone)} className="hover:text-brand-light-blue transition-colors">
                    {site.phone}
                  </a>
                </li>
              )}
              {site.footerCoverageLink && (
                <li className="flex items-start gap-2">
                  <FiMapPin className="w-5 h-5 text-brand-light-blue flex-shrink-0 mt-0.5" />
                  <Link href={site.footerCoverageLink.href} className="hover:text-brand-light-blue transition-colors">
                    {site.footerCoverageLink.label}
                  </Link>
                </li>
              )}
              {site.footerContactButton && (
                <li className="mt-4">
                  <Link
                    href={site.footerContactButton.href}
                    className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-6 py-2 rounded-md hover:bg-brand-dark-blue transition-colors font-helvetica font-semibold text-sm"
                  >
                    {site.footerContactButton.label}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {(site.footerLocations || []).some((l) => l.slug) && (
          <div className="border-t border-gray-800 pt-8 pb-4">
            <h3 className="text-white font-bold mb-4 font-helvetica">{site.footerLocationsHeading}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm mb-8">
              {(site.footerLocations || [])
                .filter((location) => location.slug)
                .map((location) => (
                  <Link key={location._key || location.slug} href={`/our-network/${location.slug}`} className="text-gray-400 hover:text-brand-light-blue transition-colors">
                    {location.label || location.name}
                  </Link>
                ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {site.copyright}
            </p>
            <div className="flex gap-6 text-sm">
              {(site.legalLinks || []).map((link) => (
                <Link key={link.href + link.label} href={link.href} className="text-gray-400 hover:text-brand-light-blue transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
