'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FiSearch, FiMapPin, FiPhone, FiMail, FiNavigation } from 'react-icons/fi';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { urlFor } from '@/lib/sanity-image';
import { distanceKm, matchesSearch } from '@/lib/network/search';
import type { FranchiseGeo, LngLat } from '@/lib/network/geo';
import type { MapFranchise } from '@/components/network/NetworkMap';
import type { CmsHero, CmsImage, CmsLink } from '@/lib/cms/types';

// The map is decoration on top of the page's text, so it loads after the page
const NetworkMap = dynamic(() => import('@/components/network/NetworkMap'), { ssr: false });

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export interface NetworkFranchise {
  id: string;
  slug: string;
  companyName: string | null;
  territory: string | null;
  postCodes: string | null;
  townsCities: string | null;
  areaImage?: CmsImage & { hotspot?: unknown; crop?: unknown };
  owners: { id: string; name: string; firstName: string; lastName: string; email: string; phone: string | null }[];
  geo: FranchiseGeo | null;
}

export interface OurNetworkPageDoc {
  hero?: CmsHero;
  searchPlaceholder?: string;
  nearMeLabel?: string;
  countLine?: string;
  nearestHeading?: string;
  regions?: { heading?: string; text?: string };
  noResults?: { heading?: string; text?: string };
  headOffice?: { initials?: string; name?: string; tagline?: string; basedIn?: string; button?: CmsLink };
}

interface Located {
  label: string;
  point: LngLat;
}

const HEAD_OFFICE = 'head-office';
// North to south, as people read a map of the UK
const REGION_ORDER = ['Scotland', 'North East', 'North West', 'Yorkshire and The Humber', 'Wales', 'West Midlands', 'East Midlands', 'East of England', 'London', 'South East', 'South West', 'Northern Ireland'];

const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/;

/** Where a searched postcode or town is (postcodes.io, UK only) */
async function locate(query: string): Promise<Located | null> {
  const compact = query.replace(/\s+/g, '').toUpperCase();
  const get = async (path: string) => {
    const response = await fetch(`https://api.postcodes.io${path}`);
    return response.ok ? (await response.json()).result : null;
  };
  try {
    if (POSTCODE.test(compact)) {
      const r = await get(`/postcodes/${compact}`);
      if (r) return { label: r.postcode, point: [r.longitude, r.latitude] };
    }
    // A full postcode we can't find (e.g. brand new) still tells us its district
    const outcode = POSTCODE.test(compact) ? compact.slice(0, -3) : compact;
    if (OUTCODE.test(outcode)) {
      const r = await get(`/outcodes/${outcode}`);
      if (r?.longitude != null) return { label: r.outcode, point: [r.longitude, r.latitude] };
    }
    if (query.trim().length < 3) return null;
    const places: { name_1: string; local_type: string; county_unitary: string | null; longitude: number; latitude: number }[] =
      (await get(`/places?q=${encodeURIComponent(query.trim())}&limit=10`)) || [];
    const settlements = places.filter((p) => /City|Town|Village|Suburban Area|Hamlet/.test(p.local_type));
    const exact = settlements.find((p) => p.name_1.toLowerCase() === query.trim().toLowerCase());
    const place = exact || settlements[0];
    return place ? { label: place.name_1, point: [place.longitude, place.latitude] } : null;
  } catch {
    return null;
  }
}

function FranchiseCard({ franchisee, onHover }: { franchisee: NetworkFranchise; onHover: (slug: string | null) => void }) {
  const locationsArray = franchisee.townsCities ? franchisee.townsCities.split(',').map((loc) => loc.trim()) : [];
  const primaryOwner = franchisee.owners[0];
  const hasMultipleOwners = franchisee.owners.length > 1;
  const initials = hasMultipleOwners
    ? `${franchisee.owners[0].firstName[0]}${franchisee.owners[1].firstName[0]}`.toUpperCase()
    : `${primaryOwner?.firstName?.[0] || ''}${primaryOwner?.lastName?.[0] || ''}`.toUpperCase();
  if (!primaryOwner) return null;

  return (
    <Link
      href={`/our-network/${franchisee.slug}`}
      onMouseEnter={() => onHover(franchisee.slug)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(franchisee.slug)}
      onBlur={() => onHover(null)}
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
}

export default function NetworkDirectory({ page, franchises }: { page: OurNetworkPageDoc | null; franchises: NetworkFranchise[] }) {
  const site = useSiteSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [located, setLocated] = useState<Located | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const latestQuery = useRef('');

  const search = searchTerm.trim();
  const searching = search.length > 0;

  // Start from ?q= (so a search can be shared), and keep the address in step
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setSearchTerm(q);
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (search) url.searchParams.set('q', search);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url.toString());
  }, [search]);

  // Find where the searched place is, a moment after typing stops
  useEffect(() => {
    latestQuery.current = search;
    if (!search) {
      setLocated(null);
      return;
    }
    const timer = setTimeout(async () => {
      const found = await locate(search);
      if (latestQuery.current === search) setLocated(found);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const matches = useMemo(() => franchises.filter((f) => matchesSearch(f, search)), [franchises, search]);

  // Nothing covers the place by name or postcode: show the closest branches instead
  const nearest = useMemo(() => {
    if (!searching || matches.length || !located) return [];
    const distance = (f: NetworkFranchise) =>
      f.geo ? Math.min(...[f.geo.pin, ...f.geo.points].map((p) => distanceKm(p, located.point))) : Infinity;
    return franchises
      .filter((f) => f.geo && f.slug !== HEAD_OFFICE)
      .map((f) => ({ f, km: distance(f) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);
  }, [searching, matches, located, franchises]);

  const results = searching ? (matches.length ? matches : nearest.map((n) => n.f)) : franchises;

  const mapFranchises = useMemo<MapFranchise[]>(
    () =>
      franchises
        .filter((f) => f.geo)
        .map((f) => ({
          slug: f.slug,
          name: f.companyName || `miServices ${f.territory}`,
          town: f.geo!.town,
          pin: f.geo!.pin,
          points: f.geo!.points,
          headOffice: f.slug === HEAD_OFFICE,
        })),
    [franchises]
  );
  const resultSlugs = useMemo(() => (searching ? results.map((f) => f.slug) : []), [searching, results]);
  const searchPoint = searching ? located?.point || null : null;

  const regions = useMemo(() => {
    const groups = new Map<string, NetworkFranchise[]>();
    for (const f of franchises) {
      if (!f.geo || f.slug === HEAD_OFFICE) continue;
      groups.set(f.geo.region, [...(groups.get(f.geo.region) || []), f]);
    }
    return Array.from(groups.entries()).sort(
      ([a], [b]) => (REGION_ORDER.indexOf(a) + 1 || 99) - (REGION_ORDER.indexOf(b) + 1 || 99)
    );
  }, [franchises]);

  const branchCount = franchises.filter((f) => f.slug !== HEAD_OFFICE).length;

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(`https://api.postcodes.io/postcodes?lon=${coords.longitude}&lat=${coords.latitude}&limit=1&radius=2000`);
          const postcode = response.ok ? (await response.json()).result?.[0]?.postcode : null;
          if (postcode) setSearchTerm(postcode);
          else setLocateError('We couldn’t find a UK postcode for your location.');
        } catch {
          setLocateError('We couldn’t find your location. Please type your postcode.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocateError('Location is turned off. Please type your postcode.');
      },
      { timeout: 10000 }
    );
  };

  const place = located?.label || search;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero: the network on a map, with the search. It shrinks once a search starts, to show the results */}
      <section
        className={`relative flex flex-col md:block overflow-hidden bg-brand-dark-blue text-white transition-[height] duration-500 ease-out ${
          searching ? 'md:!h-[320px]' : 'md:!h-[640px]'
        }`}
      >
        <div
          className={`relative order-2 md:absolute md:inset-0 transition-[height] duration-500 ease-out ${searching ? 'h-44' : 'h-72'} md:h-auto`}
          aria-hidden="true"
        >
          <NetworkMap
            franchises={mapFranchises}
            highlight={resultSlugs}
            hovered={hovered}
            searchPoint={searchPoint}
            frame={resultSlugs}
            leftSpace={0.46}
            className="absolute inset-0"
          />
          {/* Brand colour behind the text, fading out over the map */}
          <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-brand-dark-blue via-brand-dark-blue/85 via-35% to-transparent to-60%" />
        </div>

        <div className="relative order-1 md:absolute md:inset-0 pointer-events-none">
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
            <div className={`pointer-events-auto w-full md:max-w-xl transition-all duration-500 ${searching ? 'py-8' : 'py-12 md:py-0'}`}>
              <h1 className={`font-bold font-helvetica transition-all duration-500 ${searching ? 'text-2xl md:text-3xl mb-4' : 'text-4xl md:text-5xl mb-4'}`}>
                {page?.hero?.heading}
              </h1>
              {!searching && page?.hero?.subheading && <p className="text-lg text-white/90 mb-8">{page.hero.subheading}</p>}

              <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
                <label htmlFor="network-search" className="sr-only">
                  {page?.searchPlaceholder || 'Search by postcode or town'}
                </label>
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  id="network-search"
                  type="search"
                  autoComplete="postal-code"
                  placeholder={page?.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 shadow-lg border-0 focus:ring-4 focus:ring-brand-light-blue/40"
                />
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 font-medium text-white hover:underline disabled:opacity-60"
                >
                  <FiNavigation className="h-4 w-4" />
                  {locating ? 'Finding you…' : page?.nearMeLabel || 'Use my location'}
                </button>
                {!searching && page?.countLine && <span className="text-white/80">{page.countLine.replace(/\{count\}/g, String(branchCount))}</span>}
              </div>
              {locateError && <p className="mt-2 text-sm text-white/90">{locateError}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searching && (
          <div className="mb-8">
            {matches.length > 0 ? (
              <p className="text-gray-600">
                Showing {matches.length} branch{matches.length !== 1 ? 'es' : ''} for “{search}”
              </p>
            ) : nearest.length > 0 ? (
              <h2 className="text-2xl font-bold text-brand-dark-blue font-helvetica">
                {(page?.nearestHeading || 'Nearest branches to {place}').replace(/\{place\}/g, place)}
              </h2>
            ) : null}
          </div>
        )}
        {!searching && (
          <h2 className="text-2xl md:text-3xl font-bold text-brand-dark-blue font-helvetica mb-8">
            All {branchCount} miServices branches
          </h2>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searching && results.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 mb-8">
                <FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{page?.noResults?.heading}</h3>
                <p className="text-gray-600 mb-6">{(page?.noResults?.text || '').replace(/\{search\}/g, search)}</p>
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
            results.map((franchisee) => (
              <div key={franchisee.id} className="relative">
                {nearest.length > 0 && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-brand-dark-blue shadow">
                    About {Math.max(1, Math.round((nearest.find((n) => n.f.slug === franchisee.slug)?.km || 0) * 0.621))} miles away
                  </span>
                )}
                <FranchiseCard franchisee={franchisee} onHover={setHovered} />
              </div>
            ))
          )}
        </div>

        {/* Every branch and the towns it covers, by region: plain links that search engines can follow */}
        {!searching && regions.length > 0 && (
          <section className="mt-20" aria-labelledby="regions-heading">
            <h2 id="regions-heading" className="text-2xl md:text-3xl font-bold text-brand-dark-blue font-helvetica mb-3">
              {page?.regions?.heading || 'Inventory clerks by region'}
            </h2>
            {page?.regions?.text && <p className="text-gray-600 max-w-3xl mb-10">{page.regions.text}</p>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
              {regions.map(([region, members]) => (
                <div key={region}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-light-blue mb-4">{region}</h3>
                  <ul className="space-y-4">
                    {members.map((f) => {
                      const towns = (f.townsCities || '').split(',').map((t) => t.trim()).filter(Boolean);
                      return (
                        <li key={f.slug}>
                          <Link href={`/our-network/${f.slug}`} className="font-bold text-brand-dark-blue hover:text-brand-light-blue">
                            Inventory clerk in {f.territory}
                          </Link>
                          {towns.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {towns.slice(0, 8).join(', ')}
                              {towns.length > 8 && ` and ${towns.length - 8} more`}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
