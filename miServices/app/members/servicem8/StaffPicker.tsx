'use client';

import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiSearch } from 'react-icons/fi';

/**
 * Staff filter: tick any number of people, then Apply. Nothing ticked means
 * everyone.
 */
export default function StaffPicker({
  options,
  selected,
  onApply,
}: {
  options: { id: string; name: string }[];
  selected: string[];
  onApply: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(new Set(selected));
  const [search, setSearch] = useState('');
  const panel = useRef<HTMLDivElement>(null);

  // Opening starts from what's applied; closing without Apply discards changes
  useEffect(() => {
    if (!open) return;
    setDraft(new Set(selected));
    setSearch('');
    const close = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const names = new Map(options.map((o) => [o.id, o.name]));
  const label =
    selected.length === 0 ? 'All staff' : selected.length === 1 ? names.get(selected[0]) || '1 person' : `${selected.length} staff selected`;

  const term = search.trim().toLowerCase();
  const shown = term ? options.filter((o) => o.name.toLowerCase().includes(term)) : options;

  const toggle = (id: string) =>
    setDraft((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const apply = () => {
    // Keep the list's order so the URL is stable
    onApply(options.filter((o) => draft.has(o.id)).map((o) => o.id));
    setOpen(false);
  };

  return (
    <div className="relative" ref={panel}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex w-full sm:w-56 items-center justify-between gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
      >
        <span className={`truncate ${selected.length ? 'font-medium text-brand-dark-blue' : 'text-gray-700'}`}>{label}</span>
        <FiChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-full sm:w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="relative border-b border-gray-100 p-2">
            <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <label htmlFor="staff-picker-search" className="sr-only">
              Find staff
            </label>
            <input
              id="staff-picker-search"
              type="search"
              autoFocus
              placeholder="Find staff"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto py-1" role="group" aria-label="Staff">
            {shown.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={draft.has(o.id)}
                    onChange={() => toggle(o.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-light-blue"
                  />
                  <span className="truncate">{o.name}</span>
                </label>
              </li>
            ))}
            {shown.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No staff match “{search}”.</li>}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 p-2">
            <div className="flex gap-3 text-xs">
              {term && shown.length > 0 && (
                <button type="button" onClick={() => setDraft((d) => new Set([...Array.from(d), ...shown.map((o) => o.id)]))} className="text-brand-light-blue hover:text-brand-dark-blue">
                  Tick shown
                </button>
              )}
              <button type="button" onClick={() => setDraft(new Set())} className="text-gray-500 hover:text-gray-800">
                Clear
              </button>
            </div>
            <button
              type="button"
              onClick={apply}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-dark-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-light-blue transition-colors"
            >
              <FiCheck className="h-4 w-4" />
              {draft.size ? `Show ${draft.size}` : 'Show all staff'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
