'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiArchive, FiCheck, FiCheckCircle, FiEdit2, FiPlus, FiRotateCcw, FiTrash2, FiX } from 'react-icons/fi';
import {
  COMPLIANCE_CATEGORIES,
  COMPLIANCE_EVIDENCE,
  COMPLIANCE_FREQUENCIES,
  WEEKDAYS,
  categoryTitle,
  frequencyTitle,
  type ComplianceCategory,
  type ComplianceEvidence,
  type ComplianceFrequency,
} from '@/lib/compliance/options';
import type { DocOutline } from '@/lib/help/search';

export interface EditableRequirement {
  _id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  frequency: ComplianceFrequency;
  evidence: ComplianceEvidence;
  askExpiry: boolean;
  dueWithinDays: number | null;
  monthlyDay: number | null;
  monthOffset: boolean;
  weeklyDay: number | null;
  annualMonth: number | null;
  annualDay: number | null;
  remindBefore: number;
  remindEvery: number;
  isActive: boolean;
  sources: { documentId: string; headingKey?: string; headingText?: string }[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';
const smallButton = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50';

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

/** When it's due, in words */
export function dueRuleText(r: EditableRequirement): string {
  switch (r.frequency) {
    case 'monthly':
      return `${r.monthlyDay ? `Day ${r.monthlyDay}` : 'Last day'} of ${r.monthOffset ? 'the following month' : 'each month'}`;
    case 'weekly':
      return `Every ${WEEKDAYS[(r.weeklyDay || 5) - 1]}`;
    case 'annual':
      if (r.askExpiry) return 'By the expiry date given';
      if (r.annualMonth) return `Every year by ${r.annualDay || ''} ${MONTHS[r.annualMonth - 1]}`.replace('  ', ' ');
      return 'A year after it was last done';
    case 'ongoing':
      return 'Confirmed once a year';
    default:
      return r.dueWithinDays ? `Within ${r.dueWithinDays} days` : 'No deadline';
  }
}

const blank: EditableRequirement = {
  _id: '',
  title: '',
  description: '',
  category: 'setup',
  frequency: 'once',
  evidence: 'confirm',
  askExpiry: false,
  dueWithinDays: 30,
  monthlyDay: 0,
  monthOffset: false,
  weeklyDay: 5,
  annualMonth: null,
  annualDay: null,
  remindBefore: 7,
  remindEvery: 7,
  isActive: true,
  sources: [],
};

function RequirementForm({ initial, outlines, onClose }: { initial: EditableRequirement; outlines: DocOutline[]; onClose: () => void }) {
  const router = useRouter();
  const [r, setR] = useState<EditableRequirement>({ ...initial, sources: initial.sources.length ? initial.sources : [{ documentId: '' }] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof EditableRequirement>(key: K, value: EditableRequirement[K]) => setR((prev) => ({ ...prev, [key]: value }));
  const num = (value: string) => (value === '' ? null : Number(value));
  const outline = (id: string) => outlines.find((o) => o.id === id);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = {
        ...r,
        sources: r.sources
          .filter((s) => s.documentId)
          .map((s) => ({ ...s, headingText: s.headingKey ? outline(s.documentId)?.headings.find((h) => h.key === s.headingKey)?.text : undefined })),
      };
      if (initial._id) await send(`/api/admin/compliance/requirements/${initial._id}`, 'PATCH', body);
      else await send('/api/admin/compliance/requirements', 'POST', body);
      router.refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 rounded-lg border border-brand-light-blue/40 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 font-helvetica">{initial._id ? 'Edit requirement' : 'New requirement'}</h2>
        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label htmlFor="rq-title" className={labelClass}>
          Title
        </label>
        <input id="rq-title" required autoFocus maxLength={120} value={r.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="rq-desc" className={labelClass}>
          What is needed
        </label>
        <textarea id="rq-desc" rows={3} maxLength={1500} value={r.description} onChange={(e) => set('description', e.target.value)} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="rq-cat" className={labelClass}>
            Category
          </label>
          <select id="rq-cat" value={r.category} onChange={(e) => set('category', e.target.value as ComplianceCategory)} className={`${inputClass} bg-white`}>
            {COMPLIANCE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rq-freq" className={labelClass}>
            How often
          </label>
          <select id="rq-freq" value={r.frequency} onChange={(e) => set('frequency', e.target.value as ComplianceFrequency)} className={`${inputClass} bg-white`}>
            {COMPLIANCE_FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rq-ev" className={labelClass}>
            How it&apos;s completed
          </label>
          <select id="rq-ev" value={r.evidence} onChange={(e) => set('evidence', e.target.value as ComplianceEvidence)} className={`${inputClass} bg-white`}>
            {COMPLIANCE_EVIDENCE.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="rounded-md border border-gray-200 p-4">
        <legend className="px-1 text-sm font-medium text-gray-700">When it&apos;s due</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          {(r.frequency === 'once' || r.frequency === 'ongoing' || (r.frequency === 'annual' && !r.annualMonth)) && (
            <div>
              <label htmlFor="rq-within" className={labelClass}>
                {r.frequency === 'once' ? 'Due within (days)' : 'First due within (days)'}
              </label>
              <input id="rq-within" type="number" min={0} max={730} value={r.dueWithinDays ?? ''} onChange={(e) => set('dueWithinDays', num(e.target.value))} placeholder="No deadline" className={inputClass} />
            </div>
          )}
          {r.frequency === 'monthly' && (
            <>
              <div>
                <label htmlFor="rq-day" className={labelClass}>
                  Day of the month
                </label>
                <select id="rq-day" value={r.monthlyDay ?? 0} onChange={(e) => set('monthlyDay', Number(e.target.value))} className={`${inputClass} bg-white`}>
                  <option value={0}>Last day</option>
                  {Array.from({ length: 28 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
                <input type="checkbox" checked={r.monthOffset} onChange={(e) => set('monthOffset', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                Due in the month after
              </label>
            </>
          )}
          {r.frequency === 'weekly' && (
            <div>
              <label htmlFor="rq-wd" className={labelClass}>
                Due on
              </label>
              <select id="rq-wd" value={r.weeklyDay ?? 5} onChange={(e) => set('weeklyDay', Number(e.target.value))} className={`${inputClass} bg-white`}>
                {WEEKDAYS.map((d, i) => (
                  <option key={d} value={i + 1}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
          {r.frequency === 'annual' && !r.askExpiry && (
            <>
              <div>
                <label htmlFor="rq-am" className={labelClass}>
                  Every year by
                </label>
                <select id="rq-am" value={r.annualMonth ?? ''} onChange={(e) => set('annualMonth', num(e.target.value))} className={`${inputClass} bg-white`}>
                  <option value="">A year after last done</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              {r.annualMonth && (
                <div>
                  <label htmlFor="rq-ad" className={labelClass}>
                    Day
                  </label>
                  <input id="rq-ad" type="number" min={1} max={31} value={r.annualDay ?? ''} onChange={(e) => set('annualDay', num(e.target.value))} placeholder="Last day" className={inputClass} />
                </div>
              )}
            </>
          )}
          {r.evidence === 'upload' && (
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
              <input type="checkbox" checked={r.askExpiry} onChange={(e) => set('askExpiry', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              Ask for an expiry date
            </label>
          )}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rq-rb" className={labelClass}>
            Remind this many days before
          </label>
          <input id="rq-rb" type="number" min={0} max={60} value={r.remindBefore} onChange={(e) => set('remindBefore', Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label htmlFor="rq-re" className={labelClass}>
            While overdue, remind every (days)
          </label>
          <input id="rq-re" type="number" min={1} max={60} value={r.remindEvery} onChange={(e) => set('remindEvery', Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Where this comes from</legend>
        <div className="space-y-2">
          {r.sources.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <select
                aria-label={`Source ${i + 1} document`}
                value={s.documentId}
                onChange={(e) => set('sources', r.sources.map((x, j) => (j === i ? { documentId: e.target.value } : x)))}
                className={`${inputClass} bg-white sm:w-2/5`}
              >
                <option value="">Choose a document</option>
                {outlines.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Source ${i + 1} section`}
                value={s.headingKey || ''}
                disabled={!s.documentId}
                onChange={(e) => set('sources', r.sources.map((x, j) => (j === i ? { ...x, headingKey: e.target.value || undefined } : x)))}
                className={`${inputClass} bg-white sm:flex-1 disabled:bg-gray-50`}
              >
                <option value="">Whole document</option>
                {outline(s.documentId)?.headings.map((h) => (
                  <option key={h.key} value={h.key}>
                    {h.level === 3 ? '    ' : ''}
                    {h.text}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => set('sources', r.sources.filter((_, j) => j !== i))} className="self-start rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600" aria-label={`Remove source ${i + 1}`}>
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('sources', [...r.sources, { documentId: '' }])} className="inline-flex items-center gap-1.5 text-sm text-brand-light-blue hover:text-brand-dark-blue">
            <FiPlus className="h-4 w-4" /> Add a source
          </button>
        </div>
      </fieldset>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={`${smallButton} bg-brand-light-blue px-4 py-2 text-white hover:bg-brand-dark-blue`}>
          <FiCheck className="h-4 w-4" /> {busy ? 'Saving…' : initial._id ? 'Save changes' : 'Add requirement'}
        </button>
        <span className="text-xs text-gray-500">{initial._id ? 'Applies to every franchise.' : 'Every franchise gets it from today.'}</span>
      </div>
    </form>
  );
}

/** Head Office: the master list of requirements */
export default function RequirementsManager({ requirements, outlines }: { requirements: EditableRequirement[]; outlines: DocOutline[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditableRequirement | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async (key: string, fn: () => Promise<string | void>) => {
    setBusy(key);
    setError('');
    setMessage('');
    try {
      const msg = await fn();
      if (msg) setMessage(msg);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const active = requirements.filter((r) => r.isActive);
  const archived = requirements.filter((r) => !r.isActive);

  return (
    <div className="space-y-6">
      {editing ? (
        <RequirementForm key={editing._id || 'new'} initial={editing} outlines={outlines} onClose={() => setEditing(null)} />
      ) : (
        <button type="button" onClick={() => setEditing(blank)} className={`${smallButton} bg-brand-dark-blue px-4 py-2 text-white hover:bg-brand-light-blue`}>
          <FiPlus className="h-4 w-4" /> New requirement
        </button>
      )}
      {message && <p className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><FiCheckCircle /> {message}</p>}
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {COMPLIANCE_CATEGORIES.map((category) => {
        const rows = active.filter((r) => r.category === category.value);
        if (!rows.length) return null;
        return (
          <section key={category.value}>
            <h2 className="mb-2 font-semibold text-gray-900 font-helvetica">{category.title}</h2>
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              {rows.map((r) => (
                <li key={r._id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-sm text-gray-500">
                      {frequencyTitle(r.frequency)} · {dueRuleText(r)} · {COMPLIANCE_EVIDENCE.find((e) => e.value === r.evidence)?.title}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-wrap gap-2">
                    {r.frequency === 'once' && (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() =>
                          run(`all-${r._id}`, async () => {
                            const data = await send(`/api/admin/compliance/requirements/${r._id}/mark-all`, 'POST', {});
                            return `“${r.title}” marked done for ${data.marked} franchise${data.marked === 1 ? '' : 's'}.`;
                          })
                        }
                        title="For franchises that already have this in place"
                        className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                      >
                        <FiCheck className="h-4 w-4" /> {busy === `all-${r._id}` ? 'Marking…' : 'Done for all'}
                      </button>
                    )}
                    <button type="button" onClick={() => setEditing(r)} className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>
                      <FiEdit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => run(`arch-${r._id}`, async () => void (await send(`/api/admin/compliance/requirements/${r._id}`, 'PATCH', { isActive: false })))}
                      className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                    >
                      <FiArchive className="h-4 w-4" /> Stop tracking
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {archived.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-gray-500 font-helvetica">No longer tracked</h2>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
            {archived.map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-2 px-5 py-3">
                <span className="text-gray-500">
                  {r.title} <span className="text-xs">({categoryTitle(r.category)})</span>
                </span>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => run(`restore-${r._id}`, async () => void (await send(`/api/admin/compliance/requirements/${r._id}`, 'PATCH', { isActive: true })))}
                  className={`${smallButton} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                >
                  <FiRotateCcw className="h-4 w-4" /> Track again
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
