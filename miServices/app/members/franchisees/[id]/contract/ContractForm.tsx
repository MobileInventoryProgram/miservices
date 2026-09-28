'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiRefreshCw, FiSave, FiTrash2 } from 'react-icons/fi';
import {
  CONTRACT_STATE_STYLES,
  contractExpiry,
  contractInfo,
  DEFAULT_FEE_PERCENT,
  DEFAULT_NOTICE_MONTHS,
  feeText,
  formatUkDate,
  timeUntil,
  type FranchiseContract,
} from '@/lib/franchisees/contract';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900">{children}</dd>
      </div>
    </div>
  );
}

/** Where the contract stands: expiry, renewal and fee */
function Summary({ contract, today }: { contract: FranchiseContract | null; today: string }) {
  const info = contractInfo(contract, today);
  const style = CONTRACT_STATE_STYLES[info.state];
  const fee = feeText(contract);
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900 font-helvetica">Contract</h2>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}>{style.label}</span>
      </div>
      {!contract || (info.state === 'notSet' && !fee) ? (
        <p className="text-sm text-gray-500">No contract details yet. Add them below to track expiry, renewal and the fee.</p>
      ) : (
        <dl className="grid gap-4 sm:grid-cols-3">
          <Row icon={<FiCalendar className="h-4 w-4" />} label="Expires">
            {info.expiry ? (
              <>
                {formatUkDate(info.expiry)}
                <span className={`block text-xs ${info.state === 'expired' ? 'text-red-700' : 'text-gray-500'}`}>{timeUntil(today, info.expiry)}</span>
              </>
            ) : (
              <span className="text-gray-500">Not set</span>
            )}
          </Row>
          <Row icon={<FiRefreshCw className="h-4 w-4" />} label="Renewal due">
            {info.renewalFrom ? (
              <>
                From {formatUkDate(info.renewalFrom)}
                <span className={`block text-xs ${info.state === 'renewalDue' ? 'text-amber-800' : 'text-gray-500'}`}>
                  {info.notice} month{info.notice === 1 ? '' : 's'} before expiry
                  {info.state === 'active' ? `, ${timeUntil(today, info.renewalFrom)}` : ''}
                </span>
              </>
            ) : (
              <span className="text-gray-500">Not set</span>
            )}
          </Row>
          <Row icon={<span className="block h-4 w-4 text-center text-sm font-semibold leading-4">£</span>} label="Fee">
            {fee || <span className="text-gray-500">Not set</span>}
          </Row>
        </dl>
      )}
      {contract?.notes && <p className="mt-4 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">{contract.notes}</p>}
    </section>
  );
}

const str = (v: number | string | null | undefined) => (v === null || v === undefined ? '' : String(v));

export default function ContractForm({ franchiseId, contract, today }: { franchiseId: string; contract: FranchiseContract | null; today: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    startDate: contract?.startDate || '',
    termYears: str(contract?.termYears),
    expiryDate: contract?.expiryDate || '',
    renewalNoticeMonths: str(contract?.renewalNoticeMonths ?? DEFAULT_NOTICE_MONTHS),
    feeType: contract?.feeType || '',
    feePercent: str(contract?.feePercent ?? DEFAULT_FEE_PERCENT),
    feeMonthly: str(contract?.feeMonthly),
    notes: contract?.notes || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  // What's stored now: shown in the summary straight after a save
  const [current, setCurrent] = useState(contract);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };

  // Live preview of the expiry worked out from start + term
  const workedOut = !form.expiryDate ? contractExpiry({ startDate: form.startDate || null, termYears: Number(form.termYears) || null }) : null;

  const submit = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError('');
    setSaved(false);
    const res = await fetch(`/api/admin/franchisees/${franchiseId}/contract`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Could not save. Please try again.');
      return false;
    }
    setSaved(true);
    setCurrent(body.clear ? null : (data.contract as FranchiseContract));
    router.refresh();
    return true;
  };

  const clear = async () => {
    if (!window.confirm('Remove all contract details for this franchise?')) return;
    if (await submit({ clear: true })) {
      setForm({ startDate: '', termYears: '', expiryDate: '', renewalNoticeMonths: String(DEFAULT_NOTICE_MONTHS), feeType: '', feePercent: String(DEFAULT_FEE_PERCENT), feeMonthly: '', notes: '' });
    }
  };

  return (
    <>
      <Summary contract={current} today={today} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(form);
        }}
        className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 font-helvetica">Edit contract</h2>
          <p className="mt-1 text-sm text-gray-500">Only Head Office sees this. The franchise never does.</p>
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-gray-900">Dates</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="c-start">
                Start date
              </label>
              <input id="c-start" type="date" value={form.startDate} onChange={set('startDate')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="c-term">
                Term (years)
              </label>
              <input id="c-term" type="number" min={1} max={50} step={1} inputMode="numeric" value={form.termYears} onChange={set('termYears')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="c-expiry">
                Expiry date
              </label>
              <input id="c-expiry" type="date" value={form.expiryDate} onChange={set('expiryDate')} className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {workedOut
              ? `Expires ${formatUkDate(workedOut)}, worked out from the start date and term.`
              : form.expiryDate
                ? 'The expiry date is used as entered.'
                : 'Enter the expiry date, or a start date and term to work it out.'}
          </p>
          <div className="max-w-xs">
            <label className={labelClass} htmlFor="c-notice">
              Renewal due (months before expiry)
            </label>
            <input
              id="c-notice"
              type="number"
              min={0}
              max={36}
              step={1}
              inputMode="numeric"
              value={form.renewalNoticeMonths}
              onChange={set('renewalNoticeMonths')}
              className={inputClass}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold text-gray-900">Fee</legend>
          <label className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 px-4 py-3 has-[:checked]:border-brand-light-blue has-[:checked]:bg-blue-50/40">
            <input type="radio" name="feeType" value="percentage" checked={form.feeType === 'percentage'} onChange={set('feeType')} />
            <span className="text-sm font-medium text-gray-900">Percentage of turnover</span>
            {form.feeType === 'percentage' && (
              <span className="flex items-center gap-1">
                <input
                  aria-label="Percentage"
                  type="number"
                  min={0.1}
                  max={100}
                  step={0.1}
                  inputMode="decimal"
                  value={form.feePercent}
                  onChange={set('feePercent')}
                  className={`${inputClass} w-24`}
                />
                <span className="text-sm text-gray-600">%</span>
              </span>
            )}
          </label>
          <label className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 px-4 py-3 has-[:checked]:border-brand-light-blue has-[:checked]:bg-blue-50/40">
            <input type="radio" name="feeType" value="fixed" checked={form.feeType === 'fixed'} onChange={set('feeType')} />
            <span className="text-sm font-medium text-gray-900">Fixed monthly fee</span>
            {form.feeType === 'fixed' && (
              <span className="flex items-center gap-1">
                <span className="text-sm text-gray-600">£</span>
                <input
                  aria-label="Monthly fee in pounds"
                  type="number"
                  min={0.01}
                  step={0.01}
                  inputMode="decimal"
                  value={form.feeMonthly}
                  onChange={set('feeMonthly')}
                  className={`${inputClass} w-32`}
                />
                <span className="whitespace-nowrap text-sm text-gray-600">a month</span>
              </span>
            )}
          </label>
        </fieldset>

        <div>
          <label className={labelClass} htmlFor="c-notes">
            Notes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea id="c-notes" rows={3} maxLength={2000} value={form.notes} onChange={set('notes')} placeholder="Special terms, renewal conversations…" className={inputClass} />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
            <FiAlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" /> {busy ? 'Saving…' : 'Save contract'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-700" role="status">
              <FiCheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
          {current && (
            <button type="button" onClick={clear} disabled={busy} className="ml-auto inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-700 disabled:opacity-50">
              <FiTrash2 className="h-4 w-4" /> Remove contract details
            </button>
          )}
        </div>
      </form>
    </>
  );
}
