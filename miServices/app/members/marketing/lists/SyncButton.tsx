'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';

/** Bring a list up to date with the Members Area */
export default function SyncButton({ list, label }: { list: 'network' | 'contacts'; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const sync = async () => {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/marketing/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ list }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage(data.error || 'Could not sync.');
    setMessage(
      list === 'network'
        ? `Done: ${data.added} added, ${data.removed} removed (${data.total} in the network).`
        : `Done: ${data.synced} synced${data.failed ? `, ${data.failed} failed` : ''}.`
    );
    router.refresh();
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {message && <span className="text-xs text-gray-600">{message}</span>}
      <button
        type="button"
        onClick={sync}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <FiRefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> {busy ? 'Syncing…' : label}
      </button>
    </div>
  );
}
