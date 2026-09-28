import 'server-only';

/**
 * Resend's marketing API (contacts, segments, broadcasts), called over REST
 * like lib/email/send.ts. Needs a full-access RESEND_API_KEY.
 * Docs: https://resend.com/docs/api-reference
 */

const API = 'https://api.resend.com';

export class ResendError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Marketing needs the API key and a From address for campaigns */
export function isMarketingConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!marketingFrom();
}

export function marketingFrom(): string {
  return process.env.RESEND_MARKETING_FROM || process.env.RESEND_FROM || '';
}

async function call<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, attempt = 1): Promise<T> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new ResendError('RESEND_API_KEY is not set', 0);
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  // Resend allows about 10 requests a second per account
  if (response.status === 429 && attempt < 4) {
    await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
    return call<T>(method, path, body, attempt + 1);
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new ResendError(data?.message || `Resend ${response.status} for ${path.split('?')[0]}`, response.status);
  return data as T;
}

type List<T> = { data: T[]; has_more?: boolean };
const enc = encodeURIComponent;
const query = (params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && q.set(k, String(v)));
  const s = q.toString();
  return s ? `?${s}` : '';
};

// ─── Contacts ───────────────────────────────────────────────────────────────

export interface ResendContact {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  unsubscribed: boolean;
  created_at?: string;
  properties?: Record<string, { value: string | number } | string | number>;
}

export async function getContact(email: string): Promise<ResendContact | null> {
  try {
    return await call<ResendContact>('GET', `/contacts/${enc(email)}`);
  } catch (error) {
    if (error instanceof ResendError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
}

/**
 * Add or update a contact. Someone who has unsubscribed stays unsubscribed:
 * only they can change that, through Resend's own link.
 */
export async function upsertContact(input: { email: string; firstName?: string; lastName?: string; properties?: Record<string, string> }) {
  const email = input.email.trim().toLowerCase();
  const fields = {
    ...(input.firstName ? { first_name: input.firstName } : {}),
    ...(input.lastName ? { last_name: input.lastName } : {}),
    ...(input.properties && Object.keys(input.properties).length ? { properties: input.properties } : {}),
  };
  const existing = await getContact(email);
  if (existing) {
    if (Object.keys(fields).length) await call('PATCH', `/contacts/${enc(existing.id)}`, fields);
    return { id: existing.id, unsubscribed: existing.unsubscribed };
  }
  const created = await call<{ id: string }>('POST', '/contacts', { email, unsubscribed: false, ...fields });
  return { id: created.id, unsubscribed: false };
}

export function addToSegment(emailOrId: string, segmentId: string) {
  return call('POST', `/contacts/${enc(emailOrId)}/segments/${enc(segmentId)}`);
}

export async function removeFromSegment(emailOrId: string, segmentId: string) {
  try {
    await call('DELETE', `/contacts/${enc(emailOrId)}/segments/${enc(segmentId)}`);
  } catch (error) {
    // Not in the segment (or no such contact) is fine
    if (!(error instanceof ResendError && (error.status === 404 || error.status === 422))) throw error;
  }
}

export function deleteContact(emailOrId: string) {
  return call('DELETE', `/contacts/${enc(emailOrId)}`);
}

// ─── Segments ───────────────────────────────────────────────────────────────

export interface Segment {
  id: string;
  name: string;
}

export async function listSegments(): Promise<Segment[]> {
  return (await call<List<Segment>>('GET', '/segments?limit=100')).data;
}

export async function createSegment(name: string): Promise<Segment> {
  const s = await call<{ id: string; name?: string }>('POST', '/segments', { name });
  return { id: s.id, name: s.name || name };
}

export function renameSegment(id: string, name: string) {
  return call('PATCH', `/segments/${enc(id)}`, { name });
}

/** One page of a segment's contacts */
export async function segmentContacts(segmentId: string, opts: { limit?: number; after?: string } = {}) {
  const page = await call<List<ResendContact>>('GET', `/segments/${enc(segmentId)}/contacts${query({ limit: opts.limit ?? 50, after: opts.after })}`);
  return { contacts: page.data, hasMore: !!page.has_more };
}

/** Every contact in a segment (for syncing; paged 100 at a time) */
export async function allSegmentContacts(segmentId: string): Promise<ResendContact[]> {
  const out: ResendContact[] = [];
  let after: string | undefined;
  for (let i = 0; i < 200; i++) {
    const page = await segmentContacts(segmentId, { limit: 100, after });
    out.push(...page.contacts);
    if (!page.hasMore || !page.contacts.length) break;
    after = page.contacts[page.contacts.length - 1].id;
  }
  return out;
}

// ─── Contact properties ─────────────────────────────────────────────────────

export async function listContactProperties(): Promise<{ id: string; key: string }[]> {
  return (await call<List<{ id: string; key: string }>>('GET', '/contact-properties?limit=100')).data;
}

export function createContactProperty(key: string) {
  return call('POST', '/contact-properties', { key, type: 'string' });
}

// ─── Broadcasts ─────────────────────────────────────────────────────────────

export type BroadcastStatus = 'draft' | 'scheduled' | 'queued' | 'sending' | 'sent' | 'canceled' | string;

export interface Broadcast {
  id: string;
  name?: string | null;
  segment_id?: string | null;
  audience_id?: string | null;
  from?: string;
  subject?: string;
  reply_to?: string | string[] | null;
  preview_text?: string | null;
  html?: string | null;
  text?: string | null;
  status: BroadcastStatus;
  created_at: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
}

export interface BroadcastInput {
  name: string;
  segmentId: string;
  subject: string;
  previewText?: string;
  html: string;
  text?: string;
  replyTo?: string;
}

const broadcastBody = (b: BroadcastInput) => ({
  name: b.name,
  segment_id: b.segmentId,
  from: marketingFrom(),
  subject: b.subject,
  html: b.html,
  ...(b.text ? { text: b.text } : {}),
  ...(b.previewText ? { preview_text: b.previewText } : {}),
  ...(b.replyTo ? { reply_to: b.replyTo } : {}),
});

export async function listBroadcasts(opts: { limit?: number; after?: string } = {}) {
  const page = await call<List<Broadcast>>('GET', `/broadcasts${query({ limit: opts.limit ?? 50, after: opts.after })}`);
  return { broadcasts: page.data, hasMore: !!page.has_more };
}

export function getBroadcast(id: string) {
  return call<Broadcast>('GET', `/broadcasts/${enc(id)}`);
}

export async function createBroadcast(input: BroadcastInput): Promise<string> {
  return (await call<{ id: string }>('POST', '/broadcasts', broadcastBody(input))).id;
}

export function updateBroadcast(id: string, input: BroadcastInput) {
  return call('PATCH', `/broadcasts/${enc(id)}`, broadcastBody(input));
}

/** Send now, or at an ISO time */
export function sendBroadcast(id: string, scheduledAt?: string) {
  return call('POST', `/broadcasts/${enc(id)}/send`, scheduledAt ? { scheduled_at: scheduledAt } : {});
}

/** A scheduled campaign goes back to draft */
export function cancelBroadcast(id: string) {
  return call('POST', `/broadcasts/${enc(id)}/cancel`);
}

export function deleteBroadcast(id: string) {
  return call('DELETE', `/broadcasts/${enc(id)}`);
}

export type RecipientType = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed' | 'suppressed';

export interface Recipient {
  id: string;
  contact_id?: string | null;
  email: string;
  count?: number;
  bounce_type?: string;
}

/** Everyone with an event of this type (up to `max`, paged 100 at a time). Resend caches these for up to 15 minutes. */
export async function broadcastRecipients(id: string, type: RecipientType, max = 1000): Promise<{ recipients: Recipient[]; more: boolean }> {
  const recipients: Recipient[] = [];
  let after: string | undefined;
  let more = false;
  while (recipients.length < max) {
    const page = await call<List<Recipient>>('GET', `/broadcasts/${enc(id)}/recipients${query({ type, limit: 100, after })}`);
    recipients.push(...page.data);
    more = !!page.has_more;
    if (!more || !page.data.length) break;
    after = page.data[page.data.length - 1].id;
  }
  return { recipients, more };
}

export async function broadcastClickedLinks(id: string) {
  return (await call<List<{ id: string; url: string; clicks: number; unique_clicks: number }>>('GET', `/broadcasts/${enc(id)}/clicked-links?limit=100`)).data;
}

// ─── Domains ────────────────────────────────────────────────────────────────

/** Sending domains and whether Resend has verified them */
export async function listDomains(): Promise<{ name: string; status: string }[]> {
  return (await call<List<{ name: string; status: string }>>('GET', '/domains')).data;
}

// ─── Webhooks ───────────────────────────────────────────────────────────────

export async function listWebhooks() {
  return (await call<List<{ id: string; endpoint: string; events?: string[] }>>('GET', '/webhooks')).data;
}

export function createWebhook(endpoint: string, events: string[]) {
  return call<{ id: string; signing_secret?: string }>('POST', '/webhooks', { endpoint, events });
}
