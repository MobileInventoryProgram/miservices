import { NextResponse } from 'next/server';
import { recordSubscription } from '@/lib/marketing/sync';
import { verifyResendWebhook } from '@/lib/marketing/webhook';

/**
 * POST — Resend webhook. When a contact unsubscribes (or resubscribes) in
 * Resend, mark the matching CRM contacts so the Members Area shows it.
 * Signed by Resend; anything unsigned is refused.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyResendWebhook(body, request.headers, process.env.RESEND_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(body) as { type?: string; data?: { email?: string; unsubscribed?: boolean } };
    if ((event.type === 'contact.updated' || event.type === 'contact.created') && event.data?.email && typeof event.data.unsubscribed === 'boolean') {
      await recordSubscription(event.data.email, event.data.unsubscribed);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Resend webhook failed:', error);
    // A 500 makes Resend retry later
    return NextResponse.json({ error: 'Could not process' }, { status: 500 });
  }
}
