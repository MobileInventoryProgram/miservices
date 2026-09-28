import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sendComplianceReminders } from '@/lib/compliance/reminders';

export const maxDuration = 60;

/**
 * POST — Head Office sends reminders now: { franchiseId } for one franchise,
 * or { overdue: true } for every franchise with something overdue or sent back.
 */
export async function POST(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  try {
    const body = (await request.json().catch(() => ({}))) as { franchiseId?: string; overdue?: boolean };
    let franchiseIds: string[] | undefined;
    if (body.franchiseId) franchiseIds = [body.franchiseId];
    else if (!body.overdue) return NextResponse.json({ error: 'Choose a franchise, or all overdue.' }, { status: 400 });

    const result = await sendComplianceReminders({
      kind: 'manual',
      franchiseIds,
      by: session.user.name || session.user.email,
      onlyBehind: !!body.overdue,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Compliance reminders failed:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
