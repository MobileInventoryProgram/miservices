'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { PT_Sans, Roboto, Roboto_Slab } from 'next/font/google';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { COLORS } from '@/lib/flyer/geometry';
import type { QuoteDocumentData, QuoteDocumentSection } from '@/lib/quote/document';
import { Blocks, MiProgramPrices, PricingTable } from './QuoteBlocks';

/**
 * The quote as a slide presentation: cover, one slide per section, then a
 * closing slide. Back / Next buttons, arrow keys, swipe and progress dots.
 * Mirrors the landscape PDF in lib/quote/pdf.tsx.
 */

const slab = Roboto_Slab({ subsets: ['latin'], weight: ['300', '400', '700'] });
const sans = Roboto({ subsets: ['latin'], weight: ['700', '900'] });
const body = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'] });

const frame =
  'relative flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:aspect-video sm:flex-row';

function CoverSlide({ data, logoSrc }: { data: QuoteDocumentData; logoSrc?: string }) {
  return (
    <div className={frame}>
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-8 sm:px-12 sm:py-10">
        {logoSrc && <img src={logoSrc} alt="miServices" className="h-16 w-auto self-start sm:h-20" />}
        <p className={`${sans.className} mt-8 text-xs font-bold uppercase tracking-[0.25em]`} style={{ color: COLORS.wave }}>
          Proposal
        </p>
        <h2 className={`${slab.className} mt-2 text-3xl font-light leading-tight sm:text-4xl lg:text-5xl`} style={{ color: COLORS.navy }}>
          {data.cover.headline}
        </h2>
        {data.cover.intro && <p className="mt-3 max-w-xl text-base text-gray-600 sm:text-lg">{data.cover.intro}</p>}
        <div className="mt-5 h-1 w-14" style={{ background: COLORS.cyan }} />
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {[
            ['Reference', data.reference],
            ['Date', data.date],
            ['Valid until', data.validUntil],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wider text-gray-500">{label}</dt>
              <dd className="font-bold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative z-10 flex flex-col justify-center gap-4 px-6 py-8 text-white sm:w-[38%] sm:px-10" style={{ background: COLORS.navy }}>
        {[
          { label: 'Prepared for', name: data.client.name, lines: data.client.lines },
          { label: 'Prepared by', name: data.preparedBy.name, lines: data.preparedBy.lines },
        ].map((box) => (
          <div key={box.label} className="text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">{box.label}</p>
            <p className="mt-1 text-lg font-bold">{box.name}</p>
            {box.lines.map((line) => (
              <p key={line} className="break-words text-blue-100">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionSlide({
  section,
  number,
  total,
  data,
  logoSrc,
}: {
  section: QuoteDocumentSection;
  number: number;
  total: number;
  data: QuoteDocumentData;
  logoSrc?: string;
}) {
  const wide = !!(section.pricing || section.miProgram);
  return (
    <div className={frame}>
      {/* Title panel */}
      <div
        className={`flex flex-shrink-0 flex-col justify-between gap-4 px-6 py-6 text-white sm:px-8 sm:py-10 ${wide ? 'sm:w-[26%]' : 'sm:w-[34%]'}`}
        style={{ background: `linear-gradient(160deg, ${COLORS.navy} 55%, ${COLORS.wave})` }}
      >
        <div>
          <p className={`${sans.className} text-sm font-bold tabular-nums text-blue-200`}>
            {String(number).padStart(2, '0')} <span className="font-normal text-blue-300">/ {String(total).padStart(2, '0')}</span>
          </p>
          <h2 className={`${slab.className} mt-3 text-2xl font-light leading-tight sm:text-3xl`}>{section.title}</h2>
          <div className="mt-4 h-1 w-12" style={{ background: COLORS.cyan }} />
        </div>
        <div className="hidden sm:block">
          {logoSrc && (
            <div className="inline-block rounded bg-white p-2">
              <img src={logoSrc} alt="" className="h-10 w-auto" />
            </div>
          )}
          <p className="mt-3 text-xs text-blue-200">{data.reference}</p>
        </div>
      </div>

      {/* Content — vertically centred; scrolls only if a section is unusually long */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6 text-[15px] sm:px-10 sm:py-8">
        {section.miProgram ? (
          <div className="my-auto grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:items-center">
            <div className="text-sm">
              <Blocks blocks={section.blocks} />
            </div>
            <MiProgramPrices table={section.miProgram} compact />
          </div>
        ) : (
          <div className="my-auto">
            <Blocks blocks={section.blocks} />
            {section.pricing && <PricingTable pricing={section.pricing} />}
          </div>
        )}
      </div>
    </div>
  );
}

function ClosingSlide({ data, closing }: { data: QuoteDocumentData; closing?: ReactNode }) {
  return (
    <div className={frame} style={{ background: COLORS.navy }}>
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 text-white sm:px-14">
        <p className={`${sans.className} text-xs font-bold uppercase tracking-[0.25em] text-blue-200`}>Thank you</p>
        <h2 className={`${slab.className} mt-2 text-3xl font-light sm:text-4xl`}>Ready to get started?</h2>
        <div className="mt-4 h-1 w-14" style={{ background: COLORS.cyan }} />
        <p className="mt-5 max-w-xl text-blue-100">
          This quote is valid until {data.validUntil}. Questions? Contact {data.preparedBy.name}
          {data.preparedBy.lines.length ? ` — ${data.preparedBy.lines.slice(1).join(' · ')}` : ''}.
        </p>
        {closing && <div className="mt-6 max-w-xl rounded-lg bg-white p-5 text-gray-900">{closing}</div>}
      </div>
    </div>
  );
}

export default function QuoteSlides({
  data,
  logoSrc,
  closing,
}: {
  data: QuoteDocumentData;
  logoSrc?: string;
  /** Shown on the last slide, e.g. the client's Accept / Decline controls */
  closing?: ReactNode;
}) {
  const total = data.sections.length + 2;
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback((to: number) => setIndex(Math.max(0, Math.min(total - 1, to))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const moves: Record<string, number> = {
        ArrowRight: index + 1,
        PageDown: index + 1,
        ArrowLeft: index - 1,
        PageUp: index - 1,
        Home: 0,
        End: total - 1,
      };
      if (e.key in moves) {
        // Move slides without also scrolling the page
        e.preventDefault();
        go(moves[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, total]);

  const titles = ['Cover', ...data.sections.map((s) => s.title), 'Get started'];

  let slide: ReactNode;
  if (index === 0) slide = <CoverSlide data={data} logoSrc={logoSrc} />;
  else if (index === total - 1) slide = <ClosingSlide data={data} closing={closing} />;
  else
    slide = (
      <SectionSlide section={data.sections[index - 1]} number={index} total={data.sections.length} data={data} logoSrc={logoSrc} />
    );

  const navButton =
    'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className={`${body.className} mx-auto w-full max-w-6xl`}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`Quote ${data.reference}`}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <div aria-live="polite" aria-label={`Slide ${index + 1} of ${total}: ${titles[index]}`}>
          {slide}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={`${navButton} bg-white text-gray-700 shadow-sm hover:bg-gray-50`}>
          <FiChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            {titles.map((title, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}: ${title}`}
                aria-current={i === index ? 'step' : undefined}
                className="h-2.5 rounded-full transition-all"
                style={{ width: i === index ? 24 : 10, background: i === index ? COLORS.navy : '#cbd5e1' }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {index + 1} / {total} · {titles[index]}
          </p>
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === total - 1}
          className={`${navButton} text-white hover:opacity-90`}
          style={{ background: COLORS.wave }}
        >
          Next
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
