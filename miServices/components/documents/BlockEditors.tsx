'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FiArrowDown, FiArrowUp, FiImage, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { urlFor } from '@/lib/sanity-image';
import { newKey, type DocContactPerson, type DocContactsBlock, type DocImageBlock, type DocTableBlock } from '@/lib/documents/standard';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const smallButton = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40';

/** Upload an image for a document; resolves to the Sanity asset reference */
export async function uploadDocumentImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/documents/images', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to upload the image');
  return data.assetRef;
}

function Modal({ title, onClose, onSave, children, wide }: { title: string; onClose: () => void; onSave: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/60 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`w-full ${wide ? 'max-w-5xl' : 'max-w-xl'} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="font-semibold text-gray-900 font-helvetica">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-700" aria-label="Close">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button type="button" onClick={onClose} className={`${smallButton} py-2 text-gray-700 bg-gray-100 hover:bg-gray-200`}>
            Cancel
          </button>
          <button type="button" onClick={onSave} className={`${smallButton} py-2 text-white bg-brand-light-blue hover:bg-brand-dark-blue`}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table ──────────────────────────────────────────────────────

export function TableEditor({ value, onSave, onClose }: { value: DocTableBlock; onSave: (value: Pick<DocTableBlock, 'headerRow' | 'rows'>) => void; onClose: () => void }) {
  const [headerRow, setHeaderRow] = useState(value.headerRow !== false);
  const [rows, setRows] = useState(() => (value.rows?.length ? value.rows : [{ _key: newKey(), cells: ['', ''] }]).map((r) => ({ _key: r._key, cells: [...r.cells] })));
  const width = Math.max(1, ...rows.map((r) => r.cells.length));

  const setCell = (ri: number, ci: number, text: string) => setRows((rs) => rs.map((r, i) => (i === ri ? { ...r, cells: r.cells.map((c, j) => (j === ci ? text : c)) } : r)));
  const addRow = (at: number) => setRows((rs) => [...rs.slice(0, at), { _key: newKey(), cells: Array(width).fill('') }, ...rs.slice(at)]);
  const removeRow = (at: number) => setRows((rs) => (rs.length > 1 ? rs.filter((_, i) => i !== at) : rs));
  const moveRow = (at: number, by: number) =>
    setRows((rs) => {
      const next = [...rs];
      const [row] = next.splice(at, 1);
      next.splice(at + by, 0, row);
      return next;
    });
  const addColumn = () => setRows((rs) => rs.map((r) => ({ ...r, cells: [...r.cells, ''] })));
  const removeColumn = (ci: number) => width > 1 && setRows((rs) => rs.map((r) => ({ ...r, cells: r.cells.filter((_, j) => j !== ci) })));

  return (
    <Modal title="Edit table" wide onClose={onClose} onSave={() => onSave({ headerRow, rows: rows.map((r) => ({ _type: 'tableRow', _key: r._key, cells: [...r.cells, ...Array(width - r.cells.length).fill('')] })) })}>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={headerRow} onChange={(e) => setHeaderRow(e.target.checked)} />
          First row is a header
        </label>
        <button type="button" onClick={addColumn} className={`${smallButton} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
          <FiPlus className="h-4 w-4" /> Add column
        </button>
        <button type="button" onClick={() => addRow(rows.length)} className={`${smallButton} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
          <FiPlus className="h-4 w-4" /> Add row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {Array.from({ length: width }, (_, ci) => (
                <th key={ci} className="px-1 pb-1 text-left">
                  <button
                    type="button"
                    onClick={() => removeColumn(ci)}
                    disabled={width === 1}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 disabled:opacity-30"
                    aria-label={`Remove column ${ci + 1}`}
                  >
                    <FiTrash2 className="h-3 w-3" /> Column {ci + 1}
                  </button>
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row._key}>
                {Array.from({ length: width }, (_, ci) => (
                  <td key={ci} className="p-1 align-top">
                    <textarea
                      rows={2}
                      value={row.cells[ci] || ''}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      aria-label={`Row ${ri + 1}, column ${ci + 1}`}
                      className={`${inputClass} min-w-[9rem] resize-y ${headerRow && ri === 0 ? 'bg-blue-50 font-semibold' : ''}`}
                    />
                  </td>
                ))}
                <td className="whitespace-nowrap p-1 align-top">
                  <button type="button" onClick={() => moveRow(ri, -1)} disabled={ri === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label={`Move row ${ri + 1} up`}>
                    <FiArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveRow(ri, 1)} disabled={ri === rows.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label={`Move row ${ri + 1} down`}>
                    <FiArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => addRow(ri + 1)} className="p-1 text-gray-400 hover:text-brand-dark-blue" aria-label={`Add a row after row ${ri + 1}`}>
                    <FiPlus className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeRow(ri)} disabled={rows.length === 1} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30" aria-label={`Remove row ${ri + 1}`}>
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500">Line breaks inside a cell are kept.</p>
    </Modal>
  );
}

// ─── Image ──────────────────────────────────────────────────────

function ImagePicker({ assetRef, onChange, round }: { assetRef?: string; onChange: (ref: string) => void; round?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadDocumentImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      {assetRef ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(round ? urlFor({ asset: { _ref: assetRef } }).width(96).height(96).fit('crop') : urlFor({ asset: { _ref: assetRef } }).width(320).fit('max')).auto('format').url()}
          alt=""
          className={round ? 'h-12 w-12 rounded-full object-cover' : 'max-h-40 rounded border border-gray-200'}
        />
      ) : (
        <span className={`flex items-center justify-center bg-gray-100 text-gray-400 ${round ? 'h-12 w-12 rounded-full' : 'h-24 w-40 rounded'}`}>
          <FiImage className="h-5 w-5" />
        </span>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className={`${smallButton} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
        <FiUpload className="h-4 w-4" /> {busy ? 'Uploading…' : assetRef ? 'Replace' : 'Upload'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}

export function ImageEditor({ value, onSave, onClose }: { value: DocImageBlock; onSave: (value: Pick<DocImageBlock, 'asset' | 'alt' | 'caption'>) => void; onClose: () => void }) {
  const [assetRef, setAssetRef] = useState(value.asset?._ref || '');
  const [alt, setAlt] = useState(value.alt || '');
  const [caption, setCaption] = useState(value.caption || '');
  return (
    <Modal
      title="Image"
      onClose={onClose}
      onSave={() => assetRef && onSave({ asset: { _type: 'reference', _ref: assetRef }, alt: alt.trim() || undefined, caption: caption.trim() || undefined })}
    >
      <div className="space-y-4">
        <ImagePicker assetRef={assetRef} onChange={setAssetRef} />
        <div>
          <label htmlFor="img-alt" className="mb-1 block text-sm font-medium text-gray-700">
            Description for screen readers
          </label>
          <input id="img-alt" value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} placeholder="What the image shows" className={inputClass} />
        </div>
        <div>
          <label htmlFor="img-caption" className="mb-1 block text-sm font-medium text-gray-700">
            Caption <span className="font-normal text-gray-400">(optional, shown under the image)</span>
          </label>
          <input id="img-caption" value={caption} maxLength={300} onChange={(e) => setCaption(e.target.value)} className={inputClass} />
        </div>
      </div>
    </Modal>
  );
}

// ─── Contact cards ──────────────────────────────────────────────

export function ContactsEditor({ value, onSave, onClose }: { value: DocContactsBlock; onSave: (value: Pick<DocContactsBlock, 'people'>) => void; onClose: () => void }) {
  const [people, setPeople] = useState<DocContactPerson[]>(() => (value.people?.length ? value.people : [{ _type: 'contactPerson' as const, _key: newKey(), name: '' }]).map((p) => ({ ...p })));
  const update = (i: number, patch: Partial<DocContactPerson>) => setPeople((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, by: number) =>
    setPeople((ps) => {
      const next = [...ps];
      const [p] = next.splice(i, 1);
      next.splice(i + by, 0, p);
      return next;
    });

  return (
    <Modal title="Contact cards" wide onClose={onClose} onSave={() => onSave({ people: people.filter((p) => p.name.trim()) })}>
      <div className="space-y-3">
        {people.map((person, i) => (
          <div key={person._key} className="rounded-md border border-gray-200 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={person.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Name" aria-label="Name" className={inputClass} />
              <input value={person.role || ''} onChange={(e) => update(i, { role: e.target.value || undefined })} placeholder="Role" aria-label="Role" className={inputClass} />
              <input value={person.phone || ''} onChange={(e) => update(i, { phone: e.target.value || undefined })} placeholder="Phone" aria-label="Phone" className={inputClass} />
              <input value={person.email || ''} onChange={(e) => update(i, { email: e.target.value || undefined })} placeholder="Email" aria-label="Email" className={inputClass} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <ImagePicker
                round
                assetRef={person.photo?.asset?._ref}
                onChange={(ref) => update(i, { photo: { _type: 'image', asset: { _type: 'reference', _ref: ref } } })}
              />
              <div className="flex items-center">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move up">
                  <FiArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === people.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move down">
                  <FiArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setPeople((ps) => ps.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-600" aria-label={`Remove ${person.name || 'person'}`}>
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPeople((ps) => [...ps, { _type: 'contactPerson', _key: newKey(), name: '' }])}
          className={`${smallButton} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}
        >
          <FiPlus className="h-4 w-4" /> Add person
        </button>
      </div>
    </Modal>
  );
}
