'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiBookOpen, FiCheck, FiChevronDown, FiFile, FiRotateCcw, FiSend, FiUpload } from 'react-icons/fi';
import { formatUkDate } from '@/lib/dates';
import { categoryTitle, frequencyTitle } from '@/lib/compliance/options';
import type { ComplianceItem, ItemState } from '@/lib/compliance/status';

export const STATE_STYLES: Record<ItemState, { label: string; className: string }> = {
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200' },
  returned: { label: 'Sent back', className: 'bg-red-50 text-red-700 border-red-200' },
  dueSoon: { label: 'Due soon', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  todo: { label: 'To do', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  submitted: { label: 'Awaiting review', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  done: { label: 'Done', className: 'bg-green-50 text-green-700 border-green-200' },
  notApplicable: { label: 'Not applicable', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export function StateBadge({ state }: { state: ItemState }) {
  const s = STATE_STYLES[state];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const smallButton = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50';

export function itemDueText(item: ComplianceItem): string {
  if (item.state === 'done') return item.validUntil ? `Valid until ${formatUkDate(item.validUntil)}` : 'Done';
  if (item.state === 'notApplicable') return '';
  if (item.state === 'submitted') return item.record?.submittedAt ? `Sent ${formatUkDate(item.record.submittedAt.slice(0, 10))}` : '';
  if (!item.due) return 'No deadline';
  return item.state === 'overdue' ? `Overdue since ${formatUkDate(item.due)}` : `Due ${formatUkDate(item.due)}`;
}

async function post(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

/** The franchise's upload / confirm form */
function SubmitForm({ item, onDone }: { item: ComplianceItem; onDone: () => void }) {
  const r = item.requirement;
  const [files, setFiles] = useState<File[]>([]);
  const [expiresOn, setExpiresOn] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const resubmitting = item.state === 'returned';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData();
    form.set('requirementId', r._id);
    if (item.periodKey) form.set('period', item.periodKey);
    form.set('note', note);
    if (expiresOn) form.set('expiresOn', expiresOn);
    form.set('confirmed', String(confirmed));
    files.forEach((f) => form.append('files', f));
    const res = await fetch('/api/compliance/submit', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Failed to send');
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
      {r.evidence === 'upload' ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`file-${item.key}`}>
            {resubmitting && item.record?.files.length ? 'Add or replace files (optional)' : 'Upload'}
          </label>
          <input
            id={`file-${item.key}`}
            type="file"
            multiple
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-dark-blue file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-light-blue"
          />
          <p className="mt-1 text-xs text-gray-500">PDF, JPEG or PNG, up to 10 MB each. Only Head Office can see what you send.</p>
        </div>
      ) : (
        <label className="flex items-start gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-light-blue"
          />
          I confirm this is in place.
        </label>
      )}
      {r.askExpiry && (
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`exp-${item.key}`}>
            Expiry date
          </label>
          <input id={`exp-${item.key}`} type="date" required value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} className={inputClass} />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`note-${item.key}`}>
          Note for Head Office <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea id={`note-${item.key}`} rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={`${smallButton} bg-brand-light-blue px-4 py-2 text-white hover:bg-brand-dark-blue`}>
        {r.evidence === 'upload' ? <FiUpload className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
        {busy ? 'Sending…' : resubmitting ? 'Send again' : 'Send to Head Office'}
      </button>
    </form>
  );
}

/** Head Office's controls for one item */
function AdminActions({ item, franchiseId, onDone }: { item: ComplianceItem; franchiseId: string; onDone: () => void }) {
  const [note, setNote] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [extraDays, setExtraDays] = useState(String(item.extraDays || ''));
  const r = item.requirement;

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setError('');
    try {
      await fn();
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const mark = (action: 'done' | 'notApplicable' | 'undo') =>
    run(action, () => post('/api/admin/compliance/mark', 'POST', { franchiseId, requirementId: r._id, period: item.periodKey, action, note, expiresOn }));
  const setting = (notApplicable: boolean) =>
    run(`setting-${notApplicable}`, () => post('/api/admin/compliance/settings', 'PUT', { franchiseId, requirementId: r._id, notApplicable, extraDays: Number(extraDays) || 0 }));

  const reviewing = item.state === 'submitted' && item.record;
  const open = item.state !== 'done' && item.state !== 'notApplicable';

  return (
    <div className="space-y-3 rounded-md border border-blue-100 bg-blue-50/40 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`an-${item.key}`}>
          Note {reviewing ? '(needed to send it back)' : '(optional)'}
        </label>
        <textarea id={`an-${item.key}`} rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
      </div>
      {open && !reviewing && r.askExpiry && (
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`ae-${item.key}`}>
            Expiry date (if known)
          </label>
          <input id={`ae-${item.key}`} type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} className={inputClass} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {reviewing && (
          <>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => run('approve', () => post(`/api/admin/compliance/records/${item.record!._id}`, 'PATCH', { action: 'approve', note }))}
              className={`${smallButton} bg-green-600 text-white hover:bg-green-700`}
            >
              <FiCheck className="h-4 w-4" /> {busy === 'approve' ? 'Approving…' : 'Approve'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => run('return', () => post(`/api/admin/compliance/records/${item.record!._id}`, 'PATCH', { action: 'return', note }))}
              className={`${smallButton} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
            >
              <FiRotateCcw className="h-4 w-4" /> {busy === 'return' ? 'Sending back…' : 'Send back'}
            </button>
          </>
        )}
        {open && !reviewing && (
          <button type="button" disabled={!!busy} onClick={() => mark('done')} className={`${smallButton} bg-green-600 text-white hover:bg-green-700`}>
            <FiCheck className="h-4 w-4" /> {busy === 'done' ? 'Saving…' : r.category === 'fees' ? 'Mark paid' : 'Mark done'}
          </button>
        )}
        {open && item.periodKey && (
          <button type="button" disabled={!!busy} onClick={() => mark('notApplicable')} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
            Not needed this time
          </button>
        )}
        {!open && item.record && (
          <button type="button" disabled={!!busy} onClick={() => mark('undo')} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
            <FiRotateCcw className="h-4 w-4" /> Undo
          </button>
        )}
      </div>

      <details className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
        <summary className="cursor-pointer text-gray-700">This franchise only</summary>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600" htmlFor={`xd-${item.key}`}>
              Extra days to complete
            </label>
            <input id={`xd-${item.key}`} type="number" min={0} max={365} value={extraDays} onChange={(e) => setExtraDays(e.target.value)} className={`${inputClass} w-28`} />
          </div>
          <button type="button" disabled={!!busy} onClick={() => setting(item.state === 'notApplicable' && !item.record)} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
            Save extra days
          </button>
          {item.state === 'notApplicable' && !item.record ? (
            <button type="button" disabled={!!busy} onClick={() => setting(false)} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
              Applies to this franchise again
            </button>
          ) : (
            <button type="button" disabled={!!busy} onClick={() => setting(true)} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
              Doesn&apos;t apply to this franchise
            </button>
          )}
        </div>
      </details>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
    </div>
  );
}

/** One checklist item: what's needed, where it comes from, what's been sent, and what to do */
export default function ItemRow({
  item,
  mode,
  franchiseId,
  defaultOpen = false,
}: {
  item: ComplianceItem;
  mode: 'franchise' | 'admin';
  franchiseId?: string;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const r = item.requirement;
  const record = item.record;
  const canSubmit = mode === 'franchise' && r.evidence !== 'admin' && ['overdue', 'dueSoon', 'todo', 'returned'].includes(item.state);
  const done = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <li className="bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-gray-50">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">
            {r.title}
            {item.periodLabel && <span className="font-normal text-gray-500"> · {item.periodLabel}</span>}
          </p>
          <p className="mt-0.5 text-sm text-gray-500">
            {categoryTitle(r.category)} · {frequencyTitle(r.frequency)}
            {itemDueText(item) && <span className={item.state === 'overdue' ? 'text-red-700' : ''}> · {itemDueText(item)}</span>}
            {item.extraDays > 0 && <span> · {item.extraDays} extra days</span>}
          </p>
        </div>
        <StateBadge state={item.state} />
        <FiChevronDown className={`mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 px-5 pb-5">
          {r.description && <p className="text-sm text-gray-700">{r.description}</p>}

          {r.sources.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {r.sources.map((s, i) =>
                s.href ? (
                  <a key={i} href={s.href} className="inline-flex items-center gap-1.5 text-brand-light-blue hover:text-brand-dark-blue">
                    <FiBookOpen className="h-4 w-4" /> {s.title}
                    {s.heading ? ` › ${s.heading}` : ''}
                  </a>
                ) : null
              )}
            </div>
          )}

          {record && (
            <div className="space-y-2 rounded-md border border-gray-200 p-3 text-sm">
              {record.status === 'returned' && record.reviewNote && (
                <p className="rounded bg-red-50 px-3 py-2 text-red-800">
                  <strong>Head Office:</strong> {record.reviewNote}
                </p>
              )}
              {record.files.length > 0 && (
                <ul className="space-y-1">
                  {record.files.map((f) => (
                    <li key={f._key}>
                      <a
                        href={`/api/compliance/files/${record._id}/${f._key}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 text-brand-light-blue hover:text-brand-dark-blue"
                      >
                        <FiFile className="h-4 w-4" /> {f.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {record.expiresOn && <p className="text-gray-600">Expires {formatUkDate(record.expiresOn)}</p>}
              {record.note && (
                <p className="text-gray-600">
                  <strong>Note:</strong> {record.note}
                </p>
              )}
              {record.history.length > 0 && (
                <ul className="space-y-0.5 border-t border-gray-100 pt-2 text-xs text-gray-500">
                  {record.history.slice(-5).map((h, i) => (
                    <li key={i}>
                      {formatUkDate(h.at.slice(0, 10))}: {h.action}
                      {h.by ? ` by ${h.by}` : ''}
                      {h.note ? `: “${h.note}”` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {mode === 'franchise' && r.evidence === 'admin' && item.state !== 'done' && item.state !== 'notApplicable' && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <FiSend className="h-4 w-4" /> Head Office ticks this off. Nothing for you to send.
            </p>
          )}
          {canSubmit && <SubmitForm item={item} onDone={done} />}
          {mode === 'admin' && franchiseId && <AdminActions item={item} franchiseId={franchiseId} onDone={done} />}
          {mode === 'franchise' && item.state === 'submitted' && (
            <p className="flex items-center gap-2 text-sm text-blue-700">
              <FiCheck className="h-4 w-4" /> Sent. Head Office will check it and tick it off.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
