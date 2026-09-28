import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { isEmailConfigured, sendEmail } from '@/lib/email/send';
import { renderCampaign } from '@/lib/marketing/blocks';
import { companyDetails, parseCampaignInput } from '@/lib/marketing/campaigns';

/**
 * POST — Head Office: email the campaign as it stands in the composer to the
 * signed-in admin only, with their first name filled in.
 */
export async function POST(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  if (!isEmailConfigured()) return NextResponse.json({ error: 'Email isn’t set up yet (RESEND_FROM is missing).' }, { status: 503 });
  const to = session.user.email;
  if (!to) return NextResponse.json({ error: 'Your login has no email address.' }, { status: 400 });

  const { input, error } = parseCampaignInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error }, { status: 400 });

  const firstName = (session.user.name || '').split(' ')[0] || 'there';
  const { html, text } = renderCampaign(input.blocks, { company: await companyDetails(), previewText: input.previewText, mode: 'test', sampleFirstName: firstName });
  const sent = await sendEmail({ to, subject: `[Test] ${input.subject || 'Untitled campaign'}`, html, text });
  if (!sent.ok) return NextResponse.json({ error: sent.error || 'The test didn’t send.' }, { status: 502 });
  return NextResponse.json({ ok: true, to });
}
