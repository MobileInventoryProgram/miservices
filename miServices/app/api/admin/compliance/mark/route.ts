import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { findItem, markByAdmin } from '@/lib/compliance/records';
import { isDate } from '@/lib/dates';

/**
 * POST — Head Office ticks an item for a franchise:
 * { franchiseId, requirementId, period, action: 'done' | 'notApplicable' | 'undo', note?, expiresOn? }
 */
export async function POST(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;
    const action = body.action as 'done' | 'notApplicable' | 'undo';
    if (!['done', 'notApplicable', 'undo'].includes(action)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    const found = await findItem(String(body.franchiseId || ''), String(body.requirementId || ''), body.period || null);
    if ('error' in found) return NextResponse.json({ error: found.error }, { status: 400 });

    // Undo removes the record the item already has; ticks file a new or existing one
    const period = action === 'undo' ? found.item.record?.period : found.period;
    if (!period) return NextResponse.json({ error: 'Nothing to undo.' }, { status: 400 });
    await markByAdmin({
      franchiseId: String(body.franchiseId),
      requirementId: String(body.requirementId),
      period,
      action,
      by: session.user.name || session.user.email,
      note: String(body.note || '').trim().slice(0, 1000),
      expiresOn: body.expiresOn && isDate(body.expiresOn) ? body.expiresOn : null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Compliance mark failed:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
