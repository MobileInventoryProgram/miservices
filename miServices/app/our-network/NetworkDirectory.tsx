'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { urlFor } from '@/lib/sanity-image';
import type { CmsHero, CmsImage, CmsLink } from '@/lib/cms/types';

const imageUrl = (image?: CmsImage) => (image?.asset?._ref ? urlFor(image).width(1600).auto('format').url() : undefined);
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
}

interface Franchisee {
  id: number;
  companyName: string | null;
  postCodes: string | null;
  territory: string | null;
  townsCities: string | null;
  slug: string;
  tags: string[] | null;
  owners: Owner[];
  areaImage?: CmsImage & { hotspot?: unknown; crop?: unknown };
}

export interface OurNetworkPageDoc {
  hero?: CmsHero;
  searchPlaceholder?: string;
  noResults?: { heading?: string; text?: string };
  headOffice?: { initials?: string; name?: string; tagline?: string; basedIn?: string; button?: CmsLink };
}

export default function NetworkDirectory({ page }: { page: OurNetworkPageDoc | null }) {
  const site = useSiteSettings();
  const heroImage = imageUrl(page?.hero?.image);
  const [searchTerm, setSearchTerm] = useState('');
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFranchisees = async () => {
      try {
        // Add cache busting and force fresh data
        const response = await fetch('/api/franchisees', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFranchisees(data);
        }
      } catch (error) {
        console.error('Error fetching franchisees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFranchisees();
    
    // Auto-refresh every 10 seconds to catch new franchisees
    const interval = setInterval(fetchFranchisees, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredFranchisees = franchisees.filter((franchisee) => {
    const search = searchTerm.toLowerCase().trim();
    
    if (!search) return true;

    // Extract outward code from full postcode (handles both "CH2 1HA" and "CH21HA")
    // UK postcode outward code: area (1-2 letters) + district (1 digit) + optional sub-district (1 letter/digit)
    let postcodePrefix = search;
    
    if (search.includes(' ')) {
      // With space: just take first part
      postcodePrefix = search.split(' ')[0].toLowerCase();
    } else if (search.length > 4) {
      // No space but looks like full postcode: extract outward code
      // UK postcode pattern: [A-Z]{1,2} + \d + [A-Z\d]? (e.g., CH2, SW1A, LL14)
      const outwardMatch = search.match(/^([a-z]{1,2}\d[a-z\d]?)/i);
      if (outwardMatch) {
        postcodePrefix = outwardMatch[1].toLowerCase();
      }
    }

    // Parse postCodes string into array (split by comma)
    const postcodesArray = franchisee.postCodes ? franchisee.postCodes.split(',').map(pc => pc.trim()) : [];
    
    // Check if any franchisee postcode matches the search term or prefix
    const postcodeMatch = postcodesArray.some(postcode => {
      // Clean the stored postcode, removing exclusion notes like "(excl LE15)"
      const cleanPostcode = postcode.replace(/\s*\(.*?\)\s*/g, '').trim();
      const normalizedPostcode = cleanPostcode.toLowerCase().replace(/\s/g, '');
      const normalizedSearch = search.replace(/\s/g, '').toLowerCase();
      
      // Handle postcode ranges like "CH1-4" (covers CH1, CH2, CH3, CH4)
      const rangeMatch = cleanPostcode.match(/^([A-Z]+)(\d+)-(\d+)$/i);
      if (rangeMatch) {
        const [, letters, start, end] = rangeMatch;
        // Match prefix with optional letter+digit format (e.g., CH2, SW1, SW1A)
        const searchMatch = postcodePrefix.match(/^([A-Z]+)(\d+)([A-Z\d])?$/i);
        
        if (searchMatch) {
          const [, searchLetters, searchNum] = searchMatch;
          // Check if letters match and number is in range
          if (letters.toLowerCase() === searchLetters.toLowerCase()) {
            const num = parseInt(searchNum);
            return num >= parseInt(start) && num <= parseInt(end);
          }
        }
      }
      
      // Parse both the search term and stored postcode to compare properly
      // UK postcode structure: Area (1-2 letters) + District (1-2 digits) + optional sub-district (letter/digit)
      const searchParsed = postcodePrefix.match(/^([a-z]+)(\d*)([a-z\d])?$/i);
      const storedParsed = normalizedPostcode.match(/^([a-z]+)(\d*)([a-z\d])?$/i);
      
      if (searchParsed && storedParsed) {
        const [, searchArea, searchDistrict, searchSub] = searchParsed;
        const [, storedArea, storedDistrict, storedSub] = storedParsed;
        
        // Areas must match (M, CH, SW, etc.)
        if (searchArea.toLowerCase() !== storedArea.toLowerCase()) {
          return false;
        }
        
        // If stored postcode is area-only (e.g., "BB", "LL"), it matches any search in that area
        if (!storedDistrict || storedDistrict === '') {
          return true;
        }
        
        // If search is area-only (e.g., "M"), match any district in that area
        if (!searchDistrict || searchDistrict === '') {
          return true;
        }
        
        // Both have districts - they must match exactly (M1 should NOT match M18)
        if (searchDistrict !== storedDistrict) {
          return false;
        }
        
        // If we have sub-districts, they must match too (SW1A vs SW1B)
        if (searchSub && storedSub) {
          return searchSub.toLowerCase() === storedSub.toLowerCase();
        }
        
        // If search has sub-district but stored doesn't (or vice versa), they still match
        // e.g., "SW1" matches "SW1A" and vice versa
        return true;
      }
      
      // Fallback: simple contains check
      return normalizedPostcode.includes(normalizedSearch) || 
             normalizedPostcode.startsWith(postcodePrefix.toLowerCase());
    });
    
    // Parse locations/towns array
    const locationsArray = franchisee.townsCities ? franchisee.townsCities.split(',').map(loc => loc.trim()) : [];

    // Check if any owner name matches
    const ownerNameMatch = franchisee.owners.some(owner =>
      owner.name.toLowerCase().includes(search) ||
      owner.firstName.toLowerCase().includes(search) ||
      owner.lastName.toLowerCase().includes(search)
    );

    // Word-boundary match: checks if the search term appears as a complete word
    // e.g. "chester" matches "Chester" but NOT "Manchester" or "Chesterfield"
    const wordBoundaryMatch = (text: string, term: string) => {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    };

    // Location match: exact word-boundary match on each individual town/city
    const locationMatch = locationsArray.some(location =>
      wordBoundaryMatch(location, search)
    );

    // Territory/company: use word-boundary matching too
    const territoryMatch = franchisee.territory ? wordBoundaryMatch(franchisee.territory, search) : false;
    const companyMatch = franchisee.companyName ? wordBoundaryMatch(franchisee.companyName, search) : false;

    return (
      territoryMatch ||
      companyMatch ||
      ownerNameMatch ||
      postcodeMatch ||
      locationMatch
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-brand-dark-blue text-white py-20">
        {heroImage && (
          <div className="absolute inset-0">
            <Image src={heroImage} alt={page?.hero?.image?.alt || ''} fill className="object-cover opacity-20" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">{page?.hero?.heading}</h1>
          <p className="text-xl text-brand-light-blue max-w-3xl">
            {page?.hero?.subheading}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={page?.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-brand-light-blue focus:border-brand-light-blue text-gray-900 placeholder-gray-500 shadow-md"
            />
          </div>
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-600">
              Showing {filteredFranchisees.length} result{filteredFranchisees.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue"></div>
            </div>
          ) : searchTerm && filteredFranchisees.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 mb-8">
                <FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{page?.noResults?.heading}</h3>
                <p className="text-gray-600 mb-6">
                  {(page?.noResults?.text || '').replace(/\{search\}/g, searchTerm)}
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 w-full bg-gradient-to-br from-brand-dark-blue to-brand-light-blue flex items-center justify-center">
                    <span className="text-6xl font-bold text-white font-helvetica">{page?.headOffice?.initials}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">
                      {page?.headOffice?.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{page?.headOffice?.tagline}</p>

                    <div className="space-y-2 text-gray-600 mb-4">
                      {site.phone && (
                        <div className="flex items-center">
                          <FiPhone className="mr-2 text-brand-light-blue flex-shrink-0" size={16} />
                          <a href={telHref(site.phone)} className="text-sm hover:text-brand-light-blue">{site.phone}</a>
                        </div>
                      )}
                      {site.email && (
                        <div className="flex items-start">
                          <FiMail className="mr-2 text-brand-light-blue flex-shrink-0 mt-0.5" size={16} />
                          <a href={`mailto:${site.email}`} className="text-sm hover:text-brand-light-blue truncate">
                            {site.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Based in:</p>
                      <p className="text-sm text-brand-dark-blue">{page?.headOffice?.basedIn}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      {page?.headOffice?.button && (
                        <a href={page.headOffice.button.href} className="inline-flex items-center text-brand-light-blue font-medium hover:underline">
                          {page.headOffice.button.label}
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            filteredFranchisees.map((franchisee) => {
              const locationsArray = franchisee.townsCities ? franchisee.townsCities.split(',').map(loc => loc.trim()) : [];
              const primaryOwner = franchisee.owners[0];
              const hasMultipleOwners = franchisee.owners.length > 1;
              const initials = hasMultipleOwners 
                ? `${franchisee.owners[0].firstName[0]}${franchisee.owners[1].firstName[0]}`.toUpperCase()
                : `${primaryOwner.firstName[0]}${primaryOwner.lastName[0]}`.toUpperCase();
              
              return (
                <Link
                  key={franchisee.id}
                  href={`/our-network/${franchisee.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
                >
                  {/* The area's photo, not the owner's */}
                  {franchisee.areaImage?.asset?._ref && (
                    <div className="relative h-48 w-full bg-gradient-to-br from-brand-dark-blue to-brand-light-blue">
                      <Image
                        src={urlFor(franchisee.areaImage).width(800).height(384).fit('crop').auto('format').url()}
                        alt={franchisee.areaImage.alt || franchisee.territory || ''}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  {!franchisee.areaImage?.asset?._ref && (
                    <div className="relative h-48 w-full bg-gradient-to-br from-brand-dark-blue to-brand-light-blue flex items-center justify-center">
                      <span className="text-6xl font-bold text-white font-helvetica">
                        {initials}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">
                      {franchisee.companyName || `miServices - ${franchisee.territory || 'Franchise'}`}
                    </h3>
                    <div className="text-gray-600 mb-4">
                      {hasMultipleOwners ? (
                        <>
                          <p>{franchisee.owners.map(o => o.name).join(' & ')}</p>
                        </>
                      ) : (
                        <p>{primaryOwner.name}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-gray-600 mb-4">
                      {franchisee.owners.map((owner, idx) => (
                        <div key={owner.id} className={idx > 0 ? 'pt-2 border-t border-gray-100' : ''}>
                          {hasMultipleOwners && (
                            <p className="text-xs font-medium text-gray-500 mb-1">{owner.name}</p>
                          )}
                          {owner.phone && (
                            <div className="flex items-center">
                              <FiPhone className="mr-2 text-brand-light-blue flex-shrink-0" size={16} />
                              <span className="text-sm">{owner.phone}</span>
                            </div>
                          )}
                          <div className="flex items-start">
                            <FiMail className="mr-2 text-brand-light-blue flex-shrink-0 mt-0.5" size={16} />
                            <span className="text-sm truncate">{owner.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {locationsArray.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Covering:</p>
                        <p className="text-sm text-brand-dark-blue line-clamp-2">
                          {locationsArray.slice(0, 5).join(', ')}
                          {locationsArray.length > 5 && ` +${locationsArray.length - 5} more`}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <span className="text-brand-light-blue font-medium group-hover:underline flex items-center">
                        View Profile & Book Service
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
