'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCheckCircle, FiInbox, FiList, FiSend } from 'react-icons/fi';
import PageHeader, { headerPrimaryButton, headerSecondaryButton } from '@/components/members/PageHeader';
import type { FranchiseCompliance } from '@/lib/compliance/status';
import { formatUkDate } from '@/lib/dates';

type Row = Omit<FranchiseCompliance, 'items'>;

const selectClass =
  'px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const smallButton = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50';

interface ReminderResult {
  emailConfigured: boolean;
  franchises: { name: string; to: string[]; items: string[]; sent: boolean; error?: string }[];
}

/** What happened when reminders were sent (or would have been) */
function ReminderNotice({ result, onClose }: { result: ReminderResult; onClose: () => void }) {
  const sent = result.franchises.filter((f) => f.sent);
  return (
    <div className={`rounded-lg border p-4 text-sm ${result.emailConfigured ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`} role="status">
      <div className="flex items-start justify-between gap-3">
        <div>
          {!result.franchises.length ? (
            <p>Nobody needed a reminder.</p>
          ) : result.emailConfigured ? (
            <p className="font-medium text-green-800">
              Reminders sent to {sent.length} franchise{sent.length === 1 ? '' : 's'}.
            </p>
          ) : (
            <p className="font-medium text-amber-800">
              Email isn&apos;t set up yet, so nothing was sent. These {result.franchises.length} franchise{result.franchises.length === 1 ? '' : 's'} would have been
              reminded:
            </p>
          )}
          <ul className="mt-2 space-y-1 text-gray-700">
            {result.franchises.map((f) => (
              <li key={f.name}>
                <strong>{f.name}</strong>: {f.items.length} item{f.items.length === 1 ? '' : 's'}
                {f.to.length ? ` → ${f.to.join(', ')}` : ' (no email address)'}
                {f.error && <span className="text-red-700"> · {f.error}</span>}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}

/** Head Office: every franchise's compliance at a glance */
export default function Overview({ franchises, reviewCount, emailConfigured }: { franchises: Row[]; reviewCount: number; emailConfigured: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<ReminderResult | null>(null);
  const [error, setError] = useState('');

  const notCompliant = franchises.filter((f) => !f.compliant).length;
  const rows = useMemo(
    () =>
      franchises.filter((f) =>
        filter === 'not' ? !f.compliant : filter === 'review' ? f.counts.submitted > 0 : filter === 'ok' ? f.compliant : true
      ),
    [franchises, filter]
  );

  const remind = async (key: string, body: object) => {
    setBusy(key);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/compliance/remind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send reminders');
      setResult(data);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Compliance"
        intro={`${franchises.length - notCompliant} of ${franchises.length} franchises compliant · ${reviewCount} awaiting review`}
        actions={
          <>
            <Link href="/members/compliance/requirements" className={headerSecondaryButton}>
              <FiList className="h-4 w-4" /> Requirements
            </Link>
            <Link href="/members/compliance/review" className={headerPrimaryButton}>
              <FiInbox className="h-4 w-4" /> Review queue{reviewCount ? ` (${reviewCount})` : ''}
            </Link>
          </>
        }
      />

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        {!emailConfigured && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            Reminder emails aren&apos;t set up yet (the sending address, RESEND_FROM, is missing). Everything else works; reminders will start once it&apos;s added.
          </p>
        )}
        {result && <ReminderNotice result={result} onClose={() => setResult(null)} />}
        {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="sr-only" htmlFor="compliance-filter">
            Show
          </label>
          <select id="compliance-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className={selectClass}>
            <option value="">All franchises</option>
            <option value="not">Not compliant</option>
            <option value="review">Awaiting review</option>
            <option value="ok">Compliant</option>
          </select>
          <button
            type="button"
            disabled={!!busy || notCompliant === 0}
            onClick={() => remind('all', { overdue: true })}
            className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
          >
            <FiSend className="h-4 w-4" /> {busy === 'all' ? 'Sending…' : 'Remind everyone overdue'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-4 py-3 font-semibold">Franchise</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Done</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Overdue</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">To review</th>
                <th scope="col" className="px-4 py-3 font-semibold">Last reminded</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((f) => {
                const pct = f.counts.applicable ? Math.round((f.counts.done / f.counts.applicable) * 100) : 100;
                const behind = f.counts.overdue + f.counts.returned;
                return (
                  <tr key={f.franchiseId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/members/compliance/franchise/${f.franchiseId}`} className="font-medium text-brand-dark-blue hover:text-brand-light-blue">
                        {f.name}
                      </Link>
                      {f.companyName && f.companyName !== f.name && <div className="text-xs text-gray-500">{f.companyName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {f.compliant ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <FiCheckCircle className="h-3.5 w-3.5" /> Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          <FiAlertCircle className="h-3.5 w-3.5" /> Not compliant
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">
                          {f.counts.done}/{f.counts.applicable}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right ${behind ? 'font-medium text-red-700' : 'text-gray-500'}`}>{behind || '—'}</td>
                    <td className={`px-4 py-3 text-right ${f.counts.submitted ? 'font-medium text-blue-700' : 'text-gray-500'}`}>{f.counts.submitted || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{f.lastReminded ? formatUkDate(f.lastReminded.slice(0, 10)) : 'Never'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => remind(f.franchiseId, { franchiseId: f.franchiseId })}
                        className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                      >
                        <FiSend className="h-4 w-4" /> {busy === f.franchiseId ? 'Sending…' : 'Remind'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No franchises match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
