import 'server-only';
import { getFranchisees, sanityClient, type TransformedFranchisee } from '@/lib/sanity';
import { getNetworkGeo, outcodesFor, type LngLat } from '@/lib/network/geo';
import { distanceKm } from '@/lib/network/search';
import type { FlatRate, ServiceRow } from '@/lib/pricing';

/**
 * Transparent pricing: which branch covers a postcode, and the prices the
 * public sees for it — the branch's default price list, or our Standard
 * Pricing when the branch hasn't set one.
 */

export interface PublicPriceList {
  serviceRows: ServiceRow[];
  flatRates: FlatRate[];
  additionalRoomRates: { unfurnishedPerRoom: number | null; furnishedPerRoom: number | null } | null;
  cancellationFee: number | null;
  /** The list's terms as plain paragraphs */
  terms: string[];
}

export interface PublicBranch {
  name: string;
  slug: string;
  territory: string;
  ownerName: string;
  phone: string;
}

export interface PriceLookup {
  /** What was found, e.g. "SG1 1AA", "SG1" or "Stevenage" */
  place: string;
  covered: boolean;
  /** The branch covering the place (null when none does) */
  branch: PublicBranch | null;
  /** When no branch covers the place: the closest one */
  nearest: (PublicBranch & { miles: number }) | null;
  source: 'local' | 'standard';
  prices: PublicPriceList | null;
}

const HEAD_OFFICE = 'head-office';
const API = 'https://api.postcodes.io';
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/;

// Only these fields ever leave the server: no IDs, owners or share links
const PUBLIC_FIELDS = `
  serviceRows[] { serviceType, bedrooms, maxRooms, unfurnishedPrice, furnishedPrice },
  flatRates[] { name, price, unit },
  additionalRoomRates { unfurnishedPerRoom, furnishedPerRoom },
  cancellationFee,
  "terms": terms[_type == "block"] { "text": pt::text(@) }
`;

async function postcodesIo<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, { next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!response.ok) return null;
    return ((await response.json()) as { result: T }).result ?? null;
  } catch {
    return null;
  }
}

interface Located {
  label: string;
  outcode: string;
  point: LngLat;
}

/** A postcode, postcode district or town → where it is and its district */
export async function locatePlace(input: string): Promise<Located | null> {
  const text = input.trim();
  const compact = text.replace(/\s+/g, '').toUpperCase();
  if (!compact) return null;

  if (POSTCODE.test(compact)) {
    const found = await postcodesIo<{ postcode: string; outcode: string; longitude: number; latitude: number }>(`/postcodes/${compact}`);
    if (found?.longitude != null) return { label: found.postcode, outcode: found.outcode, point: [found.longitude, found.latitude] };
  }
  // A full postcode we can't find (e.g. brand new) still tells us its district
  const outcode = POSTCODE.test(compact) ? compact.slice(0, -3) : compact;
  if (OUTCODE.test(outcode)) {
    const found = await postcodesIo<{ outcode: string; longitude: number; latitude: number }>(`/outcodes/${outcode}`);
    if (found?.longitude != null) return { label: found.outcode, outcode: found.outcode, point: [found.longitude, found.latitude] };
    return null;
  }
  if (text.length < 3) return null;
  const places = await postcodesIo<{ name_1: string; local_type: string; outcode: string | null; longitude: number; latitude: number }[]>(
    `/places?q=${encodeURIComponent(text)}&limit=10`
  );
  const settlements = (places || []).filter((p) => p.outcode && /City|Town|Village|Suburban Area|Hamlet/.test(p.local_type));
  const place = settlements.find((p) => p.name_1.toLowerCase() === text.toLowerCase()) || settlements[0];
  return place ? { label: place.name_1, outcode: place.outcode!.toUpperCase(), point: [place.longitude, place.latitude] } : null;
}

function toBranch(f: TransformedFranchisee): PublicBranch {
  return {
    name: f.companyName || `miServices ${f.territory}`,
    slug: f.slug,
    territory: f.territory,
    ownerName: f.owners.map((o) => o.name).filter(Boolean).join(' & '),
    phone: f.owners[0]?.phone || '',
  };
}

/** The branch covering a place: by postcode district, nearest pin when two cover it, nearest branch when none does */
async function branchFor(place: Located) {
  const franchisees = await getFranchisees();
  const covering = franchisees.filter((f) => outcodesFor(f.postCodes).includes(place.outcode));

  if (covering.length === 1) return { covered: true, franchisee: covering[0], miles: 0 };

  const pool = covering.length ? covering : franchisees.filter((f) => f.slug !== HEAD_OFFICE);
  const geo = await getNetworkGeo(pool);
  const ranked = pool
    .map((f) => {
      const g = geo[f.slug];
      // Distance to the branch's pin when choosing between branches that both cover the place,
      // otherwise to the nearest edge of each branch's area
      const km = !g ? Infinity : covering.length ? distanceKm(g.pin, place.point) : Math.min(...[g.pin, ...g.points].map((p) => distanceKm(p, place.point)));
      return { f, km };
    })
    .sort((a, b) => a.km - b.km);
  const best = ranked[0];
  if (!best) return null;
  return { covered: covering.length > 0, franchisee: best.f, miles: Math.max(1, Math.round(best.km * 0.621)) };
}

/** A branch's default price list, or the Standard default when it has none */
export async function getPublicPrices(franchiseeId: string | null): Promise<{ source: 'local' | 'standard'; prices: PublicPriceList | null }> {
  const clean = (doc: PublicPriceList | null): PublicPriceList | null =>
    doc && {
      serviceRows: doc.serviceRows || [],
      flatRates: doc.flatRates || [],
      additionalRoomRates:
        doc.additionalRoomRates && (doc.additionalRoomRates.unfurnishedPerRoom != null || doc.additionalRoomRates.furnishedPerRoom != null)
          ? doc.additionalRoomRates
          : null,
      cancellationFee: doc.cancellationFee ?? null,
      terms: ((doc.terms || []) as unknown as { text?: string }[]).map((t) => t.text || '').filter(Boolean),
    };

  if (franchiseeId) {
    const own = await sanityClient.fetch<PublicPriceList | null>(
      `*[_type == "priceList" && owner._ref == $franchiseeId && isDefault == true][0] { ${PUBLIC_FIELDS} }`,
      { franchiseeId }
    );
    if (own) return { source: 'local', prices: clean(own) };
  }
  // Only the Standard default — never the client-account lists that also have no owner
  const standard = await sanityClient.fetch<PublicPriceList | null>(
    `*[_type == "priceList" && !defined(owner) && isDefault == true][0] { ${PUBLIC_FIELDS} }`
  );
  return { source: 'standard', prices: clean(standard) };
}

export async function lookupPrices(input: string): Promise<PriceLookup | null> {
  const place = await locatePlace(input);
  if (!place) return null;
  const found = await branchFor(place);
  const franchisee = found?.covered ? found.franchisee : null;
  const { source, prices } = await getPublicPrices(franchisee?.id || null);
  return {
    place: place.label,
    covered: !!franchisee,
    branch: franchisee ? toBranch(franchisee) : null,
    nearest: found && !found.covered ? { ...toBranch(found.franchisee), miles: found.miles } : null,
    source,
    prices,
  };
}
