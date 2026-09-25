'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiMenu, FiX, FiChevronDown, FiSearch, FiBriefcase } from 'react-icons/fi';
import { CmsIcon } from '@/lib/cms/icons';
import type { CmsMenuGroup, CmsMenuLink, SiteSettings } from '@/lib/cms/types';

const heading = 'text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider';

/** Menu from Site Settings; desktop mega-menus and the mobile menu use the same links */
export default function Header({ site }: { site: SiteSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setActiveDropdown(null);

  // Compact bar once the page is scrolled (two thresholds so it doesn't flicker at the boundary)
  useEffect(() => {
    const onScroll = () => setScrolled((was) => (was ? window.scrollY > 10 : window.scrollY > 40));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dropdowns sit directly under the bar, whatever its height
  const menuTop = scrolled ? 'top-20' : 'top-32';

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const iconLink = (link: CmsMenuLink, last: boolean) => (
    <Link
      key={link.href + link.label}
      href={link.href}
      onClick={close}
      className={`group flex items-start ${last ? '' : 'mb-4'} hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue`}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
        <CmsIcon name={link.icon} className="text-brand-light-blue" size={20} />
      </div>
      <div>
        <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">{link.label}</div>
        {link.description && <div className="text-sm text-gray-500">{link.description}</div>}
      </div>
    </Link>
  );

  const numberedLink = (link: CmsMenuLink, index: number) => (
    <Link
      key={link.href + link.label}
      href={link.href}
      onClick={close}
      className="flex items-start p-3 bg-brand-dark-blue/5 rounded-md border-l-2 border-brand-dark-blue hover:bg-brand-dark-blue/10 transition-colors group"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-brand-dark-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-dark-blue/20">
        <span className="text-brand-dark-blue font-bold text-lg">{index + 1}</span>
      </div>
      <div>
        <div className="font-medium text-gray-900 group-hover:text-brand-dark-blue">{link.label}</div>
        {link.description && <div className="text-sm text-gray-500">{link.description}</div>}
      </div>
    </Link>
  );

  const megaMenu = (groups: CmsMenuGroup[] = []) => (
    <div className={`fixed left-0 right-0 ${menuTop} bg-white shadow-xl border-t-2 border-brand-light-blue`} onMouseLeave={close}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-12">
          {groups.map((group) => (
            <div key={group._key || group.title}>
              <h3 className={heading}>{group.title}</h3>
              {group.numbered ? (
                <div className="space-y-3">{(group.links || []).map(numberedLink)}</div>
              ) : (
                (group.links || []).map((link, i, all) => iconLink(link, i === all.length - 1))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const menuButton = (key: string, label?: string) => (
    <button className="text-gray-700 hover:text-brand-dark-blue font-medium flex items-center" onMouseEnter={() => setActiveDropdown(key)}>
      {label} <FiChevronDown className="ml-1" />
    </button>
  );

  const mobileGroups = (groups: CmsMenuGroup[] = []) =>
    groups.map((group) => (
      <div key={group._key || group.title}>
        <p className="px-4 py-1 font-semibold text-brand-dark-blue text-sm">{group.title}</p>
        {(group.links || []).map((link) => (
          <Link key={link.href + link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-1 text-gray-600">
            {link.label}
          </Link>
        ))}
      </div>
    ));

  const [contactButton, bookingButton] = site.headerButtons || [];
  const local = site.networkLocal;
  const franchise = site.networkFranchise;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-[height] duration-300 ease-out ${scrolled ? 'h-20' : 'h-32'}`}>
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center" aria-label={`${site.siteName} home`}>
                {/* The logo's name sits in its bottom 23%: when compact, the frame closes up to show just the symbol, slightly smaller */}
                <span
                  className="relative block overflow-hidden transition-all duration-300 ease-out"
                  style={scrolled ? { width: 58, height: 49 } : { width: 103, height: 112 }}
                >
                  <Image
                    src="/logo.png"
                    alt={`${site.siteName} Logo`}
                    width={500}
                    height={544}
                    priority
                    className="absolute left-0 top-0 max-w-none transition-all duration-300 ease-out"
                    style={scrolled ? { width: 58, height: 63 } : { width: 103, height: 112 }}
                  />
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <div className="relative group">
                {menuButton('services', site.servicesMenuLabel)}
                {activeDropdown === 'services' && megaMenu(site.servicesMenu)}
              </div>

              <div className="relative group">
                {menuButton('network', site.networkMenuLabel)}
                {activeDropdown === 'network' && (
                  <div className={`fixed left-0 right-0 ${menuTop} bg-white shadow-xl border-t-2 border-brand-light-blue`} onMouseLeave={close}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                      <div className="grid grid-cols-3 gap-12">
                        <div className="col-span-2">
                          <h3 className={heading}>{local?.eyebrow}</h3>
                          <div className="bg-gradient-to-br from-brand-dark-blue/5 to-brand-light-blue/5 rounded-lg p-8 border-l-4 border-brand-light-blue">
                            <h4 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">{local?.heading}</h4>
                            <p className="text-gray-700 mb-6 leading-relaxed">{local?.text}</p>
                            {local?.button && (
                              <Link
                                href={local.button.href}
                                onClick={close}
                                className="inline-flex items-center gap-2 bg-brand-light-blue text-white border-2 border-transparent px-6 py-3 rounded-md font-medium hover:bg-brand-dark-blue transition-colors"
                              >
                                <FiSearch size={18} />
                                {local.button.label}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className={heading}>{franchise?.eyebrow}</h3>
                          <div className="bg-gradient-to-br from-brand-dark-blue/5 to-brand-light-blue/5 rounded-lg p-6 border-l-4 border-brand-dark-blue">
                            <h4 className="text-xl font-bold text-brand-dark-blue mb-3 font-helvetica">{franchise?.heading}</h4>
                            <p className="text-gray-700 mb-6 leading-relaxed text-sm">{franchise?.text}</p>
                            {franchise?.button && (
                              <Link
                                href={franchise.button.href}
                                onClick={close}
                                className="inline-flex items-center gap-2 bg-brand-dark-blue text-white border-2 border-transparent px-6 py-3 rounded-md font-medium hover:bg-brand-light-blue transition-colors"
                              >
                                <FiBriefcase size={18} />
                                {franchise.button.label}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                {menuButton('more', site.moreMenuLabel)}
                {activeDropdown === 'more' && megaMenu(site.moreMenu)}
              </div>
            </div>

            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {contactButton && (
                <Link
                  href={contactButton.href}
                  className="border-2 border-brand-dark-blue text-brand-dark-blue px-6 py-2 rounded-md font-medium hover:bg-brand-dark-blue hover:text-white transition-all duration-300"
                >
                  {contactButton.label}
                </Link>
              )}
              {bookingButton && (
                <Link
                  href={bookingButton.href}
                  className="bg-brand-light-blue text-white border-2 border-brand-light-blue px-6 py-2 rounded-md font-medium hover:bg-white hover:text-brand-light-blue transition-all duration-300"
                >
                  {bookingButton.label}
                </Link>
              )}
            </div>

            <div className="lg:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 hover:text-brand-dark-blue" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
                {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <div className="space-y-2">
                <div>
                  <button onClick={() => toggleDropdown('services-mobile')} className="w-full text-left px-4 py-2 text-gray-700 font-medium flex justify-between items-center">
                    {site.servicesMenuLabel} <FiChevronDown />
                  </button>
                  {activeDropdown === 'services-mobile' && <div className="pl-4 space-y-2">{mobileGroups(site.servicesMenu)}</div>}
                </div>

                {local?.button && (
                  <Link href={local.button.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-700 font-medium">
                    {site.networkMenuLabel}
                  </Link>
                )}

                <div>
                  <button onClick={() => toggleDropdown('more-mobile')} className="w-full text-left px-4 py-2 text-gray-700 font-medium flex justify-between items-center">
                    {site.moreMenuLabel} <FiChevronDown />
                  </button>
                  {activeDropdown === 'more-mobile' && <div className="pl-4 space-y-2">{mobileGroups(site.moreMenu)}</div>}
                </div>

                <div className="px-4 pt-4 space-y-2">
                  {contactButton && (
                    <Link
                      href={contactButton.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full border-2 border-brand-dark-blue text-brand-dark-blue px-6 py-2 rounded-md font-medium text-center hover:bg-brand-dark-blue hover:text-white transition-all"
                    >
                      {contactButton.label}
                    </Link>
                  )}
                  {bookingButton && (
                    <Link
                      href={bookingButton.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-brand-light-blue text-white border-2 border-brand-light-blue px-6 py-2 rounded-md font-medium text-center hover:bg-white hover:text-brand-light-blue transition-all"
                    >
                      {bookingButton.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
