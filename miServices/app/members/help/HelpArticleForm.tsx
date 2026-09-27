'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCheck, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { answerToBlocks } from '@/lib/help/markup';
import type { DocOutline } from '@/lib/help/search';
import { HELP_TOPICS } from '@/lib/help/topics';
import AnswerBody from './AnswerBody';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

export interface EditableHelpArticle {
  slug: string;
  question: string;
  answer: string;
  topic: string;
  keywords: string[];
  isPublished: boolean;
  sources: { documentId: string; headingKey?: string; headingText?: string }[];
}

type SourceRow = { documentId: string; headingKey: string };

/**
 * Head Office: add or change a Help Centre answer. Answers are short: the
 * linked document section has the detail.
 */
export default function HelpArticleForm({
  article,
  outlines,
  defaultTopic,
  onClose,
}: {
  article?: EditableHelpArticle;
  outlines: DocOutline[];
  defaultTopic?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState(article?.question || '');
  const [answer, setAnswer] = useState(article?.answer || '');
  const [topic, setTopic] = useState(article?.topic || defaultTopic || '');
  const [keywords, setKeywords] = useState((article?.keywords || []).join(', '));
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? true);
  const [sources, setSources] = useState<SourceRow[]>(
    article?.sources.map((s) => ({ documentId: s.documentId, headingKey: s.headingKey || '' })) || [{ documentId: '', headingKey: '' }]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const outline = (id: string) => outlines.find((o) => o.id === id);
  const setSource = (i: number, next: Partial<SourceRow>) => setSources((rows) => rows.map((r, j) => (j === i ? { ...r, ...next } : r)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      question,
      answer,
      topic,
      isPublished,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      sources: sources
        .filter((s) => s.documentId)
        .map((s) => ({
          documentId: s.documentId,
          headingKey: s.headingKey || undefined,
          headingText: s.headingKey ? outline(s.documentId)?.headings.find((h) => h.key === s.headingKey)?.text : undefined,
        })),
    };
    const res = await fetch(article ? `/api/admin/help/${article.slug}` : '/api/admin/help', {
      method: article ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to save the answer');
      setBusy(false);
      return;
    }
    if (article) {
      router.refresh();
      onClose();
    } else {
      router.push(`/members/help/${data.slug}`);
    }
  };

  return (
    <form onSubmit={save} className="rounded-lg border border-brand-light-blue/40 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 font-helvetica">{article ? 'Edit answer' : 'New question'}</h2>
        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="help-question" className="mb-1 block text-sm font-medium text-gray-700">
              Question
            </label>
            <input
              id="help-question"
              autoFocus
              required
              maxLength={200}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="As a franchisee would ask it, e.g. How do I book holiday?"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="help-answer" className="mb-1 block text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              id="help-answer"
              required
              rows={8}
              maxLength={5000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500">
              Keep it short. Leave a blank line between paragraphs, start a line with “- ” for a bullet, and wrap words in **two stars** for bold.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="help-topic" className="mb-1 block text-sm font-medium text-gray-700">
                Topic
              </label>
              <select id="help-topic" required value={topic} onChange={(e) => setTopic(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Choose a topic</option>
                {HELP_TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="help-keywords" className="mb-1 block text-sm font-medium text-gray-700">
                Search words <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="help-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. annual leave, time off"
                className={inputClass}
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-medium text-gray-700">Where the answer comes from</legend>
            <div className="space-y-2">
              {sources.map((row, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row">
                  <select
                    aria-label={`Source ${i + 1} document`}
                    value={row.documentId}
                    onChange={(e) => setSource(i, { documentId: e.target.value, headingKey: '' })}
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
                    value={row.headingKey}
                    disabled={!row.documentId}
                    onChange={(e) => setSource(i, { headingKey: e.target.value })}
                    className={`${inputClass} bg-white sm:flex-1 disabled:bg-gray-50`}
                  >
                    <option value="">Whole document</option>
                    {outline(row.documentId)?.headings.map((h) => (
                      <option key={h.key} value={h.key}>
                        {h.level === 3 ? '    ' : ''}
                        {h.text}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSources((rows) => rows.filter((_, j) => j !== i))}
                    className="self-start rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    aria-label={`Remove source ${i + 1}`}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSources((rows) => [...rows, { documentId: '', headingKey: '' }])}
                className="inline-flex items-center gap-1.5 text-sm text-brand-light-blue hover:text-brand-dark-blue"
              >
                <FiPlus className="h-4 w-4" /> Add another source
              </button>
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-light-blue"
            />
            Visible to members
          </label>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Preview</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900 font-helvetica">{question || 'Your question'}</h3>
            {answer.trim() ? <AnswerBody answer={answerToBlocks(answer)} className="mt-3 text-sm" /> : <p className="mt-3 text-sm text-gray-400">The answer appears here.</p>}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || !question.trim() || !answer.trim() || !topic}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50"
        >
          {article ? <FiCheck className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
          {busy ? 'Saving…' : article ? 'Save changes' : 'Add question'}
        </button>
        <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
