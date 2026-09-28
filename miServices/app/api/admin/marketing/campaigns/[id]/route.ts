import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCampaign, parseCampaignInput, saveCampaign } from '@/lib/marketing/campaigns';
import { deleteBroadcast } from '@/lib/marketing/resend';

/** PATCH — Head Office: save changes to a draft campaign */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const campaign = await getCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  if (campaign.status !== 'draft') return NextResponse.json({ error: 'Only drafts can be changed. Cancel the schedule first.' }, { status: 409 });
  if (campaign.external) return NextResponse.json({ error: 'This campaign was made in Resend, so edit it there.' }, { status: 409 });

  const { input, error } = parseCampaignInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error }, { status: 400 });
  try {
    await saveCampaign(params.id, input);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Saving campaign failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save the campaign.' }, { status: 502 });
  }
}

/** DELETE — Head Office: delete a draft campaign */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const campaign = await getCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  if (campaign.status !== 'draft') return NextResponse.json({ error: 'Only drafts can be deleted.' }, { status: 409 });
  try {
    await deleteBroadcast(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Deleting campaign failed:', err);
    return NextResponse.json({ error: 'Could not delete the campaign.' }, { status: 502 });
  }
}
