'use client';

import { useEffect, useState } from 'react';
import { FiChevronDown, FiList } from 'react-icons/fi';
import type { OutlineEntry } from '@/lib/documents/standard';

/**
 * The contents list: built from the document's headings every render, so it
 * always matches the document. Highlights the section being read.
 */
export default function DocumentContents({ sections, onNavigate }: { sections: OutlineEntry[]; onNavigate?: (anchor: string) => void }) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const anchors = sections.flatMap((s) => [s.anchor, ...s.children.map((c) => c.anchor)]);
    const elements = anchors.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  const link = (entry: OutlineEntry, sub: boolean) => (
    <a
      href={`#${entry.anchor}`}
      onClick={(e) => {
        setOpen(false);
        if (onNavigate) {
          e.preventDefault();
          onNavigate(entry.anchor);
        }
      }}
      aria-current={active === entry.anchor ? 'location' : undefined}
      className={`-ml-px flex gap-2 border-l-2 py-1 pr-2 transition-colors ${sub ? 'pl-6 text-[13px]' : 'pl-3 font-medium'} ${
        active === entry.anchor
          ? 'border-brand-light-blue text-brand-dark-blue'
          : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-brand-dark-blue'
      }`}
    >
      {entry.number && <span className="tabular-nums text-gray-400">{entry.number}</span>}
      <span>{entry.text}</span>
    </a>
  );

  return (
    <nav aria-label="Contents" className="lg:sticky lg:top-24 lg:self-start">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 lg:pointer-events-none"
      >
        <FiList className="h-4 w-4" /> Contents
        <FiChevronDown className={`ml-auto h-4 w-4 transition-transform lg:hidden ${open ? 'rotate-180' : ''}`} />
      </button>
      <ol className={`${open ? 'block' : 'hidden'} max-h-[70vh] space-y-0.5 overflow-y-auto border-l border-gray-200 text-sm lg:block`}>
        {sections.map((section) => (
          <li key={section.key}>
            {link(section, section.level === 3)}
            {section.children.length > 0 && (
              <ol className="space-y-0.5">
                {section.children.map((child) => (
                  <li key={child.key}>{link(child, true)}</li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
