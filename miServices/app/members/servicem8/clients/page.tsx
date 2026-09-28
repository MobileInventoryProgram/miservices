import Link from 'next/link';
import { FiSearch, FiX } from 'react-icons/fi';
import Pagination from '@/components/members/Pagination';
import { parsePage, slicePage, TABLE_PAGE_SIZE } from '@/lib/pagination';
import { oldest } from '@/lib/servicem8/cache';
import { completedJobs, reference } from '@/lib/servicem8/data';
import { clients, jobRows } from '@/lib/servicem8/reports';
import { adminOnly, csvHref, hrefWith, param, rangeOf, type SearchParams } from '../params';
import { SM8_BASE } from '../tabs';
import { Bar, Change, CsvLink, day, Empty, ErrorBox, money, num, Panel, pct, Pulled, Stat, StatGrid, tableHead, tableWrap, td, th } from '../ui';

export const maxDuration = 60;

const PATH = `${SM8_BASE}/clients`;
const SHOW = {
  '': 'All clients',
  growing: 'Growing',
  dropping: 'Dropping off',
  lapsed: 'No work this period',
} as const;
type Show = keyof typeof SHOW;

/** How many of the chosen client's jobs to list */
const CLIENT_JOBS_LIMIT = 200;

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const range = rangeOf(searchParams);
  if (range.error) return <ErrorBox message={range.error} />;
  const q = param(searchParams, 'q').trim().toLowerCase();
  const show = (param(searchParams, 'show') in SHOW ? param(searchParams, 'show') : '') as Show;
  const chosen = param(searchParams, 'client');

  let result;
  try {
    const [ref, done, before] = await Promise.all([reference(), completedJobs(range.from, range.to), completedJobs(range.previous.from, range.previous.to)]);
    result = {
      rows: clients(done.data, before.data, ref.data),
      detail: chosen ? jobRows(done.data.filter((j) => j.clientId === (chosen === 'none' ? '' : chosen)), ref.data) : null,
      at: oldest(ref, done, before),
    };
  } catch (error) {
    console.error('ServiceM8 clients failed:', error);
    return <ErrorBox message="Could not load clients from ServiceM8. Try again in a minute." />;
  }
  const { rows, detail, at } = result;

  const active = rows.filter((r) => r.jobs > 0);
  const top = active.slice(0, 5);
  const topShare = top.reduce((n, r) => n + r.share, 0);
  const growing = active.filter((r) => r.change !== null && r.change >= 0.1);
  const dropping = active.filter((r) => r.change !== null && r.change <= -0.1);
  const lapsed = rows.filter((r) => r.lapsed);

  const filtered = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q)) return false;
    if (show === 'growing') return growing.includes(r);
    if (show === 'dropping') return dropping.includes(r) || r.lapsed;
    if (show === 'lapsed') return r.lapsed;
    return r.jobs > 0 || r.lapsed;
  });
  const { items, ...paging } = slicePage(filtered, parsePage(searchParams.page), TABLE_PAGE_SIZE);
  const max = Math.max(...rows.map((r) => r.value), 0);
  const chosenRow = chosen ? rows.find((r) => (r.id || 'none') === chosen) : null;

  return (
    <>
      <StatGrid>
        <Stat label="Clients with work" value={num(active.length)} detail={`${num(lapsed.length)} worked with before, not this period`} />
        <Stat label="Top 5 clients" value={pct(topShare)} detail="of completed job value" tone={topShare > 0.6 ? 'amber' : 'default'} />
        <Stat label="Growing" value={num(growing.length)} detail="Up 10% or more on the period before" />
        <Stat label="Dropping off" value={num(dropping.length + lapsed.length)} detail="Down 10% or more, or no work this period" tone={dropping.length + lapsed.length ? 'amber' : 'default'} />
      </StatGrid>

      {chosen && (
        <Panel
          title={chosenRow?.name || 'Client'}
          intro={
            chosenRow
              ? `${num(chosenRow.jobs)} jobs completed, ${money(chosenRow.value)} (period before: ${num(chosenRow.previousJobs)} jobs, ${money(chosenRow.previousValue)})`
              : 'No jobs for this client in the range.'
          }
          actions={
            <div className="flex gap-2">
              <CsvLink href={csvHref('client-jobs', searchParams)} label="Jobs CSV" />
              <Link href={hrefWith(PATH, searchParams, { client: null })} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                <FiX className="h-4 w-4" /> Close
              </Link>
            </div>
          }
        >
          <div className={tableWrap}>
            <table className="w-full text-sm">
              <thead>
                <tr className={tableHead}>
                  <th scope="col" className={th}>Job</th>
                  <th scope="col" className={th}>Completed</th>
                  <th scope="col" className={th}>Job type</th>
                  <th scope="col" className={`${th} text-right`}>Value</th>
                  <th scope="col" className={th}>Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(detail || []).slice(0, CLIENT_JOBS_LIMIT).map((j) => (
                  <tr key={j.id}>
                    <td className={`${td} whitespace-nowrap font-medium text-gray-900`}>
                      {j.number}
                      {j.postcode && <div className="text-xs font-normal text-gray-500">{j.postcode}</div>}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{day(j.completedAt)}</td>
                    <td className={td}>{j.category}</td>
                    <td className={`${td} text-right`}>{money(j.value, 2)}</td>
                    <td className={td}>{j.value > 0 ? (j.paid ? 'Yes' : <span className="text-amber-800">Not marked</span>) : '—'}</td>
                  </tr>
                ))}
                {!detail?.length && <Empty colSpan={5}>No jobs completed for this client in the range.</Empty>}
              </tbody>
            </table>
          </div>
          {detail && detail.length > CLIENT_JOBS_LIMIT && (
            <p className="text-xs text-gray-500">Showing the latest {CLIENT_JOBS_LIMIT} of {num(detail.length)}. Download the CSV for all of them.</p>
          )}
        </Panel>
      )}

      <Panel title="Clients" intro="Completed job value per client, against the same number of days just before." actions={<CsvLink href={csvHref('clients', searchParams)} />}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form action={PATH} className="relative flex-1">
            {Object.entries(searchParams).map(([k, v]) =>
              k === 'q' || k === 'page' || !v ? null : <input key={k} type="hidden" name={k} value={Array.isArray(v) ? v[0] : v} />
            )}
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <label htmlFor="client-search" className="sr-only">
              Search clients
            </label>
            <input
              id="client-search"
              name="q"
              type="search"
              defaultValue={param(searchParams, 'q')}
              placeholder="Search client name, then press Enter"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-light-blue focus:outline-none focus:ring-brand-light-blue"
            />
          </form>
          <div className="flex flex-wrap gap-2 text-sm">
            {(Object.keys(SHOW) as Show[]).map((key) => (
              <Link
                key={key || 'all'}
                href={hrefWith(PATH, searchParams, { show: key || null, page: null })}
                aria-current={show === key ? 'true' : undefined}
                className={`rounded-md border px-3 py-1.5 ${show === key ? 'border-brand-dark-blue bg-blue-50 text-brand-dark-blue' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {SHOW[key]}
              </Link>
            ))}
          </div>
        </div>

        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Client</th>
                <th scope="col" className={`${th} text-right`}>Jobs</th>
                <th scope="col" className={`${th} text-right`}>Value</th>
                <th scope="col" className={`${th} w-1/5`}>Share</th>
                <th scope="col" className={`${th} text-right`}>Period before</th>
                <th scope="col" className={`${th} text-right`}>Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((r) => (
                <tr key={r.id || 'none'} className="hover:bg-gray-50">
                  <td className={td}>
                    <Link href={hrefWith(PATH, searchParams, { client: r.id || 'none' })} scroll={false} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                      {r.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right`}>{num(r.jobs)}</td>
                  <td className={`${td} text-right`}>{money(r.value)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <Bar share={max ? r.value / max : 0} />
                      <span className="w-12 text-right text-xs text-gray-500">{pct(r.share, 1)}</span>
                    </div>
                  </td>
                  <td className={`${td} whitespace-nowrap text-right text-gray-500`}>
                    {money(r.previousValue)}
                    <div className="text-xs">{num(r.previousJobs)} jobs</div>
                  </td>
                  <td className={`${td} text-right`}>{r.lapsed ? <span className="text-xs font-medium text-red-700">No work</span> : <Change value={r.change} />}</td>
                </tr>
              ))}
              {items.length === 0 && <Empty colSpan={6}>No clients match.</Empty>}
            </tbody>
          </table>
        </div>
        <Pagination {...paging} noun={paging.total === 1 ? 'client' : 'clients'} hrefFor={(page) => hrefWith(PATH, searchParams, { page })} />
      </Panel>

      <Pulled at={at} />
    </>
  );
}
