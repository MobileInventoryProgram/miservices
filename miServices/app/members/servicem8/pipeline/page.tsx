import Link from 'next/link';
import Pagination from '@/components/members/Pagination';
import { ukToday } from '@/lib/dates';
import { parsePage, slicePage, TABLE_PAGE_SIZE } from '@/lib/pagination';
import { oldest } from '@/lib/servicem8/cache';
import { completedJobs, datedJobs, openJobs, reference, staffFilter, staffSet } from '@/lib/servicem8/data';
import { addDays } from '@/lib/servicem8/timesheets';
import { AGE_BANDS, ageBand, pipeline, type AgeBand } from '@/lib/servicem8/reports';
import { adminOnly, csvHref, hrefWith, param, rangeOf, type SearchParams } from '../params';
import { SM8_BASE } from '../tabs';
import { Bar, CsvLink, day, Empty, ErrorBox, num, Panel, pct, Pulled, Stat, StatGrid, tableHead, tableWrap, td, th } from '../ui';

export const maxDuration = 60;

const PATH = `${SM8_BASE}/pipeline`;

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const range = rangeOf(searchParams);
  if (range.error) return <ErrorBox message={range.error} />;
  const today = ukToday();
  const stage = param(searchParams, 'stage') === 'booked' ? 'booked' : param(searchParams, 'stage') === 'quote' ? 'quote' : '';
  const age = AGE_BANDS.some((b) => b.key === param(searchParams, 'age')) ? (param(searchParams, 'age') as AgeBand) : '';

  let result;
  try {
    const since = [addDays(range.from, -90), addDays(today, -365)].sort()[0];
    const [ref, open, dated, done, mine] = await Promise.all([
      reference(),
      openJobs(),
      datedJobs(range.from, range.to),
      completedJobs(range.from, range.to),
      staffFilter(staffSet(param(searchParams, 'staff')), since, true),
    ]);
    result = {
      p: pipeline(open.data.filter(mine.keep), dated.data.filter(mine.keep), done.data.filter(mine.keep), ref.data, today),
      at: oldest(ref, open, dated, done, mine),
      filtered: mine.active,
    };
  } catch (error) {
    console.error('ServiceM8 pipeline failed:', error);
    return <ErrorBox message="Could not load the pipeline from ServiceM8. Try again in a minute." />;
  }
  const { p, at, filtered: byStaff } = result;

  const filtered = p.open.filter(
    (r) => (!stage || (stage === 'quote') === (r.status === 'Quote')) && (!age || (r.ageDays !== null && ageBand(r.ageDays) === age))
  );
  const { items, ...paging } = slicePage(filtered, parsePage(searchParams.page), TABLE_PAGE_SIZE);
  const c = p.conversion;
  const maxLost = Math.max(...p.lost.map((l) => l.unsuccessful + l.chargedCancellation), 0);

  const bandLinks = (which: 'quote' | 'booked', bands: Record<AgeBand, number>) => (
    <ul className="mt-2 space-y-1">
      {AGE_BANDS.map((b) => (
        <li key={b.key}>
          <Link
            href={hrefWith(PATH, searchParams, { stage: which, age: b.key, page: null })}
            className={`flex justify-between rounded px-1 text-xs hover:bg-gray-50 ${b.key === '90+' && bands[b.key] ? 'text-amber-800' : 'text-gray-600'}`}
          >
            <span>{b.label}</span>
            <span className="font-medium">{num(bands[b.key])}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <StatGrid>
        <Stat label="At quote stage" value={num(p.quotes.count)} detail={bandLinks('quote', p.quotes.bands)} tone={p.quotes.bands['90+'] ? 'amber' : 'default'} />
        <Stat label="Booked, not done" value={num(p.booked.count)} detail={bandLinks('booked', p.booked.bands)} />
        <Stat
          label="Went ahead"
          value={pct(c.rate)}
          detail={`Of jobs created in this range that are decided: ${num(c.won)} went ahead, ${num(c.lost)} unsuccessful`}
        />
        <Stat label="Still undecided" value={num(c.waiting)} detail={`Of ${num(c.created)} jobs created in this range, still at quote stage`} />
      </StatGrid>

      <Panel title="Unsuccessful and cancelled" intro="Unsuccessful jobs created in this range, and completed jobs charged as aborted or cancelled, by job type.">
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job type</th>
                <th scope="col" className={`${th} text-right`}>Unsuccessful</th>
                <th scope="col" className={`${th} text-right`}>Charged cancellation</th>
                <th scope="col" className={`${th} w-1/4`}><span className="sr-only">Share</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {p.lost.map((l) => (
                <tr key={l.name}>
                  <td className={`${td} font-medium text-gray-900`}>{l.name}</td>
                  <td className={`${td} text-right`}>{l.unsuccessful ? num(l.unsuccessful) : '—'}</td>
                  <td className={`${td} text-right`}>{l.chargedCancellation ? num(l.chargedCancellation) : '—'}</td>
                  <td className={td}>
                    <Bar share={maxLost ? (l.unsuccessful + l.chargedCancellation) / maxLost : 0} tone="amber" />
                  </td>
                </tr>
              ))}
              {p.lost.length === 0 && <Empty colSpan={4}>No unsuccessful or cancelled jobs in this range.</Empty>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Open jobs"
        intro="Every job at the quote stage or booked and not yet done, oldest first. Age is days since the job was created."
        actions={<CsvLink href={csvHref('pipeline', searchParams)} />}
      >
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { key: '', label: `All (${num(p.open.length)})` },
            { key: 'quote', label: `Quote stage (${num(p.quotes.count)})` },
            { key: 'booked', label: `Booked (${num(p.booked.count)})` },
          ].map((s) => (
            <Link
              key={s.key || 'all'}
              href={hrefWith(PATH, searchParams, { stage: s.key || null, page: null })}
              aria-current={stage === s.key ? 'true' : undefined}
              className={`rounded-md border px-3 py-1.5 ${stage === s.key ? 'border-brand-dark-blue bg-blue-50 text-brand-dark-blue' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {s.label}
            </Link>
          ))}
          {age && (
            <Link href={hrefWith(PATH, searchParams, { age: null, page: null })} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">
              {AGE_BANDS.find((b) => b.key === age)!.label} ✕
            </Link>
          )}
        </div>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job</th>
                <th scope="col" className={th}>Stage</th>
                <th scope="col" className={th}>Created</th>
                <th scope="col" className={`${th} text-right`}>Age</th>
                <th scope="col" className={th}>Job type</th>
                <th scope="col" className={th}>Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className={`${td} whitespace-nowrap font-medium text-gray-900`}>
                    {r.number || '—'}
                    {r.postcode && <div className="text-xs font-normal text-gray-500">{r.postcode}</div>}
                  </td>
                  <td className={td}>{r.status === 'Quote' ? 'Quote' : 'Booked'}</td>
                  <td className={`${td} whitespace-nowrap`}>{day(r.date)}</td>
                  <td className={`${td} whitespace-nowrap text-right ${r.ageDays !== null && r.ageDays > 90 ? 'text-amber-800' : ''}`}>
                    {r.ageDays === null ? '—' : `${num(r.ageDays)} days`}
                  </td>
                  <td className={td}>{r.category}</td>
                  <td className={td}>{r.client}</td>
                </tr>
              ))}
              {items.length === 0 && <Empty colSpan={6}>No open jobs match.</Empty>}
            </tbody>
          </table>
        </div>
        <Pagination {...paging} noun={paging.total === 1 ? 'job' : 'jobs'} hrefFor={(page) => hrefWith(PATH, searchParams, { page })} />
      </Panel>

      <Pulled
        at={at}
        note={`Open jobs are as they stand now; the date range sets which new, unsuccessful and cancelled jobs are counted.${
          byStaff ? ' With staff chosen, quotes nobody is booked on yet won’t show.' : ''
        }`}
      />
    </>
  );
}
