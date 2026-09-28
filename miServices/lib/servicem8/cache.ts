/**
 * Short-lived, in-memory copies of ServiceM8 pulls, so switching tabs and
 * ranges doesn't hit ServiceM8 again. Nothing is written anywhere else: when
 * the server restarts, or an entry expires, it's simply pulled again.
 */

type Entry = { at: number; ttl: number; value: Promise<unknown> };

/** A value and when it was pulled from ServiceM8 */
export interface Pulled<T> {
  data: T;
  at: number;
}

// On globalThis so every page and route shares one cache (Next bundles them separately)
const store = globalThis as typeof globalThis & { __sm8Cache?: Map<string, Entry> };
const cache = (store.__sm8Cache ??= new Map<string, Entry>());

/** Upper bound on cached pulls; the oldest go first */
const MAX_ENTRIES = 120;

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<Pulled<T>> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.value as Promise<Pulled<T>>;

  const at = Date.now();
  const value = load().then((data) => ({ data, at }));
  cache.delete(key);
  cache.set(key, { at, ttl: ttlMs, value });
  value.catch(() => cache.delete(key));
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!);
  return value;
}

/** Forget every cached pull so the next view comes straight from ServiceM8 */
export function clearServiceM8Cache() {
  cache.clear();
}

/** The oldest pull behind a view: what "pulled at" should show */
export function oldest(...pulls: { at: number }[]): number {
  return Math.min(...pulls.map((p) => p.at));
}

/** Run jobs a few at a time, keeping order */
export async function inBatches<T, R>(items: T[], size: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  return out;
}
