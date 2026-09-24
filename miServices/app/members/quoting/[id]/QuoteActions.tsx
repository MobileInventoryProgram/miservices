'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCheck, FiCopy, FiDownload, FiEdit2, FiExternalLink, FiLink, FiSend, FiTrash2 } from 'react-icons/fi';
import { inputClass } from '@/components/crm/ContactFields';
import type { QuoteStatus } from '@/lib/quote/types';

const button =
  'inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 whitespace-nowrap';
const secondary = `${button} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300`;

export default function QuoteActions({
  quoteId,
  status,
  shareUrl: initialShareUrl,
  clientEmail,
  emailSubject,
  emailMessage,
  emailEnabled,
  canDuplicate,
}: {
  quoteId: string;
  status: QuoteStatus;
  shareUrl: string | null;
  clientEmail: string;
  emailSubject: string;
  emailMessage: string;
  emailEnabled: boolean;
  canDuplicate: boolean;
}) {
  const router = useRouter();
  const [showSend, setShowSend] = useState(false);
  const [to, setTo] = useState(clientEmail);
  const [subject, setSubject] = useState(emailSubject);
  const [message, setMessage] = useState(emailMessage);
  const [shareUrl, setShareUrl] = useState(initialShareUrl);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isDraft = status === 'draft';
  const answered = status === 'accepted' || status === 'declined';

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Client link copied — paste it into an email or message.');
    } catch {
      setNotice(`Client link: ${url}`);
    }
  };

  const send = async (mode: 'email' | 'link') => {
    setBusy(mode);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/members/quotes/${quoteId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, to, subject, message }),
      });
      const data = await res.json();
      if (data.shareUrl) setShareUrl(data.shareUrl);
      if (!res.ok) {
        setError(data.error || 'Failed to send quote');
        if (data.shareUrl) router.refresh();
        return;
      }
      if (mode === 'link') await copy(data.shareUrl);
      else setNotice(`Quote emailed to ${to}.`);
      setShowSend(false);
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const duplicate = async () => {
    setBusy('duplicate');
    setError('');
    try {
      const res = await fetch(`/api/members/quotes/${quoteId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to duplicate quote');
        return;
      }
      router.push(`/members/quoting/${data.id}/edit`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this draft quote?')) return;
    setBusy('delete');
    try {
      const res = await fetch(`/api/members/quotes/${quoteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete quote');
        return;
      }
      router.push('/members/quoting');
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!answered && (
          <button
            type="button"
            onClick={() => setShowSend((v) => !v)}
            aria-expanded={showSend}
            className={`${button} px-4 text-white bg-brand-light-blue hover:bg-brand-dark-blue`}
          >
            <FiSend className="w-4 h-4" />
            {isDraft ? 'Send quote' : 'Email again'}
          </button>
        )}
        {isDraft && (
          <Link href={`/members/quoting/${quoteId}/edit`} className={secondary}>
            <FiEdit2 className="w-4 h-4" />
            Edit
          </Link>
        )}
        {shareUrl && (
          <>
            <button type="button" onClick={() => copy(shareUrl)} className={secondary}>
              <FiLink className="w-4 h-4" />
              Copy client link
            </button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={secondary}>
              <FiExternalLink className="w-4 h-4" />
              Client view
            </a>
          </>
        )}
        <a href={`/api/members/quotes/${quoteId}/pdf`} className={secondary}>
          <FiDownload className="w-4 h-4" />
          Download PDF
        </a>
        {canDuplicate && (
          <button type="button" onClick={duplicate} disabled={busy === 'duplicate'} className={secondary}>
            <FiCopy className="w-4 h-4" />
            {busy === 'duplicate' ? 'Duplicating...' : 'Duplicate'}
          </button>
        )}
        {isDraft && (
          <button
            type="button"
            onClick={remove}
            disabled={busy === 'delete'}
            className={`${button} sm:ml-auto text-red-600 hover:bg-red-50`}
          >
            <FiTrash2 className="w-4 h-4" />
            {busy === 'delete' ? 'Deleting...' : 'Delete draft'}
          </button>
        )}
      </div>

      {notice && (
        <p className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 break-all">
          <FiCheck className="flex-shrink-0" /> {notice}
        </p>
      )}
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {showSend && (
        <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4 max-w-2xl">
          {isDraft && (
            <p className="text-sm text-gray-600">
              Sending locks the quote: its wording and prices are saved exactly as the client sees them.
            </p>
          )}
          <div>
            <label htmlFor="send-to" className="block text-sm font-medium text-gray-700 mb-1">
              Client email
            </label>
            <input id="send-to" type="email" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="send-subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input id="send-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="send-message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea id="send-message" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} text-sm`} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => send('email')}
              disabled={!!busy || !emailEnabled}
              className={`${button} text-white bg-brand-light-blue hover:bg-brand-dark-blue`}
            >
              <FiSend className="w-4 h-4" />
              {busy === 'email' ? 'Sending...' : 'Send by email'}
            </button>
            {isDraft && (
              <button type="button" onClick={() => send('link')} disabled={!!busy} className={`${button} text-brand-dark-blue bg-white border border-gray-300 hover:bg-gray-50`}>
                <FiLink className="w-4 h-4" />
                {busy === 'link' ? 'Creating...' : 'Copy client link instead'}
              </button>
            )}
          </div>
          {!emailEnabled && (
            <p className="text-xs text-amber-700">
              Email sending isn&apos;t set up yet. Use &ldquo;Copy client link instead&rdquo; and send the link from your own email.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
