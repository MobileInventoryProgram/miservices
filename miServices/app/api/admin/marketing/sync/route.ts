import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { forgetListCounts } from '@/lib/marketing/campaigns';
import { isMarketingConfigured } from '@/lib/marketing/resend';
import { syncAllContacts, syncFranchiseNetwork } from '@/lib/marketing/sync';

export const maxDuration = 60;

/** POST — Head Office: bring a list up to date. Body: { list: 'network' | 'contacts' } */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  if (!isMarketingConfigured()) return NextResponse.json({ error: 'Email marketing is not set up yet.' }, { status: 503 });

  const { list } = (await request.json().catch(() => ({}))) as { list?: string };
  try {
    forgetListCounts();
    if (list === 'network') return NextResponse.json({ ok: true, ...(await syncFranchiseNetwork()) });
    if (list === 'contacts') return NextResponse.json({ ok: true, ...(await syncAllContacts()) });
    return NextResponse.json({ error: 'Unknown list' }, { status: 400 });
  } catch (err) {
    console.error('List sync failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not sync the list.' }, { status: 502 });
  }
}
