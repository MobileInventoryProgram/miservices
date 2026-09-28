'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiBookOpen, FiCheck, FiCheckCircle, FiClock, FiFile, FiUpload, FiX } from 'react-icons/fi';
import { daysBetween, formatUkDate } from '@/lib/dates';
import type { ComplianceItem } from '@/lib/compliance/status';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

/** "Overdue by 3 days", "Due today", "Due in 5 days", "Due 31 Oct 2026" */
function when(item: ComplianceItem, today: string): { text: string; tone: string } {
  if (item.state === 'returned') return { text: 'Sent back by Head Office', tone: 'bg-red-50 text-red-700' };
  if (!item.due) return { text: 'No deadline', tone: 'bg-gray-100 text-gray-600' };
  const days = daysBetween(today, item.due);
  if (days < 0) return { text: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, tone: 'bg-red-50 text-red-700' };
  if (days === 0) return { text: 'Due today', tone: 'bg-amber-50 text-amber-800' };
  if (days === 1) return { text: 'Due tomorrow', tone: 'bg-amber-50 text-amber-800' };
  if (days <= 14) return { text: `Due in ${days} days`, tone: 'bg-amber-50 text-amber-800' };
  return { text: `Due ${formatUkDate(item.due)}`, tone: 'bg-gray-100 text-gray-600' };
}

/** One action: what's needed, by when, and the one thing to do */
function ActionCard({ item, today, onSent }: { item: ComplianceItem; today: string; onSent: (title: string) => void }) {
  const r = item.requirement;
  const upload = r.evidence === 'upload';
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [expiresOn, setExpiresOn] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const due = when(item, today);
  const title = `${r.title}${item.periodLabel ? ` (${item.periodLabel})` : ''}`;
  const hasEarlierFiles = item.state === 'returned' && !!item.record?.files.length;

  const choose = () => {
    setOpen(true);
    fileInput.current?.click();
  };

  const send = async () => {
    setBusy(true);
    setError('');
    const form = new FormData();
    form.set('requirementId', r._id);
    if (item.periodKey) form.set('period', item.periodKey);
    form.set('note', note);
    if (expiresOn) form.set('expiresOn', expiresOn);
    form.set('confirmed', 'true');
    files.forEach((f) => form.append('files', f));
    const res = await fetch('/api/compliance/submit', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'That didn’t send. Please try again.');
      return;
    }
    onSent(title);
  };

  const canSend = upload ? files.length > 0 || hasEarlierFiles : true;

  return (
    <li className={`rounded-lg border bg-white shadow-sm ${item.state === 'overdue' || item.state === 'returned' ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900 font-helvetica">{title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${due.tone}`}>{due.text}</span>
          </div>
          {item.state === 'returned' && item.record?.reviewNote && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              <strong>Head Office:</strong> {item.record.reviewNote}
            </p>
          )}
          {r.description && <p className="mt-1 text-sm text-gray-600">{r.description}</p>}
          {r.sources[0]?.href && (
            <a href={r.sources[0].href} className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-light-blue hover:text-brand-dark-blue">
              <FiBookOpen className="h-3.5 w-3.5" /> Read more in {r.sources[0].title}
            </a>
          )}
        </div>
        {!open && (
          <button
            type="button"
            onClick={upload ? choose : () => setOpen(true)}
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue"
          >
            {upload ? <FiUpload className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
            {upload ? (item.state === 'returned' ? 'Upload again' : 'Upload') : item.state === 'returned' ? 'Confirm again' : 'Mark as done'}
          </button>
        )}
      </div>

      {upload && (
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      )}

      {open && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
          {upload && (
            <div>
              {files.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-800">
                  {files.map((f) => (
                    <li key={f.name} className="flex items-center gap-2">
                      <FiFile className="h-4 w-4 text-gray-400" /> {f.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">{hasEarlierFiles ? 'Your earlier files will be sent again unless you choose new ones.' : 'No file chosen yet.'}</p>
              )}
              <button type="button" onClick={() => fileInput.current?.click()} className="mt-1 text-sm text-brand-light-blue hover:text-brand-dark-blue">
                {files.length ? 'Choose different files' : 'Choose a file'}
              </button>
              <p className="mt-1 text-xs text-gray-500">PDF, JPEG or PNG, up to 10 MB each. Only Head Office sees it.</p>
            </div>
          )}
          {!upload && <p className="text-sm text-gray-700">By sending this you confirm it’s in place.</p>}
          {r.askExpiry && (
            <div className="max-w-xs">
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`exp-${item.key}`}>
                When does it expire?
              </label>
              <input id={`exp-${item.key}`} type="date" required value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} className={inputClass} />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={`note-${item.key}`}>
              Anything to add? <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input id={`note-${item.key}`} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
              <FiAlertCircle /> {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={busy || !canSend || (!!r.askExpiry && !expiresOn)}
              onClick={send}
              className="inline-flex items-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue disabled:opacity-50"
            >
              <FiCheck className="h-4 w-4" /> {busy ? 'Sending…' : 'Send to Head Office'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <FiX className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/** The franchise's actions, most urgent first */
export default function ActionsList({ actions, waiting, today }: { actions: ComplianceItem[]; waiting: number; today: string }) {
  const router = useRouter();
  const [sent, setSent] = useState<string | null>(null);

  const now = actions.filter((i) => i.state !== 'todo' || (i.due && daysBetween(today, i.due) <= 14));
  const later = actions.filter((i) => !now.includes(i));

  const onSent = (title: string) => {
    setSent(title);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {sent && (
        <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          <FiCheckCircle className="h-4 w-4 flex-shrink-0" /> Sent: {sent}. Head Office will check it.
        </p>
      )}

      {actions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-10 text-center">
          <FiCheckCircle className="h-10 w-10 text-green-500" />
          <p className="font-semibold text-gray-900 font-helvetica">You’re all caught up</p>
          <p className="text-sm text-gray-500">Nothing needs doing right now. New actions appear here when they’re due.</p>
        </div>
      ) : (
        <>
          {now.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-gray-900 font-helvetica">To do now</h2>
              <ul className="space-y-3">
                {now.map((item) => (
                  <ActionCard key={item.key} item={item} today={today} onSent={onSent} />
                ))}
              </ul>
            </section>
          )}
          {later.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-gray-900 font-helvetica">Coming up</h2>
              <ul className="space-y-3">
                {later.map((item) => (
                  <ActionCard key={item.key} item={item} today={today} onSent={onSent} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {waiting > 0 && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <FiClock className="h-4 w-4" /> {waiting} sent and waiting for Head Office to check.
        </p>
      )}
    </div>
  );
}
