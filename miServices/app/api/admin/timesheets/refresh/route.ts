import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { clearTimesheetCache } from '@/lib/servicem8/timesheets';

/** POST — Drop cached timesheet pulls so the next view is fresh from ServiceM8 */
export async function POST() {
  const { response } = await requireAdmin();
  if (response) return response;

  clearTimesheetCache();
  return NextResponse.json({ ok: true });
}
