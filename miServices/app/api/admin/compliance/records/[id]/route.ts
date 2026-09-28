import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { reviewRecord } from '@/lib/compliance/records';
import { sanityWriteClient } from '@/lib/sanity';

/** PATCH — { action: 'approve' | 'return', note } a submission. Returning needs a note for the franchise. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  try {
    const body = (await request.json().catch(() => ({}))) as { action?: string; note?: string };
    const note = (body.note || '').trim().slice(0, 1000);
    if (body.action !== 'approve' && body.action !== 'return') return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    if (body.action === 'return' && !note) return NextResponse.json({ error: 'Please say what needs changing.' }, { status: 400 });
    const exists = await sanityWriteClient.fetch<boolean>(`defined(*[_type == "complianceRecord" && _id == $id][0]._id)`, { id: params.id });
    if (!exists) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    await reviewRecord(params.id, body.action, session.user.name || session.user.email, note);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Compliance review failed:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
