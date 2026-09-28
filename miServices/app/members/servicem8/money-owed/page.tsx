import Link from 'next/link';
import Pagination from '@/components/members/Pagination';
import { ukToday } from '@/lib/dates';
import { parsePage, slicePage, TABLE_PAGE_SIZE } from '@/lib/pagination';
import { oldest } from '@/lib/servicem8/cache';
import { CREDIT_LOOKBACK_DAYS, OWED_LOOKBACK_DAYS, reference, staffFilter, staffSet, unpaidJobs } from '@/lib/servicem8/data';
import { addDays } from '@/lib/servicem8/timesheets';
import { AGE_BANDS, moneyOwed, type AgeBand } from '@/lib/servicem8/reports';
import { adminOnly, csvHref, hrefWith, param, type SearchParams } from '../params';
import { SM8_BASE } from '../tabs';
import { Bar, CsvLink, day, Empty, ErrorBox, money, num, Panel, Pulled, Stat, StatGrid, tableHead, tableWrap, td, th } from '../ui';

export const maxDuration = 60;

const PATH = `${SM8_BASE}/money-owed`;
/** Clients shown before "show all" */
const CLIENT_ROWS = 10;

export default async function MoneyOwedPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const today = ukToday();
  const band = AGE_BANDS.some((b) => b.key === param(searchParams, 'age')) ? (param(searchParams, 'age') as AgeBand) : '';
  const client = param(searchParams, 'client');
  const allClients = param(searchParams, 'clients') === 'all';

  let result;
  try {
    const [ref, unpaid, mine] = await Promise.all([
      reference(),
      unpaidJobs(),
      staffFilter(staffSet(param(searchParams, 'staff')), addDays(today, -(OWED_LOOKBACK_DAYS + CREDIT_LOOKBACK_DAYS))),
    ]);
    result = { m: moneyOwed(unpaid.data.filter(mine.keep), ref.data, today), at: oldest(ref, unpaid, mine) };
  } catch (error) {
    console.error('ServiceM8 money owed failed:', error);
    return <ErrorBox message="Could not load unpaid jobs from ServiceM8. Try again in a minute." />;
  }
  const { m, at } = result;

  const filtered = m.list.filter((j) => (!band || j.band === band) && (!client || j.clientId === (client === 'none' ? '' : client)));
  const { items, ...paging } = slicePage(filtered, parsePage(searchParams.page), TABLE_PAGE_SIZE);
  const maxClient = Math.max(...m.clients.map((c) => c.value), 0);
  const chosenClient = client ? m.clients.find((c) => (c.id || 'none') === client) : null;

  return (
    <>
      <StatGrid>
        <Stat label="Not marked as paid" value={money(m.total)} detail={`${num(m.jobs)} completed jobs in the last ${Math.round(OWED_LOOKBACK_DAYS / 30.4)} months`} />
        {m.bands.slice(1).map((b) => (
          <Stat
            key={b.key}
            label={b.label}
            value={money(b.value)}
            detail={<Link href={hrefWith(PATH, searchParams, { age: b.key, page: null })} className="hover:text-gray-900">{num(b.jobs)} jobs →</Link>}
            tone={b.key === '90+' && b.value > 0 ? 'red' : b.key === '61-90' && b.value > 0 ? 'amber' : 'default'}
          />
        ))}
      </StatGrid>

      <Panel title="By client" intro="Who owes the most, and their oldest unpaid job." actions={<CsvLink href={csvHref('money-owed-clients', searchParams)} />}>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Client</th>
                <th scope="col" className={`${th} text-right`}>Jobs</th>
                <th scope="col" className={`${th} text-right`}>Owed</th>
                <th scope="col" className={`${th} w-1/4`}><span className="sr-only">Share</span></th>
                <th scope="col" className={`${th} text-right`}>Oldest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(allClients ? m.clients : m.clients.slice(0, CLIENT_ROWS)).map((c) => (
                <tr key={c.id || 'none'} className="hover:bg-gray-50">
                  <td className={td}>
                    <Link href={hrefWith(PATH, searchParams, { client: c.id || 'none', page: null })} scroll={false} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                      {c.name}
                    </Link>
                  </td>
                  <td className={`${td} text-right`}>{num(c.jobs)}</td>
                  <td className={`${td} text-right`}>{money(c.value)}</td>
                  <td className={td}>
                    <Bar share={maxClient ? c.value / maxClient : 0} tone={c.oldestDays > 90 ? 'red' : c.oldestDays > 60 ? 'amber' : 'blue'} />
                  </td>
                  <td className={`${td} whitespace-nowrap text-right ${c.oldestDays > 90 ? 'text-red-700' : ''}`}>{num(c.oldestDays)} days</td>
                </tr>
              ))}
              {m.clients.length === 0 && <Empty colSpan={5}>Every completed job is marked as paid.</Empty>}
            </tbody>
          </table>
        </div>
        {m.clients.length > CLIENT_ROWS && (
          <Link href={hrefWith(PATH, searchParams, { clients: allClients ? null : 'all' })} scroll={false} className="text-sm text-brand-light-blue hover:text-brand-dark-blue">
            {allClients ? 'Show top 10' : `Show all ${num(m.clients.length)} clients`}
          </Link>
        )}
      </Panel>

      <Panel
        title={chosenClient ? `Unpaid jobs: ${chosenClient.name}` : 'Unpaid jobs'}
        intro="Oldest first. Age is days since the job was completed."
        actions={<CsvLink href={csvHref('money-owed', searchParams)} />}
      >
        <div className="flex flex-wrap gap-2 text-sm">
          {[{ key: '', label: 'Any age' }, ...AGE_BANDS].map((b) => (
            <Link
              key={b.key || 'any'}
              href={hrefWith(PATH, searchParams, { age: b.key || null, page: null })}
              aria-current={band === b.key ? 'true' : undefined}
              className={`rounded-md border px-3 py-1.5 ${band === b.key ? 'border-brand-dark-blue bg-blue-50 text-brand-dark-blue' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {b.label}
            </Link>
          ))}
          {client && (
            <Link href={hrefWith(PATH, searchParams, { client: null, page: null })} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">
              {chosenClient?.name || 'Client'} ✕
            </Link>
          )}
        </div>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job</th>
                <th scope="col" className={th}>Completed</th>
                <th scope="col" className={`${th} text-right`}>Age</th>
                <th scope="col" className={th}>Client</th>
                <th scope="col" className={th}>Job type</th>
                <th scope="col" className={`${th} text-right`}>Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className={`${td} whitespace-nowrap font-medium text-gray-900`}>
                    {j.number}
                    {j.postcode && <div className="text-xs font-normal text-gray-500">{j.postcode}</div>}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{day(j.completedAt)}</td>
                  <td className={`${td} whitespace-nowrap text-right ${j.ageDays > 90 ? 'text-red-700' : j.ageDays > 60 ? 'text-amber-800' : ''}`}>{num(j.ageDays)} days</td>
                  <td className={td}>{j.client}</td>
                  <td className={td}>{j.category}</td>
                  <td className={`${td} text-right`}>{money(j.value, 2)}</td>
                </tr>
              ))}
              {items.length === 0 && <Empty colSpan={6}>No unpaid jobs match.</Empty>}
            </tbody>
          </table>
        </div>
        <Pagination {...paging} noun={paging.total === 1 ? 'job' : 'jobs'} hrefFor={(page) => hrefWith(PATH, searchParams, { page })} />
      </Panel>

      <Pulled
        at={at}
        note="This relies on the “Payment received” tick in ServiceM8: a job paid but not ticked shows here. Jobs with no value are left out. Invoices are sent from your accounts system, so check there before chasing."
      />
    </>
  );
}
