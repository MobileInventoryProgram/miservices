import Link from 'next/link';
import Pagination from '@/components/members/Pagination';
import { parsePage, slicePage, TABLE_PAGE_SIZE } from '@/lib/pagination';
import { oldest } from '@/lib/servicem8/cache';
import { completedJobs, jobMaterialsSince, PRICING_LOOKBACK_DAYS, reference } from '@/lib/servicem8/data';
import { pricing } from '@/lib/servicem8/reports';
import { addDays } from '@/lib/servicem8/timesheets';
import { adminOnly, csvHref, hrefWith, param, rangeOf, type SearchParams } from '../params';
import { SM8_BASE } from '../tabs';
import { CsvLink, Empty, ErrorBox, money, num, Panel, pct, Pulled, Stat, StatGrid, tableHead, tableWrap, td, th } from '../ui';

export const maxDuration = 60;

const PATH = `${SM8_BASE}/pricing`;

export default async function PricingPage({ searchParams }: { searchParams: SearchParams }) {
  await adminOnly();
  const range = rangeOf(searchParams);
  if (range.error) return <ErrorBox message={range.error} />;
  const showAll = param(searchParams, 'items') === 'all';

  let result;
  try {
    const [ref, done, lines] = await Promise.all([reference(), completedJobs(range.from, range.to), jobMaterialsSince(addDays(range.from, -PRICING_LOOKBACK_DAYS))]);
    result = { p: pricing(done.data, lines.data, ref.data), at: oldest(ref, done, lines) };
  } catch (error) {
    console.error('ServiceM8 pricing failed:', error);
    return <ErrorBox message="Could not load item prices from ServiceM8. Try again in a minute." />;
  }
  const { p, at } = result;
  const listed = p.rows.filter((r) => r.listPrice !== null);
  const rows = showAll ? p.rows : listed;
  const belowLines = listed.reduce((n, r) => n + r.belowList, 0);
  const listedLines = listed.reduce((n, r) => n + r.lines, 0);
  const { items, ...paging } = slicePage(p.below, parsePage(searchParams.page), TABLE_PAGE_SIZE);

  return (
    <>
      <StatGrid>
        <Stat label="Below list price" value={num(belowLines)} detail={`of ${num(listedLines)} priced item lines (${pct(listedLines ? belowLines / listedLines : null, 1)})`} tone={belowLines ? 'amber' : 'default'} />
        <Stat label="Given away" value={money(p.totalDiscount, 2)} detail="Below list price, before VAT" />
        <Stat label="Items used" value={num(listed.length)} detail={`${num(p.rows.length - listed.length)} other lines with no list price`} />
        <Stat label="Jobs with item lines" value={pct(p.coverage.jobs ? p.coverage.withLines / p.coverage.jobs : null)} detail={`${num(p.coverage.withLines)} of ${num(p.coverage.jobs)} completed jobs`} />
      </StatGrid>

      <Panel
        title="By item"
        intro="What each item was charged at on jobs completed in this range, against its price in ServiceM8. Prices before VAT."
        actions={<CsvLink href={csvHref('pricing', searchParams)} />}
      >
        <div className="text-sm">
          <Link href={hrefWith(PATH, searchParams, { items: showAll ? null : 'all' })} scroll={false} className="text-brand-light-blue hover:text-brand-dark-blue">
            {showAll ? 'Only items with a list price' : 'Also show lines with no list price'}
          </Link>
        </div>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Item</th>
                <th scope="col" className={`${th} text-right`}>Lines</th>
                <th scope="col" className={`${th} text-right`}>List price</th>
                <th scope="col" className={`${th} text-right`}>Average charged</th>
                <th scope="col" className={`${th} text-right`}>Below list</th>
                <th scope="col" className={`${th} text-right`}>Above list</th>
                <th scope="col" className={`${th} text-right`}>Given away</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className={`${td} font-medium text-gray-900`}>{r.name}</td>
                  <td className={`${td} text-right`}>{num(r.lines)}</td>
                  <td className={`${td} text-right`}>{r.listPrice === null ? '—' : money(r.listPrice, 2)}</td>
                  <td className={`${td} text-right ${r.listPrice !== null && r.averageCharged < r.listPrice - 0.005 ? 'text-amber-800' : ''}`}>{money(r.averageCharged, 2)}</td>
                  <td className={`${td} text-right`}>{r.belowList ? num(r.belowList) : '—'}</td>
                  <td className={`${td} text-right`}>{r.aboveList ? num(r.aboveList) : '—'}</td>
                  <td className={`${td} text-right`}>{r.discount ? money(r.discount, 2) : '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && <Empty colSpan={7}>No item lines found for jobs completed in this range.</Empty>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Charged below list price" intro="Biggest difference first." actions={p.below.length ? <CsvLink href={csvHref('pricing-below', searchParams)} /> : undefined}>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead>
              <tr className={tableHead}>
                <th scope="col" className={th}>Job</th>
                <th scope="col" className={th}>Client</th>
                <th scope="col" className={th}>Item</th>
                <th scope="col" className={`${th} text-right`}>Qty</th>
                <th scope="col" className={`${th} text-right`}>List</th>
                <th scope="col" className={`${th} text-right`}>Charged</th>
                <th scope="col" className={`${th} text-right`}>Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((b, i) => (
                <tr key={`${b.jobId}-${b.item}-${i}`} className="hover:bg-gray-50">
                  <td className={`${td} whitespace-nowrap font-medium text-gray-900`}>{b.number}</td>
                  <td className={td}>{b.client}</td>
                  <td className={td}>{b.item}</td>
                  <td className={`${td} text-right`}>{num(b.quantity, b.quantity % 1 ? 2 : 0)}</td>
                  <td className={`${td} text-right`}>{money(b.listPrice, 2)}</td>
                  <td className={`${td} text-right`}>{money(b.charged, 2)}</td>
                  <td className={`${td} text-right text-amber-800`}>{money(b.discount, 2)}</td>
                </tr>
              ))}
              {items.length === 0 && <Empty colSpan={7}>Nothing was charged below its list price in this range.</Empty>}
            </tbody>
          </table>
        </div>
        <Pagination {...paging} noun={paging.total === 1 ? 'line' : 'lines'} hrefFor={(page) => hrefWith(PATH, searchParams, { page })} />
      </Panel>

      <Pulled
        at={at}
        note="Compared with the prices set on items in ServiceM8, not the Members Area price lists. Lines typed in by hand have no list price to compare with."
      />
    </>
  );
}
