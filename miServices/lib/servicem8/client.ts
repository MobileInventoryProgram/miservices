/**
 * Read-only ServiceM8 access for Head Office reports. Uses its own read-only
 * key (SERVICEM8_READ_API_KEY), separate from the booking form's key, and only
 * ever makes GET requests.
 */

const API = 'https://api.servicem8.com/api_1.0';

export class ServiceM8Error extends Error {}

function apiKey(): string {
  const key = process.env.SERVICEM8_READ_API_KEY;
  if (!key) throw new ServiceM8Error('SERVICEM8_READ_API_KEY is not configured');
  return key;
}

async function get<T>(path: string, attempt = 1): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: 'GET',
    headers: { 'X-API-Key': apiKey(), Accept: 'application/json' },
    // Responses run to many MB, too big for Next's data cache; timesheets cache their own results
    cache: 'no-store',
  });

  // Back off and retry if ServiceM8 is rate limiting us
  if (response.status === 429 && attempt < 4) {
    console.warn(`ServiceM8 rate limited ${path.split('?')[0]}, retry ${attempt}`);
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    return get<T>(path, attempt + 1);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ServiceM8Error(`ServiceM8 ${response.status} for ${path.split('?')[0]}: ${body.slice(0, 200)}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Every record of an object type matching the filter, e.g.
 * list('jobactivity', "start_date gt '2026-09-01 00:00:00'").
 * ServiceM8 filters allow `eq`, `ne`, `gt` and `lt`, joined with `and` only.
 */
export function list<T>(object: string, filter?: string): Promise<T[]> {
  const query = filter ? `?%24filter=${encodeURIComponent(filter)}` : '';
  return get<T[]>(`/${object}.json${query}`);
}

/** One record by uuid */
export function getOne<T>(object: string, uuid: string): Promise<T> {
  return get<T>(`/${object}/${encodeURIComponent(uuid)}.json`);
}

/** ServiceM8 timestamp literal ('YYYY-MM-DD HH:MM:SS', account local time) */
export function sm8Date(date: string, time = '00:00:00'): string {
  return `'${date} ${time}'`;
}
