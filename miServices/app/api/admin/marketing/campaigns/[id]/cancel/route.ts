import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { cancelBroadcast } from '@/lib/marketing/resend';

/** POST — Head Office: cancel a scheduled campaign (it goes back to a draft) */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    await cancelBroadcast(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Cancelling campaign failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not cancel the campaign.' }, { status: 502 });
  }
}
