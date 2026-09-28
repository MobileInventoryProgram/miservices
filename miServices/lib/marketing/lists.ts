import 'server-only';
import { listDomains, listSegments, marketingFrom, type Segment } from './resend';

/**
 * The marketing lists (Resend segments). Created once by
 * scripts/setup-resend-marketing.ts and found by name, so nothing needs
 * copying into settings.
 */

export const LISTS = {
  customers: { name: 'Customers', description: 'Clients and prospects who agreed to marketing: CRM contacts and website sign-ups' },
  enquiries: { name: 'Franchise enquiries', description: 'People who asked for the franchise prospectus and agreed to marketing' },
  network: { name: 'Franchise network', description: 'Franchise owners and active franchisee logins' },
} as const;

export type ListKey = keyof typeof LISTS;

/** Custom fields set on Resend contacts (text) */
export const CONTACT_PROPERTIES = ['source', 'company', 'client_type', 'franchise', 'crm_id'] as const;

const store = globalThis as typeof globalThis & { __resendSegments?: { at: number; segments: Promise<Segment[]> } };
const TTL = 10 * 60 * 1000;

async function segments(): Promise<Segment[]> {
  const hit = store.__resendSegments;
  if (hit && Date.now() - hit.at < TTL) return hit.segments;
  const loading = listSegments();
  store.__resendSegments = { at: Date.now(), segments: loading };
  loading.catch(() => (store.__resendSegments = undefined));
  return loading;
}

/** Resend's id for one of our lists (throws if setup hasn't been run) */
export async function segmentId(list: ListKey): Promise<string> {
  const found = (await segments()).find((s) => s.name === LISTS[list].name);
  if (!found) throw new Error(`The "${LISTS[list].name}" list doesn't exist in Resend yet. Run scripts/setup-resend-marketing.ts.`);
  return found.id;
}

/** Which of our lists a Resend segment id is (for labelling campaigns) */
export async function listForSegment(id: string | null | undefined): Promise<ListKey | null> {
  if (!id) return null;
  const all = await segments();
  const name = all.find((s) => s.id === id)?.name;
  return (Object.keys(LISTS) as ListKey[]).find((k) => LISTS[k].name === name) ?? null;
}

export function forgetSegments() {
  store.__resendSegments = undefined;
}

/** What's still needed before campaigns can go out (empty when ready) */
export async function setupProblems(): Promise<string[]> {
  const problems: string[] = [];
  if (!process.env.RESEND_API_KEY) problems.push('Add a full-access Resend API key (RESEND_API_KEY).');
  if (!process.env.RESEND_MARKETING_FROM && !process.env.RESEND_FROM) problems.push('Add the address campaigns come from (RESEND_MARKETING_FROM), on a domain verified in Resend.');
  if (!process.env.RESEND_FROM) problems.push('Add the address test emails come from (RESEND_FROM).');
  if (process.env.RESEND_API_KEY) {
    try {
      const names = (await segments()).map((s) => s.name);
      const missing = (Object.keys(LISTS) as ListKey[]).filter((k) => !names.includes(LISTS[k].name));
      if (missing.length) problems.push(`Create the mailing lists in Resend (run scripts/setup-resend-marketing.ts): ${missing.map((k) => LISTS[k].name).join(', ')}.`);
      // Campaigns (even drafts) must come from a domain verified in Resend
      const domains = await listDomains();
      const fromDomain = marketingFrom().match(/@([^>\s]+)/)?.[1]?.toLowerCase();
      const verified = domains.filter((d) => d.status === 'verified').map((d) => d.name.toLowerCase());
      if (!verified.length) problems.push('Verify your sending domain in Resend (Domains → Add domain, then add the DNS records it gives you).');
      else if (fromDomain && !verified.includes(fromDomain)) problems.push(`Campaigns are set to come from ${fromDomain}, which isn’t verified in Resend (verified: ${verified.join(', ')}).`);
    } catch (error) {
      problems.push(`Resend didn’t accept the API key: ${error instanceof Error ? error.message : 'unknown error'}.`);
    }
  }
  if (!process.env.RESEND_WEBHOOK_SECRET) problems.push('Unsubscribes won’t show in Contacts until the Resend webhook is set up (RESEND_WEBHOOK_SECRET).');
  return problems;
}
