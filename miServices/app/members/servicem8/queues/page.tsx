import Link from 'next/link';
import { ukToday } from '@/lib/dates';
import { oldest } from '@/lib/servicem8/cache';
import { queuedJobs, reference } from '@/lib/servicem8/data';
import { queues } from '@/lib/servicem8/reports';
import { daysBetween } from '@/lib/servicem8/timesheets';
import { adminOnly, csvHref, hrefWith, param, type SearchParams } from '../params';
import { SM8_BASE } from '../tabs';
import { CsvLink, day, Empty, ErrorBox, num, Panel, Pulled, tableHead, tableWrap, td, th } from '../ui';

export const maxDuration = 60;

const PATH = `${SM8_BASE}/queues`;

export default async function QueuesPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const today = ukToday();
  const chosen = param(searchParams, 'queue');

  let result;
  try {
    const [ref, queued] = await Promise.all([reference(), queuedJobs()]);
    result = { ...queues(queued.data, ref.data, today), at: oldest(ref, queued) };
  } catch (error) {
    console.error('ServiceM8 queues failed:', error);
    return <ErrorBox message="Could not load job queues from ServiceM8. Try again in a minute." />;
  }
  const { summary, jobs, at } = result;
  const shown = chosen ? jobs.filter((j) => j.queue === chosen) : jobs;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((q) => {
          const active = chosen === q.name;
          const age = q.oldest ? daysBetween(q.oldest, today) : null;
          return (
            <Link
              key={q.name}
              href={hrefWith(PATH, searchParams, { queue: active ? null : q.name })}
              scroll={false}
              aria-current={active ? 'true' : undefined}
              className={`rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-brand-light-blue ${active ? 'border-brand-dark-blue ring-1 ring-brand-dark-blue' : 'border-gray-200'}`}
            >
              <p className="font-medium text-gray-900">{q.name}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 font-helvetica">{num(q.jobs)}</p>
              <p className="text-xs text-gray-500">
                {age !== null ? <span className={age > 90 ? 'text-amber-800' : ''}>Oldest job created {num(age)} days ago</span> : 'No dates'}
                {q.expired > 0 && <span className="text-red-700"> · {num(q.expired)} past their queue date</span>}
              </p>
            </Link>
          );
        })}
        {summary.length === 0 && <p className="text-sm text-gray-500">No jobs are sitting in a queue.</p>}
      </div>

      <Panel
        title={chosen ? chosen : 'Every queued job'}
        intro="Oldest first within each queue. The queue date is when ServiceM8 flags the job to be looked at again."
        actions={<CsvLink href={csvHref('queues', searchParams)} />}
      >
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job</th>
                {!chosen && <th scope="col" className={th}>Queue</th>}
                <th scope="col" className={th}>Created</th>
                <th scope="col" className={th}>Queue date</th>
                <th scope="col" className={th}>Job type</th>
                <th scope="col" className={th}>Client</th>
                <th scope="col" className={th}>Assigned to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className={`${td} whitespace-nowrap font-medium text-gray-900`}>
                    {j.number || '—'}
                    <div className="text-xs font-normal text-gray-500">
                      {j.status === 'Quote' ? 'Quote' : j.status === 'Work Order' ? 'Booked' : j.status}
                      {j.postcode && ` · ${j.postcode}`}
                    </div>
                  </td>
                  {!chosen && <td className={td}>{j.queue}</td>}
                  <td className={`${td} whitespace-nowrap`}>{day(j.date)}</td>
                  <td className={`${td} whitespace-nowrap ${j.expired ? 'font-medium text-red-700' : ''}`}>{j.expiry ? day(j.expiry) : '—'}</td>
                  <td className={td}>{j.category}</td>
                  <td className={td}>{j.client}</td>
                  <td className={td}>{j.assigned || '—'}</td>
                </tr>
              ))}
              {shown.length === 0 && <Empty colSpan={chosen ? 6 : 7}>No jobs in this queue.</Empty>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Pulled at={at} />
    </>
  );
}
