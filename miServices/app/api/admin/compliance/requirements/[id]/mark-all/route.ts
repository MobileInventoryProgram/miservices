import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { markByAdmin } from '@/lib/compliance/records';
import { getComplianceOverview } from '@/lib/compliance/status';

export const maxDuration = 60;

/**
 * POST — Mark a requirement done for every franchise that hasn't done it yet
 * (e.g. agreements signed and training passed for existing franchises).
 * Only for one-off requirements, so nothing recurring is skipped by mistake.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  try {
    const overview = await getComplianceOverview();
    const items = overview.flatMap((f) => f.items.filter((i) => i.requirement._id === params.id).map((i) => ({ franchiseId: f.franchiseId, item: i })));
    if (!items.length) return NextResponse.json({ error: 'Requirement not found.' }, { status: 404 });
    if (items[0].item.requirement.frequency !== 'once') return NextResponse.json({ error: 'Only one-off requirements can be marked for everyone.' }, { status: 400 });

    const todo = items.filter(({ item }) => item.state !== 'done' && item.state !== 'notApplicable');
    const by = session.user.name || session.user.email;
    const note = String(((await request.json().catch(() => ({}))) as { note?: string }).note || 'Marked for every franchise').slice(0, 200);
    for (const { franchiseId } of todo) {
      await markByAdmin({ franchiseId, requirementId: params.id, period: 'once', action: 'done', by, note, expiresOn: null });
    }
    return NextResponse.json({ marked: todo.length });
  } catch (error) {
    console.error('Mark all failed:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
