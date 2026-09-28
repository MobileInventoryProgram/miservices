import 'server-only';
import { sanityWriteClient } from '@/lib/sanity';
import { campaignProblems, renderCampaign, unpackBlocks, type Block, type CompanyDetails } from './blocks';
import { LISTS, listForSegment, segmentId, type ListKey } from './lists';
import { createBroadcast, getBroadcast, listBroadcasts, segmentContacts, updateBroadcast, type Broadcast } from './resend';

/** Campaigns are Resend broadcasts; nothing about them is stored in the Members Area */

const WEBSITE = 'https://www.mobileinventoryservices.co.uk';

/** Company details for the email footer (UK rules: who it's from, and how to unsubscribe) */
export async function companyDetails(): Promise<CompanyDetails> {
  const s = await sanityWriteClient
    .fetch<{ legalName?: string; siteName?: string; address?: string[]; companyNumber?: string } | null>(
      `*[_type == "siteSettings"][0]{ legalName, siteName, address, companyNumber }`
    )
    .catch(() => null);
  return {
    legalName: s?.legalName || s?.siteName || 'miServices',
    address: s?.address || [],
    companyNumber: s?.companyNumber || undefined,
    website: WEBSITE,
  };
}

export interface CampaignInput {
  name: string;
  list: ListKey;
  subject: string;
  previewText: string;
  blocks: Block[];
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Clean a campaign from the composer; every block is rebuilt field by field */
export function parseCampaignInput(body: unknown): { input?: CampaignInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const b = body as Record<string, unknown>;
  const list = typeof b.list === 'string' && b.list in LISTS ? (b.list as ListKey) : null;
  if (!list) return { error: 'Choose who the campaign goes to.' };
  if (!Array.isArray(b.blocks) || b.blocks.length > 60) return { error: 'The email content is missing or too long.' };

  const blocks: Block[] = [];
  for (const raw of b.blocks as Record<string, unknown>[]) {
    const id = str(raw?.id, 20) || Math.random().toString(36).slice(2, 10);
    switch (raw?.type) {
      case 'heading':
        blocks.push({ id, type: 'heading', text: str(raw.text, 300) });
        break;
      case 'text':
        blocks.push({ id, type: 'text', text: str(raw.text, 8000) });
        break;
      case 'button':
        blocks.push({ id, type: 'button', text: str(raw.text, 80), url: str(raw.url, 1000).trim() });
        break;
      case 'image':
        blocks.push({ id, type: 'image', url: str(raw.url, 1000).trim(), alt: str(raw.alt, 200), ...(raw.link ? { link: str(raw.link, 1000).trim() } : {}) });
        break;
      case 'divider':
        blocks.push({ id, type: 'divider' });
        break;
    }
  }
  return {
    input: {
      name: str(b.name, 120).trim(),
      list,
      subject: str(b.subject, 200).trim(),
      previewText: str(b.previewText, 200).trim(),
      blocks,
    },
  };
}

/** Save a draft in Resend (create, or update an existing draft). Returns its id. */
export async function saveCampaign(id: string | null, input: CampaignInput): Promise<string> {
  const company = await companyDetails();
  const { html, text } = renderCampaign(input.blocks, { company, previewText: input.previewText, mode: 'send' });
  const fields = {
    name: input.name || 'Untitled campaign',
    segmentId: await segmentId(input.list),
    subject: input.subject || '(no subject yet)',
    previewText: input.previewText || undefined,
    html,
    text,
  };
  if (id) {
    await updateBroadcast(id, fields);
    return id;
  }
  return createBroadcast(fields);
}

export { campaignProblems };

export interface CampaignSummary {
  id: string;
  name: string;
  list: ListKey | null;
  status: string;
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
  const { broadcasts } = await listBroadcasts({ limit: 100 });
  return Promise.all(
    broadcasts.map(async (b) => ({
      id: b.id,
      name: b.name || 'Untitled campaign',
      list: await listForSegment(b.segment_id || b.audience_id),
      status: b.status,
      createdAt: b.created_at,
      scheduledAt: b.scheduled_at || null,
      sentAt: b.sent_at || null,
    }))
  );
}

export interface Campaign extends CampaignInput {
  id: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  /** Made outside the Members Area, so it can't be edited here */
  external: boolean;
  html: string;
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  let b: Broadcast;
  try {
    b = await getBroadcast(id);
  } catch {
    return null;
  }
  const blocks = unpackBlocks(b.html);
  return {
    id: b.id,
    name: b.name || '',
    list: (await listForSegment(b.segment_id || b.audience_id)) || 'customers',
    subject: b.subject === '(no subject yet)' ? '' : b.subject || '',
    previewText: b.preview_text || '',
    blocks: blocks || [],
    external: !blocks,
    status: b.status,
    scheduledAt: b.scheduled_at || null,
    sentAt: b.sent_at || null,
    createdAt: b.created_at,
    html: b.html || '',
  };
}

const COUNT_CAP = 5000;
const COUNT_TTL = 10 * 60 * 1000;
const countStore = globalThis as typeof globalThis & { __listCounts?: Map<string, { at: number; value: Promise<{ subscribers: number; unsubscribed: number }> }> };
const counts = (countStore.__listCounts ??= new Map());

/**
 * Subscribed and unsubscribed people on a list. Resend's metrics endpoint is
 * in private beta, so this pages through the list (up to COUNT_CAP people),
 * and holds the answer for a few minutes.
 */
function countList(id: string) {
  const hit = counts.get(id);
  if (hit && Date.now() - hit.at < COUNT_TTL) return hit.value;
  const value = (async () => {
    let subscribers = 0;
    let unsubscribed = 0;
    let after: string | undefined;
    for (let seen = 0; seen < COUNT_CAP; ) {
      const page = await segmentContacts(id, { limit: 100, after });
      page.contacts.forEach((c) => (c.unsubscribed ? unsubscribed++ : subscribers++));
      seen += page.contacts.length;
      if (!page.hasMore || !page.contacts.length) break;
      after = page.contacts[page.contacts.length - 1].id;
    }
    return { subscribers, unsubscribed };
  })();
  counts.set(id, { at: Date.now(), value });
  value.catch(() => counts.delete(id));
  return value;
}

/** Forget list counts (after a sync) */
export function forgetListCounts() {
  counts.clear();
}

/** Our lists with how many subscribers each has (null if Resend can't say) */
export async function listOptions(): Promise<{ key: ListKey; name: string; subscribers: number | null; unsubscribed: number | null; id: string | null }[]> {
  const keys = Object.keys(LISTS) as ListKey[];
  return Promise.all(
    keys.map(async (key) => {
      const id = await segmentId(key).catch(() => null);
      const c = id ? await countList(id).catch(() => null) : null;
      return { key, name: LISTS[key].name, id, subscribers: c ? c.subscribers : null, unsubscribed: c ? c.unsubscribed : null };
    })
  );
}
