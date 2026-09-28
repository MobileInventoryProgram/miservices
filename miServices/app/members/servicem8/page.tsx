import { oldest } from '@/lib/servicem8/cache';
import { completedJobs, CREDIT_LOOKBACK_DAYS, datedJobs, reference, staffFilter, staffSet } from '@/lib/servicem8/data';
import { addDays } from '@/lib/servicem8/timesheets';
import { change, overview } from '@/lib/servicem8/reports';
import { adminOnly, csvHref, param, rangeOf, type SearchParams } from './params';
import { Bar, Change, ColumnChart, CsvLink, day, ErrorBox, money, num, Panel, pct, Pulled, Stat, StatGrid, tableHead, tableWrap, td, th, Empty } from './ui';

export const maxDuration = 60;

export default async function ServiceM8Overview({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const range = rangeOf(searchParams);
  if (range.error) return <ErrorBox message={range.error} />;

  let pulled;
  try {
    const [ref, done, before, dated, mine] = await Promise.all([
      reference(),
      completedJobs(range.from, range.to),
      completedJobs(range.previous.from, range.previous.to),
      datedJobs(range.from, range.to),
      staffFilter(staffSet(param(searchParams, 'staff')), addDays(range.previous.from, -CREDIT_LOOKBACK_DAYS), true),
    ]);
    pulled = {
      o: overview(done.data.filter(mine.keep), before.data.filter(mine.keep), dated.data.filter(mine.keep), range.from, range.to, ref.data),
      at: oldest(ref, done, before, dated, mine),
    };
  } catch (error) {
    console.error('ServiceM8 overview failed:', error);
    return <ErrorBox message="Could not load figures from ServiceM8. Try again in a minute." />;
  }
  const { o, at } = pulled;
  const maxCategory = Math.max(...o.categories.map((c) => c.value), 0);
  const vsLabel = `vs ${day(range.previous.from)} – ${day(range.previous.to)}`;

  return (
    <>
      <StatGrid>
        <Stat label="Completed job value" value={money(o.value)} detail={<><Change value={change(o.value, o.previous.value)} /> {vsLabel}</>} />
        <Stat label="Jobs completed" value={num(o.jobs)} detail={<><Change value={change(o.jobs, o.previous.jobs)} /> {num(o.jobs - o.priced)} with no value</>} />
        <Stat label="Average job value" value={money(o.average, 2)} detail={<><Change value={change(o.average, o.previous.average)} /> jobs with a value</>} />
        <Stat
          label="New jobs created"
          value={num(o.created)}
          detail={`${num(o.createdGoneAhead)} gone ahead so far (${pct(o.created ? o.createdGoneAhead / o.created : null)})`}
        />
      </StatGrid>

      <Panel title={`Completed job value by ${o.interval}`} intro="By the date each job was completed.">
        <ColumnChart
          items={o.buckets.map((b) => ({ key: b.key, label: b.label, value: b.value, detail: `${num(b.jobs)} jobs` }))}
          format={(n) => (n >= 1000 ? `£${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : money(n))}
        />
      </Panel>

      <Panel title="By job type" actions={<CsvLink href={csvHref('overview', searchParams)} />}>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job type</th>
                <th scope="col" className={`${th} text-right`}>Jobs</th>
                <th scope="col" className={`${th} text-right`}>Value</th>
                <th scope="col" className={`${th} w-1/4`}>Share of value</th>
                <th scope="col" className={`${th} text-right`}>Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {o.categories.map((c) => (
                <tr key={c.id || 'none'} className="hover:bg-gray-50">
                  <td className={`${td} font-medium text-gray-900`}>{c.name}</td>
                  <td className={`${td} text-right`}>{num(c.jobs)}</td>
                  <td className={`${td} text-right`}>{money(c.value)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <Bar share={maxCategory ? c.value / maxCategory : 0} />
                      <span className="w-10 text-right text-xs text-gray-500">{pct(c.share)}</span>
                    </div>
                  </td>
                  <td className={`${td} text-right`}>{money(c.average, 2)}</td>
                </tr>
              ))}
              {o.categories.length === 0 && <Empty colSpan={5}>No jobs were completed in this range.</Empty>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Pulled at={at} note={`Compared with the same number of days just before (${day(range.previous.from)} – ${day(range.previous.to)}).`} />
    </>
  );
}
