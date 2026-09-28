import { escapeHtml } from '@/lib/email/send';

const NAVY = '#233e8b';
const WAVE = '#157ec3';

/**
 * Simple, email-client-safe branded layout (tables + inline styles).
 * `footer` replaces the standard footer line (marketing adds company
 * details and an unsubscribe link); `preheader` is the inbox preview text.
 */
export function brandLayout(content: string, opts: { footer?: string; preheader?: string } = {}): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}${'&#847;&zwnj;&nbsp;'.repeat(30)}</div>`
    : '';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f3f4f6;">${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:6px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#1f2937;">
<tr><td style="background:${NAVY};padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold;">miServices</td></tr>
<tr><td style="height:4px;background:${WAVE};"></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6;">${content}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.5;color:#6b7280;">${opts.footer ?? 'miServices · www.mobileinventoryservices.co.uk'}</td></tr>
</table></td></tr></table></body></html>`;
}

function layout(content: string): string {
  return brandLayout(content);
}

export const BRAND = { NAVY, WAVE };

function paragraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:${WAVE};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:4px;">${escapeHtml(label)}</a></p>`;
}

export function quoteEmail({ message, quoteUrl, reference }: { message: string; quoteUrl: string; reference: string }) {
  return {
    html: layout(
      `${paragraphs(message)}${button(quoteUrl, 'View your quote')}<p style="margin:0;font-size:13px;color:#6b7280;">Quote reference ${escapeHtml(reference)}. The PDF is attached, and you can accept the quote online.</p>`
    ),
    text: `${message}\n\nView your quote: ${quoteUrl}\n\nQuote reference ${reference}.`,
  };
}

export function quoteResponseEmail({
  accepted,
  reference,
  clientName,
  respondedByName,
  reason,
  quoteUrl,
}: {
  accepted: boolean;
  reference: string;
  clientName: string;
  respondedByName: string;
  reason?: string;
  quoteUrl: string;
}) {
  const headline = accepted ? `${clientName} accepted quote ${reference}` : `${clientName} declined quote ${reference}`;
  const detail = accepted
    ? `${respondedByName} accepted the quote online. Get in touch to set up their account and first bookings.`
    : `${respondedByName} declined the quote online.${reason ? `\n\nReason given: ${reason}` : ''}`;
  return {
    subject: headline,
    html: layout(`<p style="margin:0 0 14px;font-size:18px;font-weight:bold;color:${NAVY};">${escapeHtml(headline)}</p>${paragraphs(detail)}${button(quoteUrl, 'Open the quote')}`),
    text: `${headline}\n\n${detail}\n\n${quoteUrl}`,
  };
}

/** Actions reminder: everything a franchise still has to do, in one email */
export function complianceReminderEmail({
  name,
  items,
  checklistUrl,
}: {
  name: string;
  items: { title: string; detail: string; overdue: boolean }[];
  checklistUrl: string;
}) {
  const overdue = items.filter((i) => i.overdue).length;
  const subject = overdue
    ? `miServices: ${overdue} action${overdue === 1 ? '' : 's'} overdue`
    : `miServices: ${items.length} action${items.length === 1 ? '' : 's'} due soon`;
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;"><strong>${escapeHtml(i.title)}</strong><br><span style="font-size:13px;color:${i.overdue ? '#b45309' : '#6b7280'};">${escapeHtml(i.detail)}</span></td></tr>`
    )
    .join('');
  return {
    subject,
    html: layout(
      `<p style="margin:0 0 14px;">Hello ${escapeHtml(name)},</p>` +
        `<p style="margin:0 0 14px;">Head Office needs the following from you. You can send or confirm ${items.length === 1 ? 'it' : 'each one'} in the Members Area:</p>` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>` +
        button(checklistUrl, 'Open your actions') +
        `<p style="margin:0;font-size:13px;color:#6b7280;">Already sent something? It comes off your list once Head Office has checked it. Reply to this email if you have any questions.</p>`
    ),
    text:
      `Hello ${name},\n\nHead Office needs the following from you. You can send or confirm ${items.length === 1 ? 'it' : 'each one'} in the Members Area:\n\n` +
      items.map((i) => `- ${i.title}: ${i.detail}`).join('\n') +
      `\n\nOpen your actions: ${checklistUrl}\n\nAlready sent something? It comes off your list once Head Office has checked it.`,
  };
}
