import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { ukToday } from '@/lib/dates';
import { completedJobs, datedJobs, jobMaterialsSince, openJobs, PRICING_LOOKBACK_DAYS, queuedJobs, reference, unpaidJobs } from '@/lib/servicem8/data';
import { previousRange, parseRange } from '@/lib/servicem8/range';
import { categoryRows, clients, jobRows, moneyOwed, overview, pipeline, pricing, queues, staffReport, toCsv } from '@/lib/servicem8/reports';
import { addDays, getTimesheets } from '@/lib/servicem8/timesheets';

export const maxDuration = 60;

const TABS = ['overview', 'pipeline', 'clients', 'client-jobs', 'staff', 'money-owed', 'money-owed-clients', 'queues', 'pricing', 'pricing-below'] as const;
type Tab = (typeof TABS)[number];

const r2 = (n: number) => Math.round(n * 100) / 100;

/** GET — A ServiceM8 tab's table as CSV, with the same range and filters as the page (read-only, nothing stored) */
export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const params = new URL(request.url).searchParams;
  const tab = params.get('tab') as Tab;
  if (!TABS.includes(tab)) return NextResponse.json({ error: 'Unknown table' }, { status: 400 });
  const { from, to, error } = parseRange(params.get('from'), params.get('to'));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const today = ukToday();

  try {
    const ref = (await reference()).data;
    let csv: string;
    let name: string = tab;

    if (tab === 'overview') {
      const jobs = (await completedJobs(from, to)).data;
      csv = toCsv(
        ['Job type', 'Jobs', 'Value inc VAT', 'Share of value', 'Average'],
        categoryRows(jobs, ref).map((c) => [c.name, c.jobs, c.value, r2(c.share * 100) + '%', c.average])
      );
      name = 'job-types';
    } else if (tab === 'pipeline') {
      const p = pipeline((await openJobs()).data, (await datedJobs(from, to)).data, [], ref, today);
      const stage = params.get('stage');
      csv = toCsv(
        ['Job', 'Stage', 'Created', 'Age (days)', 'Job type', 'Client', 'Postcode'],
        p.open
          .filter((r) => !stage || (stage === 'quote') === (r.status === 'Quote'))
          .map((r) => [r.number, r.status === 'Quote' ? 'Quote' : 'Booked', r.date, r.ageDays, r.category, r.client, r.postcode])
      );
      name = 'open-jobs';
    } else if (tab === 'clients') {
      const prev = previousRange(from, to);
      const rows = clients((await completedJobs(from, to)).data, (await completedJobs(prev.from, prev.to)).data, ref);
      csv = toCsv(
        ['Client', 'Jobs', 'Value inc VAT', 'Share', 'Jobs before', 'Value before', 'Change'],
        rows
          .filter((r) => r.jobs > 0 || r.lapsed)
          .map((r) => [r.name, r.jobs, r.value, r2(r.share * 100) + '%', r.previousJobs, r.previousValue, r.change === null ? '' : r2(r.change * 100) + '%'])
      );
    } else if (tab === 'client-jobs') {
      const client = params.get('client') || '';
      const jobs = (await completedJobs(from, to)).data.filter((j) => j.clientId === (client === 'none' ? '' : client));
      csv = toCsv(
        ['Job', 'Completed', 'Job type', 'Client', 'Value inc VAT', 'Marked paid', 'Postcode'],
        jobRows(jobs, ref).map((j) => [j.number, j.completedAt, j.category, j.client, j.value, j.paid ? 'Yes' : 'No', j.postcode])
      );
      name = 'client-jobs';
    } else if (tab === 'staff') {
      const report = staffReport(await getTimesheets(from, to), ref);
      csv = toCsv(
        ['Staff', 'Completed jobs', 'Hours on site', 'Avg hours per job', 'Travel hours', 'Travel share', 'Value inc VAT', 'Value per hour'],
        report.rows.map((r) => [r.staffName, r.completedJobs, r.hours, r.hoursPerJob, r.travelHours, r.travelShare === null ? '' : r2(r.travelShare * 100) + '%', r.value, r.valuePerHour])
      );
    } else if (tab === 'money-owed' || tab === 'money-owed-clients') {
      const m = moneyOwed((await unpaidJobs()).data, ref, today);
      if (tab === 'money-owed-clients') {
        csv = toCsv(['Client', 'Jobs', 'Owed inc VAT', 'Oldest (days)'], m.clients.map((c) => [c.name, c.jobs, c.value, c.oldestDays]));
      } else {
        const age = params.get('age');
        const client = params.get('client');
        csv = toCsv(
          ['Job', 'Completed', 'Age (days)', 'Client', 'Job type', 'Value inc VAT', 'Postcode'],
          m.list
            .filter((j) => (!age || j.band === age) && (!client || j.clientId === (client === 'none' ? '' : client)))
            .map((j) => [j.number, j.completedAt, j.ageDays, j.client, j.category, j.value, j.postcode])
        );
      }
    } else if (tab === 'queues') {
      const q = queues((await queuedJobs()).data, ref, today);
      const queue = params.get('queue');
      csv = toCsv(
        ['Job', 'Queue', 'Stage', 'Created', 'Queue date', 'Past queue date', 'Job type', 'Client', 'Assigned to', 'Postcode'],
        q.jobs
          .filter((j) => !queue || j.queue === queue)
          .map((j) => [j.number, j.queue, j.status, j.date, j.expiry, j.expired ? 'Yes' : 'No', j.category, j.client, j.assigned, j.postcode])
      );
    } else {
      const p = pricing((await completedJobs(from, to)).data, (await jobMaterialsSince(addDays(from, -PRICING_LOOKBACK_DAYS))).data, ref);
      csv =
        tab === 'pricing'
          ? toCsv(
              ['Item', 'Lines', 'Quantity', 'List price ex VAT', 'Average charged ex VAT', 'Below list', 'Above list', 'Given away ex VAT'],
              p.rows.map((r) => [r.name, r.lines, r.quantity, r.listPrice, r.averageCharged, r.belowList, r.aboveList, r.discount])
            )
          : toCsv(
              ['Job', 'Client', 'Item', 'Quantity', 'List ex VAT', 'Charged ex VAT', 'Difference ex VAT'],
              p.below.map((b) => [b.number, b.client, b.item, b.quantity, b.listPrice, b.charged, b.discount])
            );
    }

    const dated = tab === 'money-owed' || tab === 'money-owed-clients' || tab === 'queues' || tab === 'pipeline' ? today : `${from}-to-${to}`;
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="servicem8-${name}-${dated}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('ServiceM8 export failed:', err);
    return NextResponse.json({ error: 'Could not load from ServiceM8' }, { status: 502 });
  }
}
