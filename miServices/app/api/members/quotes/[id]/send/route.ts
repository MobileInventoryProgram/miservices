import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { isEmailConfigured, sendEmail } from '@/lib/email/send';
import { quoteEmail } from '@/lib/email/templates';
import { sanityWriteClient } from '@/lib/sanity';
import { requireQuote } from '@/lib/quote/api';
import { renderQuotePdf } from '@/lib/quote/pdf';
import { getQuoteForScope, getQuotePriceList, getQuoteTemplate, quotePlaceholderValues, resolveQuoteSections } from '@/lib/quote/quotes';
import { getQuoteDocument, quotePdfFilename, siteUrl } from '@/lib/quote/render';
import { fillPlaceholders } from '@/lib/quote/template';

export const runtime = 'nodejs';

/**
 * POST — Send a quote.
 * Body: { mode: 'email' | 'link', to?, subject?, message? }
 *
 * The first send freezes the quote: its sections (placeholders filled in) and
 * a snapshot of the price list are stored, so later edits to the contact,
 * template or price list never change what the client received. A client
 * link is created. With mode 'email' the quote is also emailed (PDF attached,
 * replies go to the sender). Sent quotes can be emailed again.
 *
 * Returns: { shareUrl, emailed }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loaded = await requireQuote(id);
    if (!loaded.ok) return loaded.response;
    const { scope, quote } = loaded.value;

    if (quote.status === 'accepted' || quote.status === 'declined') {
      return NextResponse.json({ error: 'This quote has already been answered.' }, { status: 409 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const mode = body.mode === 'email' ? 'email' : 'link';
    const to = (typeof body.to === 'string' ? body.to : quote.contact?.email || '').trim().toLowerCase();

    if (mode === 'email') {
      if (!isEmailConfigured()) {
        return NextResponse.json(
          { error: 'Email sending isn\'t set up yet. Use "Copy client link" for now.' },
          { status: 503 }
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return NextResponse.json({ error: 'Please enter a valid email address for the client.' }, { status: 400 });
      }
    }

    const template = await getQuoteTemplate();
    const shareToken = quote.shareToken || randomBytes(16).toString('base64url');
    const now = new Date().toISOString();
    const subject = typeof body.subject === 'string' && body.subject.trim() ? body.subject.trim().slice(0, 200) : quote.emailSubject || '';
    const message = typeof body.message === 'string' && body.message.trim() ? body.message.slice(0, 5000) : quote.emailMessage || '';

    if (quote.status === 'draft') {
      // Freeze the quote as sent
      const priceList = await getQuotePriceList(quote);
      if (!priceList) {
        return NextResponse.json({ error: 'The price list for this quote no longer exists. Choose another before sending.' }, { status: 400 });
      }
      const values = quotePlaceholderValues(quote, template);
      const sections = resolveQuoteSections(quote, template).map((section) => ({
        _key: section.key,
        key: section.key,
        title: section.title,
        mode: section.mode,
        text: fillPlaceholders(section.text, values),
      }));

      await sanityWriteClient
        .patch(id)
        .set({
          status: 'sent',
          sections,
          priceSnapshot: JSON.stringify(priceList),
          templateSnapshot: JSON.stringify({
            cover: {
              headline: fillPlaceholders(template.cover.headline, values),
              intro: fillPlaceholders(template.cover.intro, values),
            },
            miProgram: template.miProgram,
          }),
          shareToken,
          sentAt: now,
          ...(mode === 'email' ? { sentTo: to } : {}),
          emailSubject: subject,
          emailMessage: message,
          updatedAt: now,
        })
        .commit();
    } else if (mode === 'email') {
      await sanityWriteClient.patch(id).set({ sentTo: to, emailSubject: subject, emailMessage: message, updatedAt: now }).commit();
    }

    const shareUrl = siteUrl(request, `/quote/${shareToken}`);
    if (mode === 'link') {
      return NextResponse.json({ shareUrl, emailed: false });
    }

    // Email the frozen quote with its PDF
    const sent = await getQuoteForScope(scope, id);
    if (!sent) throw new Error('Quote disappeared after sending');
    const values = quotePlaceholderValues(sent, template);
    const pdf = await renderQuotePdf(await getQuoteDocument(sent));
    const email = quoteEmail({ message: fillPlaceholders(message, values), quoteUrl: shareUrl, reference: sent.reference || '' });

    const result = await sendEmail({
      to,
      subject: fillPlaceholders(subject, values),
      html: email.html,
      text: email.text,
      replyTo: sent.ownerEmail || undefined,
      bcc: sent.ownerEmail || undefined,
      attachments: [{ filename: quotePdfFilename(sent), content: pdf }],
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: `The quote is saved and its client link works, but the email failed: ${result.error}`, shareUrl },
        { status: 502 }
      );
    }
    return NextResponse.json({ shareUrl, emailed: true });
  } catch (error) {
    console.error('Error sending quote:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
