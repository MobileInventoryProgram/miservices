'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiDownload, FiEye, FiLink, FiPrinter, FiXCircle } from 'react-icons/fi';
import type { FlyerLayout } from '@/lib/flyer/data';

interface LeafletActionsProps {
  listId: string;
  shareToken: string | null;
  canTurnOffLink: boolean;
  showPreview?: boolean;
  /** Flyer sides used for downloads and the copied share link */
  layout?: FlyerLayout;
  /** Offer the digital (trimmed A5) PDF as well as the print-ready one */
  showDigital?: boolean;
}

const buttonClass =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50';

/**
 * Preview / Download PDF / public share link controls for one price list.
 */
export default function LeafletActions({
  listId,
  shareToken: initialToken,
  canTurnOffLink,
  showPreview = true,
  layout = 'double',
  showDigital = false,
}: LeafletActionsProps) {
  const [shareToken, setShareToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const layoutQuery = layout === 'single' ? '?layout=single' : '';
  const shareUrl = shareToken ? `${origin}/price-list/${shareToken}${layoutQuery}` : '';
  const pdfUrl = (variant: 'print' | 'digital') =>
    `/api/members/pricing/${listId}/pdf?layout=${layout}&variant=${variant}`;

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the link is shown below so it can be copied by hand
    }
  };

  const handleShare = async () => {
    if (shareToken) {
      copy(shareUrl);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/members/pricing/${listId}/share`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create share link');
        return;
      }
      setShareToken(data.shareToken);
      copy(`${window.location.origin}/price-list/${data.shareToken}${layoutQuery}`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleTurnOff = async () => {
    if (!confirm('Turn off this link? Anyone you have sent it to will no longer be able to open it.')) return;

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/members/pricing/${listId}/share`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to turn off link');
        return;
      }
      setShareToken(null);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {showPreview && (
          <Link
            href={`/members/pricing-documents/${listId}`}
            className={`${buttonClass} text-gray-700 bg-gray-100 hover:bg-gray-200`}
          >
            <FiEye className="w-3.5 h-3.5" />
            Preview
          </Link>
        )}
        <a
          href={pdfUrl('print')}
          title="A5 with 3mm bleed and trim marks set, ready for the printer"
          className={`${buttonClass} text-white bg-brand-dark-blue hover:bg-brand-light-blue`}
        >
          <FiPrinter className="w-3.5 h-3.5" />
          {showDigital ? 'Print-ready PDF' : 'Download PDF'}
        </a>
        {showDigital && (
          <a
            href={pdfUrl('digital')}
            title="Trimmed A5, for emailing and viewing on screen"
            className={`${buttonClass} text-gray-700 bg-gray-100 hover:bg-gray-200`}
          >
            <FiDownload className="w-3.5 h-3.5" />
            Digital PDF
          </a>
        )}
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          className={`${buttonClass} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}
        >
          {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiLink className="w-3.5 h-3.5" />}
          {copied ? 'Link copied' : shareToken ? 'Copy share link' : busy ? 'Creating...' : 'Share link'}
        </button>
      </div>

      {shareToken && (
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Public link on
          </span>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 truncate text-brand-light-blue hover:text-brand-dark-blue"
          >
            {shareUrl}
          </a>
          {canTurnOffLink && (
            <button
              type="button"
              onClick={handleTurnOff}
              disabled={busy}
              className="ml-auto inline-flex flex-shrink-0 items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <FiXCircle className="w-3.5 h-3.5" />
              Turn off
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
