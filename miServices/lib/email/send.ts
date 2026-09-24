/**
 * Transactional email via the Resend REST API (no SDK needed).
 * Needs RESEND_API_KEY and RESEND_FROM (e.g. "miServices <quotes@mobileinventoryservices.co.uk>")
 * — the from-domain must be verified in Resend.
 */

export interface EmailAttachment {
  filename: string;
  content: Buffer | Uint8Array;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
}

export async function sendEmail(message: EmailMessage): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: 'Email sending is not set up yet (RESEND_FROM missing).' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      ...(message.bcc ? { bcc: message.bcc } : {}),
      ...(message.attachments?.length
        ? {
            attachments: message.attachments.map((a) => ({
              filename: a.filename,
              content: Buffer.from(a.content).toString('base64'),
            })),
          }
        : {}),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok || !data.id) {
    console.error('Resend error:', res.status, data);
    return { ok: false, error: data.message || `Email failed (${res.status})` };
  }
  return { ok: true, id: data.id };
}

/** Escape text for HTML email bodies */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
