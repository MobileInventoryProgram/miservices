'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiCheck, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { ICON_OPTIONS } from '@/lib/cms/icon-names';
import { CmsIcon } from '@/lib/cms/icons';
import { DEFAULT_SECTION_COLOUR, DEFAULT_SECTION_ICON, SECTION_COLOURS } from '@/lib/documents/sections';
import type { DocumentSection } from '@/lib/sanity';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';

/**
 * Head Office: add a Documents section, or change an existing one's name,
 * description, icon and colour. Its web address never changes once made.
 */
export default function SectionForm({ section, onClose }: { section?: DocumentSection; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(section?.title || '');
  const [description, setDescription] = useState(section?.description || '');
  const [icon, setIcon] = useState(section?.icon || DEFAULT_SECTION_ICON);
  const [colour, setColour] = useState(section?.colour || DEFAULT_SECTION_COLOUR);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch(section ? `/api/admin/documents/sections/${section._id}` : '/api/admin/documents/sections', {
      method: section ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, icon, colour }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to save the section');
      setBusy(false);
      return;
    }
    if (section) {
      router.refresh();
      onClose();
    } else {
      // Straight into the new section, ready to add its first document
      router.push(`/members/documents/${data.slug}`);
    }
  };

  const remove = async () => {
    if (!section) return;
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/documents/sections/${section._id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to delete the section');
      setConfirmingDelete(false);
      setBusy(false);
      return;
    }
    router.refresh();
    onClose();
  };

  const fieldId = section ? `section-${section._id}` : 'new-section';

  return (
    <form onSubmit={save} className="mb-6 rounded-lg border border-brand-light-blue/40 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 font-helvetica">{section ? `Edit ${section.title}` : 'New section'}</h2>
        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Close">
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div>
            <label htmlFor={`${fieldId}-title`} className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id={`${fieldId}-title`}
              autoFocus
              required
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${fieldId}-description`} className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id={`${fieldId}-description`}
              maxLength={160}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <fieldset>
            <legend className="mb-1 block text-sm font-medium text-gray-700">Icon</legend>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIcon(option.value)}
                  aria-pressed={icon === option.value}
                  aria-label={option.title}
                  title={option.title}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                    icon === option.value ? 'border-brand-dark-blue bg-blue-50 text-brand-dark-blue' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <CmsIcon name={option.value} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1 block text-sm font-medium text-gray-700">Tile colour</legend>
            <div className="flex flex-wrap gap-2">
              {SECTION_COLOURS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColour(option.value)}
                  aria-pressed={colour === option.value}
                  aria-label={option.title}
                  title={option.title}
                  className={`${option.value} flex h-8 w-8 items-center justify-center rounded-full text-white ring-offset-2 transition ${
                    colour === option.value ? 'ring-2 ring-brand-dark-blue' : 'hover:opacity-80'
                  }`}
                >
                  {colour === option.value && <FiCheck className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Preview</p>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`${colour} text-white p-3 rounded-lg flex-shrink-0`}>
                <CmsIcon name={icon} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 font-helvetica">{title || 'Section name'}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50"
        >
          {section ? <FiCheck className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
          {busy ? 'Saving…' : section ? 'Save changes' : 'Create section'}
        </button>
        <p className="text-xs text-gray-500">
          {section
            ? 'The section keeps its web address, so links to it still work.'
            : 'Franchisees won’t see it until it has a published document.'}
        </p>
        {section && (
          <div className="ml-auto flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <span className="text-sm text-gray-700">Delete this section?</span>
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <FiTrash2 className="h-4 w-4" /> {busy ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button type="button" onClick={() => setConfirmingDelete(false)} disabled={busy} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 className="h-4 w-4" /> Delete section
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
