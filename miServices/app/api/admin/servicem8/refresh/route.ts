import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { clearServiceM8Cache } from '@/lib/servicem8/cache';
import { clearTimesheetCache } from '@/lib/servicem8/timesheets';

/** POST — Drop every cached ServiceM8 pull so the next view is fresh */
export async function POST() {
  const { response } = await requireAdmin();
  if (response) return response;

  clearServiceM8Cache();
  clearTimesheetCache();
  return NextResponse.json({ ok: true });
}
