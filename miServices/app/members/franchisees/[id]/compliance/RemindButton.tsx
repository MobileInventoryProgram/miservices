'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { headerSecondaryButton } from '@/components/members/PageHeader';

/** Send this franchise a reminder of everything outstanding */
export default function RemindButton({ franchiseId, emailConfigured }: { franchiseId: string; emailConfigured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const send = async () => {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/compliance/remind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ franchiseId }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    const entry = data.franchises?.[0];
    if (!res.ok) setMessage(data.error || 'Failed to send');
    else if (!entry) setMessage('Nothing for them to do right now.');
    else if (!data.emailConfigured) setMessage(`Email isn't set up yet, so nothing was sent (${entry.items.length} items).`);
    else if (entry.error) setMessage(entry.error);
    else setMessage(`Reminder sent to ${entry.to.join(', ')}.`);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" disabled={busy} onClick={send} className={headerSecondaryButton} title={emailConfigured ? undefined : 'Email is not set up yet'}>
        <FiSend className="h-4 w-4" /> {busy ? 'Sending…' : 'Send reminder'}
      </button>
      {message && <p className="max-w-xs text-right text-xs text-gray-600">{message}</p>}
    </div>
  );
}
