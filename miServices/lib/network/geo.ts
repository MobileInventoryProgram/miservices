import 'server-only';

/**
 * Map locations for the franchise network, worked out from each franchise's
 * own postcodes and towns via postcodes.io (free, Open Government Licence).
 * Lookups are cached for 30 days, so a franchise's map updates by itself
 * when its postcodes change.
 */

export type LngLat = [number, number];

export interface FranchiseGeo {
  /** Where the franchise's pin goes */
  pin: LngLat;
  /** Town the pin marks */
  town: string;
  /** e.g. "London", "North West", "Scotland" */
  region: string;
  /** Centre of each postcode district covered */
  points: LngLat[];
}

const API = 'https://api.postcodes.io';
const CACHE = { next: { revalidate: 60 * 60 * 24 * 30 } };
// Bounding box of the UK, to ignore bad results
const inUk = ([lng, lat]: LngLat) => lng > -8.7 && lng < 1.9 && lat > 49.8 && lat < 60.9;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, CACHE);
    if (!response.ok) return null;
    return ((await response.json()) as { result: T }).result ?? null;
  } catch {
    return null;
  }
}

/** Runs `task` over `items`, a few at a time */
async function inBatches<T, R>(items: T[], size: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(task))));
  }
  return results;
}

/**
 * The postcode districts in a franchise's postcode list: "CH1, CH2" as they
 * are, ranges like "CH1-4" expanded, and whole areas like "BA" expanded to
 * BA1–BA20 (districts that don't exist are dropped when looked up).
 */
export function outcodesFor(postCodes: string | null | undefined): string[] {
  const out = new Set<string>();
  for (const raw of (postCodes || '').split(',')) {
    const code = raw.replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, '').toUpperCase();
    const range = code.match(/^([A-Z]{1,2})(\d+)-(\d+)$/);
    if (range) {
      for (let n = Number(range[2]); n <= Number(range[3]); n++) out.add(`${range[1]}${n}`);
    } else if (/^[A-Z]{1,2}$/.test(code)) {
      for (let n = 1; n <= 20; n++) out.add(`${code}${n}`);
    } else if (/^[A-Z]{1,2}\d[A-Z\d]?$/.test(code)) {
      out.add(code);
    }
  }
  return Array.from(out);
}

const outcodeCentres = new Map<string, Promise<LngLat | null>>();
function outcodeCentre(outcode: string): Promise<LngLat | null> {
  if (!outcodeCentres.has(outcode)) {
    outcodeCentres.set(
      outcode,
      getJson<{ longitude: number; latitude: number }>(`/outcodes/${encodeURIComponent(outcode)}`).then((r) =>
        r && r.longitude != null ? ([r.longitude, r.latitude] as LngLat) : null
      )
    );
  }
  return outcodeCentres.get(outcode)!;
}

interface Place {
  name_1: string;
  outcode: string | null;
  local_type: string;
  longitude: number;
  latitude: number;
}

/** The pin: the chosen town (or first town covered) that lies inside the franchise's postcodes */
async function findTown(town: string, outcodes: Set<string>, mustBeCovered: boolean): Promise<{ name: string; at: LngLat } | null> {
  const places = await getJson<Place[]>(`/places?q=${encodeURIComponent(town)}&limit=20`);
  const sameName = (places || []).filter((p) => p.name_1.toLowerCase() === town.toLowerCase());
  const covered = sameName.find((p) => p.outcode && outcodes.has(p.outcode.toUpperCase()));
  const place = covered || (mustBeCovered ? null : sameName[0] || places?.[0]);
  return place ? { name: place.name_1, at: [place.longitude, place.latitude] } : null;
}

async function regionAt([lng, lat]: LngLat): Promise<string> {
  const found = await getJson<{ region: string | null; country: string }[]>(`/postcodes?lon=${lng}&lat=${lat}&limit=1&radius=2000`);
  const hit = found?.[0];
  if (!hit) return 'United Kingdom';
  // England is split into regions; Scotland, Wales and Northern Ireland are shown whole
  return hit.country === 'England' ? hit.region || 'England' : hit.country;
}

export interface GeoInput {
  slug: string;
  postCodes?: string | null;
  townsCities?: string | null;
  mapTown?: string | null;
}

export async function getNetworkGeo(franchisees: GeoInput[]): Promise<Record<string, FranchiseGeo>> {
  const entries = await inBatches(franchisees, 4, async (f) => {
    const outcodes = outcodesFor(f.postCodes);
    const points = (await inBatches(outcodes, 25, outcodeCentre)).filter((p): p is LngLat => !!p && inUk(p));

    const firstTown = (f.townsCities || '').split(',')[0]?.trim();
    const chosen = f.mapTown?.trim();
    const outcodeSet = new Set(outcodes);
    const town = chosen
      ? await findTown(chosen, outcodeSet, false)
      : firstTown
        ? await findTown(firstTown, outcodeSet, true)
        : null;

    // No town found: the middle of the area covered
    const centre: LngLat | null = points.length
      ? [points.reduce((s, p) => s + p[0], 0) / points.length, points.reduce((s, p) => s + p[1], 0) / points.length]
      : null;
    const pin = town && inUk(town.at) ? town.at : centre;
    if (!pin) return null;

    const geo: FranchiseGeo = { pin, town: town?.name || firstTown || '', region: await regionAt(pin), points };
    return [f.slug, geo] as const;
  });
  return Object.fromEntries(entries.filter((e): e is readonly [string, FranchiseGeo] => !!e));
}
