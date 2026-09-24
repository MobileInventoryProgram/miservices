'use client';

import { useEffect, useMemo, type ReactNode, type SyntheticEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiList, FiLock } from 'react-icons/fi';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity-image';
import type { SanityMemberDocument } from '@/lib/sanity';

interface DocumentViewProps {
  document: SanityMemberDocument;
  subcategory: string;
  subcategoryTitle: string;
  viewer: { name: string; email: string };
}

type Block = { _type: string; _key?: string; style?: string; children?: { text?: string }[] };

const blockText = (block: Block) => (block.children || []).map((c) => c.text || '').join('');
const headingId = (block: Block) =>
  `section-${blockText(block).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}-${block._key || ''}`;

/** Diagonal repeating watermark with the viewer's details */
function watermark(text: string): string {
  const safe = text.replace(/[<>&"]/g, '');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='240'><text x='20' y='140' transform='rotate(-24 210 120)' fill='%23233e8b' fill-opacity='0.07' font-family='Helvetica, Arial, sans-serif' font-size='15'>${safe}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/%2523/g, '%23')}")`;
}

/**
 * Internal document viewer: readable when logged in, with no download and
 * deterrents against copying and printing.
 */
export default function DocumentView({ document: doc, subcategory, subcategoryTitle, viewer }: DocumentViewProps) {
  const body = (doc.body || []) as Block[];

  // Contents: the document's main headings
  const toc = useMemo(() => {
    const h2 = body.filter((b) => b._type === 'block' && b.style === 'h2');
    const level = h2.length >= 2 ? ['h2'] : ['h2', 'h3'];
    return body.filter((b) => b._type === 'block' && level.includes(b.style || '') && blockText(b).trim());
  }, [body]);

  // Block print and save shortcuts on this page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && ['p', 's'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const block = (Tag: 'h2' | 'h3' | 'h4', className: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Heading({ children, value }: { children?: ReactNode; value: any }) {
      return (
        <Tag id={headingId(value)} className={`scroll-mt-24 ${className}`}>
          {children}
        </Tag>
      );
    };

  const components: PortableTextComponents = {
    block: {
      h2: block('h2', 'mt-10 mb-4 text-2xl font-bold text-brand-dark-blue font-helvetica first:mt-0'),
      h3: block('h3', 'mt-8 mb-3 text-xl font-bold text-brand-dark-blue font-helvetica'),
      h4: block('h4', 'mt-6 mb-2 text-base font-bold text-gray-900 font-helvetica'),
      normal: ({ children }) => <p className="my-3 leading-relaxed text-gray-800">{children}</p>,
    },
    list: {
      bullet: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6 text-gray-800">{children}</ul>,
      number: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6 text-gray-800">{children}</ol>,
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) return null;
        // Sanity image refs carry their size ("image-<id>-600x339-png") — use it so space is reserved before loading
        const [, w, h] = /-(\d+)x(\d+)-/.exec(value.asset._ref) || [, '1200', '800'];
        const width = Math.min(Number(w), 1200);
        const height = Math.round((width * Number(h)) / Number(w));
        return (
          <figure className="my-6">
            <Image
              // Sanity's image CDN already resizes and converts to modern formats
              src={urlFor(value).width(width).fit('max').auto('format').quality(80).url()}
              unoptimized
              alt={value.alt || ''}
              width={width}
              height={height}
              draggable={false}
              className="mx-auto h-auto rounded-md border border-gray-200"
              // Reserve the image's space before it loads so lazy-loading triggers as you scroll
              style={{ width: '100%', maxWidth: width, aspectRatio: `${width} / ${height}` }}
            />
            {value.caption && <figcaption className="mt-2 text-center text-sm text-gray-500">{value.caption}</figcaption>}
          </figure>
        );
      },
    },
    marks: {
      link: ({ children, value }) => (
        <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-brand-light-blue underline hover:text-brand-dark-blue">
          {children}
        </a>
      ),
    },
  };

  const stop = (e: SyntheticEvent) => e.preventDefault();
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/members/documents/${subcategory}`}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to {subcategoryTitle}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">{doc.title}</h1>
          {doc.publishedAt && (
            <p className="mt-2 text-blue-200 text-sm">
              Updated{' '}
              {new Date(doc.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Shown instead of the document if someone tries to print it */}
      <div className="hidden p-16 text-center print:block">
        <p className="text-xl font-bold">This document is not available to print.</p>
        <p className="mt-2">miServices internal documents can only be viewed in Franchise Login.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:hidden">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {toc.length > 2 && (
            <nav aria-label="Contents" className="lg:sticky lg:top-24 lg:self-start">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <FiList className="h-4 w-4" /> Contents
              </p>
              <ol className="max-h-[70vh] space-y-1 overflow-y-auto border-l border-gray-200 text-sm">
                {toc.map((h) => (
                  <li key={h._key}>
                    <a
                      href={`#${headingId(h)}`}
                      className={`-ml-px block border-l-2 border-transparent py-1 pr-2 text-gray-600 hover:border-brand-light-blue hover:text-brand-dark-blue ${
                        h.style === 'h3' ? 'pl-6' : 'pl-3'
                      }`}
                    >
                      {blockText(h)}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className={toc.length > 2 ? '' : 'lg:col-span-2 max-w-4xl'}>
            {body.length > 0 ? (
              <article
                onCopy={stop}
                onCut={stop}
                onContextMenu={stop}
                onDragStart={stop}
                className="relative select-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-10"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  style={{ backgroundImage: watermark(`${viewer.name} · ${viewer.email} · ${date}`) }}
                />
                <div className="relative">
                  <PortableText value={doc.body!} components={components} />
                </div>
              </article>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
                <p className="text-gray-500">This document has no content yet.</p>
              </div>
            )}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
              <FiLock className="h-3.5 w-3.5" />
              Internal miServices document — for viewing in Franchise Login only. Please do not share or copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
