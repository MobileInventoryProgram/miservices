'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArchive } from 'react-icons/fi';

export default function ArchiveContactButton({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleArchive = async () => {
    if (!confirm('Archive this contact? It will be removed from your Contacts list.')) return;

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/members/contacts/${contactId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to archive contact');
        return;
      }
      router.push('/members/contacts');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleArchive}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <FiArchive className="w-3.5 h-3.5" />
        {busy ? 'Archiving...' : 'Archive contact'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
