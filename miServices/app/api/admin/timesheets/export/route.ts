import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { parseRange } from '@/lib/servicem8/range';
import { filterLines, filterSummary, getTimesheets, linesCsv, summaryCsv } from '@/lib/servicem8/timesheets';

export const maxDuration = 60;

/** GET — Staff timesheets as a CSV (view=lines|summary), same filters as the page */
export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const params = new URL(request.url).searchParams;
  const { from, to, error } = parseRange(params.get('from'), params.get('to'));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const view = params.get('view') === 'summary' ? 'summary' : 'lines';
  const staff = params.get('staff') || undefined;
  const q = params.get('q') || undefined;

  try {
    const data = await getTimesheets(from, to);
    const csv = view === 'summary' ? summaryCsv(filterSummary(data.summary, { staff })) : linesCsv(filterLines(data.lines, { staff, q }));
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="timesheets-${view}-${from}-to-${to}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Error exporting timesheets:', err);
    return NextResponse.json({ error: 'Could not load timesheets from ServiceM8' }, { status: 502 });
  }
}
