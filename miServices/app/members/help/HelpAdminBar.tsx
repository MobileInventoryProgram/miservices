'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { headerPrimaryButton, headerSecondaryButton } from '@/components/members/PageHeader';
import type { DocOutline } from '@/lib/help/search';
import HelpArticleForm, { type EditableHelpArticle } from './HelpArticleForm';

/** Head Office: "New question" (with a topic preset), or Edit/Delete for one answer */
export default function HelpAdminBar({
  outlines,
  article,
  defaultTopic,
}: {
  outlines: DocOutline[];
  article?: EditableHelpArticle;
  defaultTopic?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    if (!article) return;
    setBusy(true);
    const res = await fetch(`/api/admin/help/${article.slug}`, { method: 'DELETE' });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || 'Failed to delete the answer');
      setBusy(false);
      setConfirming(false);
      return;
    }
    router.push(article.topic ? `/members/help/topic/${article.topic}` : '/members/help');
    router.refresh();
  };

  if (editing) {
    return <HelpArticleForm article={article} outlines={outlines} defaultTopic={defaultTopic} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {article ? (
        <>
          <button type="button" onClick={() => setEditing(true)} className={headerPrimaryButton}>
            <FiEdit2 className="h-4 w-4" /> Edit answer
          </button>
          {confirming ? (
            <>
              <span className="text-sm text-gray-700">Delete this answer?</span>
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <FiTrash2 className="h-4 w-4" /> {busy ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className={`${headerSecondaryButton} text-red-600`}>
              <FiTrash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className={headerPrimaryButton}>
          <FiPlus className="h-4 w-4" /> New question
        </button>
      )}
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </div>
  );
}
