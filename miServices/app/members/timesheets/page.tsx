import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { parsePage, slicePage, TABLE_PAGE_SIZE } from '@/lib/pagination';
import { parseRange } from '@/lib/servicem8/range';
import { filterLines, filterSummary, getTimesheets, type TimesheetData } from '@/lib/servicem8/timesheets';
import TimesheetsView from './TimesheetsView';

export const metadata: Metadata = {
  title: 'Staff Timesheets | Members Area | miServices',
};

export const maxDuration = 60;

type SearchParams = Record<string, string | string[] | undefined>;
const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || '';

export default async function TimesheetsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/members');
  }

  const range = parseRange(param(searchParams.from), param(searchParams.to));
  const view = param(searchParams.view) === 'lines' ? 'lines' : 'summary';
  const staff = param(searchParams.staff);
  const q = param(searchParams.q);

  let data: TimesheetData | null = null;
  let loadError = range.error;
  if (!loadError) {
    try {
      data = await getTimesheets(range.from, range.to);
    } catch (error) {
      console.error('Error loading timesheets:', error);
      loadError = 'Could not load timesheets from ServiceM8. Try again in a minute.';
    }
  }

  const lines = data ? filterLines(data.lines, { staff, q }) : [];
  const { items, ...paging } = slicePage(lines, parsePage(searchParams.page), TABLE_PAGE_SIZE);

  return (
    <TimesheetsView
      filters={{ from: range.from, to: range.to, view, staff, q }}
      presets={{ today: range.today, yearStart: range.yearStart, lastMonth: range.lastMonth }}
      error={loadError}
      summary={data ? filterSummary(data.summary, { staff }) : []}
      lines={items}
      paging={paging}
      staffOptions={data?.staff.filter((s) => data!.summary.some((r) => r.staffId === s.id)) ?? []}
      fetchedAt={data?.fetchedAt ?? null}
    />
  );
}
