import { parsePage, slicePage, TABLE_PAGE_SIZE } from '@/lib/pagination';
import { parseRange } from '@/lib/servicem8/range';
import { filterLines, filterSummary, getTimesheets, type TimesheetData } from '@/lib/servicem8/timesheets';
import { adminOnly, type SearchParams } from '../params';
import TimesheetsView from './TimesheetsView';

export const maxDuration = 60;

const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || '';

export default async function TimesheetsPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();

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
      error={loadError}
      summary={data ? filterSummary(data.summary, { staff }) : []}
      lines={items}
      paging={paging}
      fetchedAt={data?.fetchedAt ?? null}
    />
  );
}
