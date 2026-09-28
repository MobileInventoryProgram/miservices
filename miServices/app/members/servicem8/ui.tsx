import Link from 'next/link';
import { FiAlertCircle, FiArrowDownRight, FiArrowUpRight, FiDownload } from 'react-icons/fi';

/** Presentational pieces shared by the ServiceM8 tabs */

export const money = (n: number, dp = 0) => n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: dp, maximumFractionDigits: dp });
export const num = (n: number, dp = 0) => n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const pct = (n: number | null, dp = 0) => (n === null ? '—' : `${(n * 100).toFixed(dp)}%`);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** '2026-09-28' → '28 Sep 2026' */
export function day(date: string | null | undefined) {
  if (!date) return '—';
  return `${Number(date.slice(8, 10))} ${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
}

export const th = 'px-4 py-3 font-semibold';
export const td = 'px-4 py-3 text-gray-700';
export const tableWrap = 'overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm';
export const tableHead = 'bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500';

export function Panel({ title, intro, actions, children }: { title: string; intro?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 font-helvetica">{title}</h2>
          {intro && <p className="text-sm text-gray-500">{intro}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Up or down against the previous period */
export function Change({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-xs text-gray-400">No earlier figure</span>;
  const up = value >= 0;
  const good = invert ? !up : up;
  const Icon = up ? FiArrowUpRight : FiArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${Math.abs(value) < 0.005 ? 'text-gray-500' : good ? 'text-green-700' : 'text-red-700'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {pct(Math.abs(value))}
      <span className="sr-only">{up ? 'up' : 'down'}</span>
    </span>
  );
}

export function Stat({ label, value, detail, tone = 'default' }: { label: string; value: React.ReactNode; detail?: React.ReactNode; tone?: 'default' | 'amber' | 'red' }) {
  const border = tone === 'red' ? 'border-red-200' : tone === 'amber' ? 'border-amber-200' : 'border-gray-200';
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${border}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 font-helvetica">{value}</p>
      {detail && <div className="mt-1 text-xs text-gray-500">{detail}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

/** A labelled horizontal bar, sized against the largest in its list */
export function Bar({ share, tone = 'blue' }: { share: number; tone?: 'blue' | 'amber' | 'red' | 'gray' }) {
  const colour = { blue: 'bg-brand-light-blue', amber: 'bg-amber-400', red: 'bg-red-400', gray: 'bg-gray-300' }[tone];
  return (
    <div className="h-2 w-full min-w-[4rem] rounded-full bg-gray-100" aria-hidden="true">
      <div className={`h-2 rounded-full ${colour}`} style={{ width: `${Math.max(share > 0 ? 2 : 0, Math.min(100, share * 100))}%` }} />
    </div>
  );
}

/** Vertical bars over time (weeks or months) */
export function ColumnChart({ items, format }: { items: { key: string; label: string; value: number; detail?: string }[]; format: (n: number) => string }) {
  const max = Math.max(...items.map((i) => i.value), 0);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-48 items-end gap-1 overflow-x-auto sm:gap-2" role="list">
        {items.map((i) => (
          <div key={i.key} role="listitem" className="group flex h-full min-w-[2.25rem] flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-medium text-gray-700">{format(i.value)}</span>
            <div
              className="w-full max-w-[3.5rem] rounded-t bg-brand-light-blue/80 transition-colors group-hover:bg-brand-dark-blue"
              style={{ height: `${max ? Math.max(2, (i.value / max) * 100) : 0}%` }}
              title={`${i.label}: ${format(i.value)}${i.detail ? ` · ${i.detail}` : ''}`}
            />
            <span className="w-full truncate text-center text-[11px] text-gray-500">{i.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      {message}
    </div>
  );
}

export function Empty({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-500">
        {children}
      </td>
    </tr>
  );
}

/** When the figures were pulled, and that nothing is kept */
export function Pulled({ at, note }: { at: number; note?: React.ReactNode }) {
  const time = new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
  return (
    <p className="max-w-3xl text-xs text-gray-500">
      Live from ServiceM8, pulled at {time}. Nothing is copied or stored; figures are held for a few minutes, then pulled again. Values include VAT, as
      ServiceM8 holds them.{note && <> {note}</>}
    </p>
  );
}

export function CsvLink({ href, label = 'Download CSV' }: { href: string; label?: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
      <FiDownload className="h-4 w-4" /> {label}
    </a>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
      {children}
    </Link>
  );
}
