import Link from 'next/link';
import { FiX } from 'react-icons/fi';
import { reference } from '@/lib/servicem8/data';
import { staffReport } from '@/lib/servicem8/reports';
import { getTimesheets, parseStaff } from '@/lib/servicem8/timesheets';
import { adminOnly, csvHref, hrefWith, param, rangeOf, type SearchParams } from '../params';
import { SM8_BASE } from '../tabs';
import { Bar, CsvLink, Empty, ErrorBox, money, num, Panel, pct, Pulled, Stat, StatGrid, tableHead, tableWrap, td, th } from '../ui';

export const maxDuration = 60;

const PATH = `${SM8_BASE}/staff`;

export default async function StaffPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const range = rangeOf(searchParams);
  if (range.error) return <ErrorBox message={range.error} />;
  const staffParam = param(searchParams, 'staff');
  const chosen = parseStaff(staffParam);

  let result;
  try {
    const [ref, data] = await Promise.all([reference(), getTimesheets(range.from, range.to)]);
    result = { all: staffReport(data, ref.data), mine: chosen.size ? staffReport(data, ref.data, chosen) : null, at: Math.min(ref.at, Date.parse(data.fetchedAt)) };
  } catch (error) {
    console.error('ServiceM8 staff report failed:', error);
    return <ErrorBox message="Could not load staff figures from ServiceM8. Try again in a minute." />;
  }
  const { all, mine, at } = result;
  const report = mine || all;

  const hours = report.rows.reduce((n, r) => n + r.hours, 0);
  const travel = report.rows.reduce((n, r) => n + r.travelHours, 0);
  const value = report.rows.reduce((n, r) => n + r.value, 0);
  const jobs = report.rows.reduce((n, r) => n + r.completedJobs, 0);
  const maxValue = Math.max(...all.rows.map((r) => r.value), 0);
  const chosenNames = all.rows.filter((r) => chosen.has(r.staffId)).map((r) => r.staffName);

  return (
    <>
      <StatGrid>
        <Stat label={mine ? 'Chosen staff with work' : 'Staff with work'} value={num(report.rows.length)} detail={`${num(jobs)} completed jobs between them`} />
        <Stat label="Hours on site" value={num(hours, 0)} detail={`${num(report.timedVisits)} timed visits`} />
        <Stat label="Travel" value={`${num(travel, 0)} h`} detail={`${pct(hours + travel ? travel / (hours + travel) : null)} of on-the-clock time`} />
        <Stat label="Value per hour on site" value={hours ? money(value / hours) : '—'} detail="Completed job value credited ÷ hours on site" />
      </StatGrid>

      <Panel
        title="By person"
        intro="Jobs are credited the same way as Timesheets: whoever checked in, or whoever was booked if nobody did. Click a name to look at just them."
        actions={<CsvLink href={csvHref('staff', searchParams)} />}
      >
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Staff</th>
                <th scope="col" className={`${th} text-right`}>Completed jobs</th>
                <th scope="col" className={`${th} text-right`}>Hours on site</th>
                <th scope="col" className={`${th} text-right`}>Avg per job</th>
                <th scope="col" className={`${th} text-right`}>Travel</th>
                <th scope="col" className={`${th} text-right`}>Value</th>
                <th scope="col" className={`${th} w-1/6`}><span className="sr-only">Share of value</span></th>
                <th scope="col" className={`${th} text-right`}>Per hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.rows.map((r) => (
                <tr key={r.staffId} className="hover:bg-gray-50">
                  <td className={`${td} whitespace-nowrap`}>
                    <Link href={hrefWith(PATH, searchParams, { staff: r.staffId })} scroll={false} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                      {r.staffName}
                    </Link>
                  </td>
                  <td className={`${td} text-right`}>{num(r.completedJobs)}</td>
                  <td className={`${td} text-right`}>{num(r.hours, 1)}</td>
                  <td className={`${td} text-right`}>{r.hoursPerJob === null ? '—' : `${num(r.hoursPerJob, 2)} h`}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {r.travelHours ? `${num(r.travelHours, 1)} h` : '—'}
                    {r.travelShare !== null && r.travelHours > 0 && <div className="text-xs text-gray-500">{pct(r.travelShare)} of time</div>}
                  </td>
                  <td className={`${td} text-right`}>{money(r.value)}</td>
                  <td className={td}>
                    <Bar share={maxValue ? r.value / maxValue : 0} />
                  </td>
                  <td className={`${td} text-right`}>{r.valuePerHour === null ? '—' : money(r.valuePerHour)}</td>
                </tr>
              ))}
              {report.rows.length === 0 && <Empty colSpan={8}>No check-ins or completed jobs in this range.</Empty>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title={mine ? `Time on site by job type: ${chosenNames.join(', ') || 'selected staff'}` : 'Time on site by job type'}
        intro="Visits checked in and out of (over 12 hours left out). The usual range is the middle half of visits."
        actions={
          mine ? (
            <Link href={hrefWith(PATH, searchParams, { staff: null })} scroll={false} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <FiX className="h-4 w-4" /> Everyone
            </Link>
          ) : undefined
        }
      >
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job type</th>
                <th scope="col" className={`${th} text-right`}>Visits</th>
                <th scope="col" className={`${th} text-right`}>Average</th>
                <th scope="col" className={`${th} text-right`}>Usual range</th>
                {mine && <th scope="col" className={`${th} text-right`}>Everyone’s average</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.jobTypes.map((t) => {
                const everyone = all.jobTypes.find((a) => a.name === t.name);
                return (
                  <tr key={t.name}>
                    <td className={`${td} font-medium text-gray-900`}>{t.name}</td>
                    <td className={`${td} text-right`}>{num(t.visits)}</td>
                    <td className={`${td} text-right`}>{num(t.averageHours, 2)} h</td>
                    <td className={`${td} whitespace-nowrap text-right text-gray-500`}>
                      {num(t.low, 2)}–{num(t.high, 2)} h
                    </td>
                    {mine && <td className={`${td} text-right text-gray-500`}>{everyone ? `${num(everyone.averageHours, 2)} h` : '—'}</td>}
                  </tr>
                );
              })}
              {report.jobTypes.length === 0 && <Empty colSpan={mine ? 5 : 4}>No timed visits in this range.</Empty>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Pulled at={at} note={staffParam ? undefined : 'Times come from check-ins and check-outs in the ServiceM8 app.'} />
    </>
  );
}
