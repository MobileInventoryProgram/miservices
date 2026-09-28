'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiXCircle } from 'react-icons/fi';

/** Cancel a scheduled campaign; it goes back to a draft to edit or reschedule */
export default function CancelSchedule({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancel = async () => {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/marketing/campaigns/${id}/cancel`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || 'Could not cancel it.');
    router.refresh();
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <FiXCircle className="h-4 w-4" /> {busy ? 'Cancelling…' : 'Cancel the schedule and edit'}
      </button>
      {error && (
        <span className="flex items-center gap-1 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4" /> {error}
        </span>
      )}
    </div>
  );
}
