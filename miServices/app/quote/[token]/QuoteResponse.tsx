'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiX } from 'react-icons/fi';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

/** Accept / decline controls on the public quote page */
export default function QuoteResponse({ token, defaultName }: { token: string; defaultName: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'accept' | 'decline'>('idle');
  const [name, setName] = useState(defaultName);
  const [agreed, setAgreed] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (action: 'accept' | 'decline') => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/quote/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, name, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'idle') {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setMode('accept')}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <FiCheck className="w-4 h-4" />
          Accept quote
        </button>
        <button
          type="button"
          onClick={() => setMode('decline')}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Not right now
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit(mode);
      }}
    >
      <div>
        <label htmlFor="respond-name" className="block text-sm font-medium text-gray-700 mb-1">
          Your name
        </label>
        <input id="respond-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      {mode === 'accept' ? (
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
          I confirm I would like to go ahead with this quote, subject to the miServices terms and conditions.
        </label>
      ) : (
        <div>
          <label htmlFor="respond-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Anything you&apos;d like us to know? (optional)
          </label>
          <textarea id="respond-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            mode === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-800'
          }`}
        >
          {mode === 'accept' ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
          {busy ? 'Sending...' : mode === 'accept' ? 'Confirm and accept' : 'Decline quote'}
        </button>
        <button type="button" onClick={() => setMode('idle')} className="text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
