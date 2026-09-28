import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { parseCampaignInput, saveCampaign } from '@/lib/marketing/campaigns';
import { isMarketingConfigured } from '@/lib/marketing/resend';

/** POST — Head Office: save a new campaign as a draft in Resend. Returns { id } */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  if (!isMarketingConfigured()) return NextResponse.json({ error: 'Email marketing is not set up yet.' }, { status: 503 });

  const { input, error } = parseCampaignInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error }, { status: 400 });
  try {
    return NextResponse.json({ id: await saveCampaign(null, input) }, { status: 201 });
  } catch (err) {
    console.error('Creating campaign failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save the campaign.' }, { status: 502 });
  }
}
