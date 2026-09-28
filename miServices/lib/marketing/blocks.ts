import { brandLayout, BRAND } from '@/lib/email/templates';
import { escapeHtml } from '@/lib/email/send';

/**
 * Campaign emails are built from simple blocks and rendered into the brand
 * email layout. Safe for the browser too, so the composer previews live.
 * The blocks travel inside the HTML (a hidden comment), so a draft saved in
 * Resend can be opened and edited again without keeping a copy anywhere else.
 */

export type Block =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'button'; text: string; url: string }
  | { id: string; type: 'image'; url: string; alt: string; link?: string }
  | { id: string; type: 'divider' };

export type BlockType = Block['type'];

export interface CompanyDetails {
  legalName: string;
  address: string[];
  companyNumber?: string;
  website: string;
}

/** Placeholder people type in the composer, and what Resend fills in */
export const FIRST_NAME_TOKEN = '{{first_name}}';
const RESEND_FIRST_NAME = '{{{contact.first_name|there}}}';
export const UNSUBSCRIBE_URL = '{{{RESEND_UNSUBSCRIBE_URL}}}';

const BLOCKS_MARK = 'mi-blocks:';

export function newBlock(type: BlockType): Block {
  const id = Math.random().toString(36).slice(2, 10);
  switch (type) {
    case 'heading':
      return { id, type, text: '' };
    case 'text':
      return { id, type, text: '' };
    case 'button':
      return { id, type, text: 'Find out more', url: 'https://' };
    case 'image':
      return { id, type, url: '', alt: '' };
    default:
      return { id, type: 'divider' };
  }
}

export const STARTER_BLOCKS: Block[] = [
  { id: 'h1', type: 'heading', text: '' },
  { id: 't1', type: 'text', text: `Hi ${FIRST_NAME_TOKEN},\n\n` },
];

const safeUrl = (url: string) => (/^https?:\/\//i.test(url.trim()) || url.trim().startsWith('mailto:') ? url.trim() : '');

/** Text with **bold**, line breaks and the first-name placeholder */
function richText(text: string, firstName: (html: string) => string) {
  return firstName(escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
}

function blockHtml(block: Block, firstName: (html: string) => string): string {
  switch (block.type) {
    case 'heading':
      return block.text.trim() ? `<h2 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:${BRAND.NAVY};">${richText(block.text, firstName)}</h2>` : '';
    case 'text':
      return block.text.trim()
        ? block.text
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p) => `<p style="margin:0 0 14px;">${richText(p.trim(), firstName)}</p>`)
            .join('')
        : '';
    case 'button': {
      const url = safeUrl(block.url);
      return url && block.text.trim()
        ? `<p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND.WAVE};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:4px;">${escapeHtml(block.text)}</a></p>`
        : '';
    }
    case 'image': {
      const src = safeUrl(block.url);
      if (!src) return '';
      const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(block.alt)}" width="544" style="display:block;width:100%;max-width:544px;height:auto;border:0;border-radius:4px;">`;
      const link = block.link ? safeUrl(block.link) : '';
      return `<p style="margin:0 0 18px;">${link ? `<a href="${escapeHtml(link)}">${img}</a>` : img}</p>`;
    }
    default:
      return '<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">';
  }
}

function footer(company: CompanyDetails, unsubscribeUrl: string) {
  const lines = [
    [company.legalName, company.companyNumber ? `Company number ${company.companyNumber}` : ''].filter(Boolean).join(' · '),
    company.address.filter(Boolean).join(', '),
  ].filter(Boolean);
  return (
    lines.map((l) => escapeHtml(l)).join('<br>') +
    `<br><br>You’re receiving this because you agreed to hear from miServices. <a href="${unsubscribeUrl}" style="color:#6b7280;">Unsubscribe</a> · <a href="${escapeHtml(company.website)}" style="color:#6b7280;">${escapeHtml(company.website.replace(/^https?:\/\//, ''))}</a>`
  );
}

/** Pack the blocks into a comment so the draft can be edited again */
function packBlocks(blocks: Block[]): string {
  const json = JSON.stringify(blocks);
  const b64 = typeof window === 'undefined' ? Buffer.from(json, 'utf8').toString('base64') : btoa(unescape(encodeURIComponent(json)));
  return `<!--${BLOCKS_MARK}${b64}-->`;
}

/** The blocks inside a saved campaign's HTML, or null if it wasn't made here */
export function unpackBlocks(html: string | null | undefined): Block[] | null {
  const match = html?.match(new RegExp(`<!--${BLOCKS_MARK}([A-Za-z0-9+/=]+)-->`));
  if (!match) return null;
  try {
    const json = typeof window === 'undefined' ? Buffer.from(match[1], 'base64').toString('utf8') : decodeURIComponent(escape(atob(match[1])));
    const blocks = JSON.parse(json);
    return Array.isArray(blocks) ? (blocks as Block[]) : null;
  } catch {
    return null;
  }
}

export interface RenderOptions {
  company: CompanyDetails;
  previewText?: string;
  /**
   * 'send': placeholders for Resend to fill in per person.
   * 'preview'/'test': filled in with a sample name, and a dummy unsubscribe link.
   */
  mode: 'send' | 'preview' | 'test';
  sampleFirstName?: string;
}

/** The email's HTML and plain-text versions */
export function renderCampaign(blocks: Block[], opts: RenderOptions): { html: string; text: string } {
  const name = opts.mode === 'send' ? RESEND_FIRST_NAME : escapeHtml(opts.sampleFirstName || 'there');
  const firstName = (html: string) => html.split(escapeHtml(FIRST_NAME_TOKEN)).join(name);
  const unsubscribe = opts.mode === 'send' ? UNSUBSCRIBE_URL : '#unsubscribe';

  const content = blocks.map((b) => blockHtml(b, firstName)).join('');
  const html = brandLayout(content, { preheader: opts.previewText, footer: footer(opts.company, unsubscribe) }) + (opts.mode === 'send' ? packBlocks(blocks) : '');

  const plainName = opts.mode === 'send' ? RESEND_FIRST_NAME : opts.sampleFirstName || 'there';
  const text = blocks
    .map((b) => {
      if (b.type === 'heading' || b.type === 'text') return b.text.replace(/\*\*(.+?)\*\*/g, '$1').split(FIRST_NAME_TOKEN).join(plainName).trim();
      if (b.type === 'button') return safeUrl(b.url) ? `${b.text}: ${safeUrl(b.url)}` : '';
      if (b.type === 'divider') return '---';
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
  const footerText = `${opts.company.legalName}\n${opts.company.address.filter(Boolean).join(', ')}\n\nUnsubscribe: ${unsubscribe}`;
  return { html, text: `${text}\n\n--\n${footerText}` };
}

/** Anything that would stop a campaign being sent */
export function campaignProblems(input: { name: string; subject: string; blocks: Block[] }): string[] {
  const problems: string[] = [];
  if (!input.name.trim()) problems.push('Give the campaign a name.');
  if (!input.subject.trim()) problems.push('Add a subject line.');
  const content = input.blocks.filter((b) => (b.type === 'heading' || b.type === 'text' ? b.text.replace(FIRST_NAME_TOKEN, '').replace(/Hi\s*,?/i, '').trim() : b.type !== 'divider'));
  if (!content.length) problems.push('Add some content to the email.');
  if (input.blocks.some((b) => b.type === 'button' && (!safeUrl(b.url) || b.url.trim() === 'https://'))) problems.push('Every button needs a web address starting https://.');
  if (input.blocks.some((b) => b.type === 'image' && !safeUrl(b.url))) problems.push('Every image needs a web address starting https://.');
  return problems;
}
