import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { campaignProblems, getCampaign } from '@/lib/marketing/campaigns';
import { sendBroadcast } from '@/lib/marketing/resend';
import { syncFranchiseNetwork } from '@/lib/marketing/sync';

/** Scheduling this far ahead at most */
const MAX_SCHEDULE_DAYS = 60;

/**
 * POST — Head Office: send a saved draft now, or schedule it.
 * Body: { scheduledAt?: ISO string }
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const campaign = await getCampaign(params.id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  if (campaign.status !== 'draft') return NextResponse.json({ error: 'This campaign has already been sent or scheduled.' }, { status: 409 });
  const problems = campaign.external ? [] : campaignProblems(campaign);
  if (problems.length) return NextResponse.json({ error: problems.join(' ') }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { scheduledAt?: unknown };
  let scheduledAt: string | undefined;
  if (body.scheduledAt) {
    const when = new Date(String(body.scheduledAt));
    const ms = when.getTime() - Date.now();
    if (!Number.isFinite(ms) || ms < 2 * 60_000) return NextResponse.json({ error: 'Pick a time at least a few minutes from now.' }, { status: 400 });
    if (ms > MAX_SCHEDULE_DAYS * 86_400_000) return NextResponse.json({ error: `Schedule up to ${MAX_SCHEDULE_DAYS} days ahead.` }, { status: 400 });
    scheduledAt = when.toISOString();
  }

  try {
    // The network list follows who's in the network right now
    if (campaign.list === 'network') await syncFranchiseNetwork();
    await sendBroadcast(params.id, scheduledAt);
    return NextResponse.json({ ok: true, scheduledAt: scheduledAt || null });
  } catch (err) {
    console.error('Sending campaign failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not send the campaign.' }, { status: 502 });
  }
}
