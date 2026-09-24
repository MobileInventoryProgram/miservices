import { NextResponse } from 'next/server';
import { isEmailConfigured, sendEmail } from '@/lib/email/send';
import { quoteResponseEmail } from '@/lib/email/templates';
import { sanityWriteClient } from '@/lib/sanity';
import { getQuoteByToken } from '@/lib/quote/quotes';
import { siteUrl } from '@/lib/quote/render';
import { effectiveStatus, quoteClientName } from '@/lib/quote/types';

/**
 * POST — Client accepts or declines a quote from its public link (no login).
 * Body: { action: 'accept' | 'decline', name, reason? }
 */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const quote = await getQuoteByToken(token);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const status = effectiveStatus(quote);
    if (status === 'accepted' || status === 'declined') {
      return NextResponse.json({ error: 'This quote has already been answered.' }, { status: 409 });
    }
    if (status === 'expired') {
      return NextResponse.json({ error: 'This quote has expired. Please contact us for an updated quote.' }, { status: 409 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = body.action === 'accept' ? 'accept' : body.action === 'decline' ? 'decline' : null;
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 2000) : '';

    if (!action) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });

    const now = new Date().toISOString();
    await sanityWriteClient
      .patch(quote._id)
      .set({
        status: action === 'accept' ? 'accepted' : 'declined',
        respondedAt: now,
        respondedByName: name,
        ...(action === 'decline' && reason ? { declineReason: reason } : {}),
        updatedAt: now,
        ...(quote.viewedAt ? {} : { viewedAt: now }),
      })
      .commit();

    // Let the franchise know (best effort — the response is saved either way)
    if (isEmailConfigured()) {
      const recipients = Array.from(
        new Set([quote.ownerEmail, ...(quote.franchise.owners || []).map((o) => o.email)].filter((e): e is string => !!e))
      );
      if (recipients.length) {
        const email = quoteResponseEmail({
          accepted: action === 'accept',
          reference: quote.reference || '',
          clientName: quote.contact?.companyName || quoteClientName(quote),
          respondedByName: name,
          reason,
          quoteUrl: siteUrl(request, `/members/quoting/${quote._id}`),
        });
        const result = await sendEmail({ to: recipients, subject: email.subject, html: email.html, text: email.text });
        if (!result.ok) console.error('Quote response notification failed:', result.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording quote response:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
