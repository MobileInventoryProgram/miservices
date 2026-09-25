'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowLeft,
  FiArrowUp,
  FiCheck,
  FiChevronDown,
  FiEye,
  FiInfo,
  FiLock,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import QuoteSlides from '@/components/quote/QuoteSlides';
import type { QuoteDocumentData } from '@/lib/quote/document';
import {
  DEFAULT_QUOTE_TEMPLATE,
  QUOTE_PLACEHOLDERS,
  SECTION_MODES,
  type QuoteSectionMode,
  type QuoteTemplate,
  type QuoteTemplateSection,
} from '@/lib/quote/template';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const cardClass = 'bg-white rounded-lg shadow-sm border border-gray-200';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const smallButton =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

const MODE_STYLES: Record<QuoteSectionMode, string> = {
  locked: 'bg-gray-100 text-gray-700 border-gray-200',
  editable: 'bg-green-50 text-green-700 border-green-200',
  pricing: 'bg-blue-50 text-blue-700 border-blue-200',
  miprogram: 'bg-purple-50 text-purple-700 border-purple-200',
};
const MODE_LABELS: Record<QuoteSectionMode, string> = {
  locked: 'Head Office wording',
  editable: 'Franchise can edit',
  pricing: 'Price list',
  miprogram: 'miProgram pricing',
};

/** Editor-only id so React keeps each card's state while sections move */
type EditorSection = QuoteTemplateSection & { uid: string };

let uidCounter = 0;
const withUids = (sections: QuoteTemplateSection[]): EditorSection[] => sections.map((s) => ({ ...s, uid: `s${++uidCounter}` }));
const stripUids = (sections: EditorSection[]): QuoteTemplateSection[] =>
  sections.map(({ uid, ...section }) => section); // eslint-disable-line @typescript-eslint/no-unused-vars

/** Text box with a placeholder picker that inserts at the cursor */
function PlaceholderField({
  id,
  label,
  value,
  onChange,
  rows,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Omit for a single-line input */
  rows?: number;
  help?: string;
}) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const insert = (key: string) => {
    const el = ref.current;
    const token = `{${key}}`;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + token + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="text-xs font-medium text-brand-light-blue hover:text-brand-dark-blue"
        >
          {open ? 'Hide placeholders' : 'Insert placeholder'}
        </button>
      </div>
      {rows ? (
        <textarea id={id} ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
      ) : (
        <input id={id} ref={ref} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5 rounded-md border border-gray-200 bg-gray-50 p-2">
          {QUOTE_PLACEHOLDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              // Keep the cursor position in the text box
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(p.key)}
              title={p.description}
              className="rounded border border-gray-200 bg-white px-2 py-0.5 font-mono text-xs text-brand-dark-blue hover:border-brand-light-blue hover:bg-blue-50"
            >
              {`{${p.key}}`}
            </button>
          ))}
        </div>
      )}
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export default function TemplateEditor({ initialTemplate, logoSrc }: { initialTemplate: QuoteTemplate; logoSrc?: string }) {
  const [cover, setCover] = useState(initialTemplate.cover);
  const [booking, setBooking] = useState(initialTemplate.booking);
  const [miProgram, setMiProgram] = useState(initialTemplate.miProgram);
  const [sections, setSections] = useState<EditorSection[]>(() => withUids(initialTemplate.sections));
  const [validityDays, setValidityDays] = useState(String(initialTemplate.validityDays));
  const [emailSubject, setEmailSubject] = useState(initialTemplate.emailSubject);
  const [emailMessage, setEmailMessage] = useState(initialTemplate.emailMessage);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [preview, setPreview] = useState<QuoteDocumentData | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const payload = {
    cover,
    booking,
    miProgram,
    sections: stripUids(sections),
    validityDays: Number(validityDays),
    emailSubject,
    emailMessage,
  };
  const serialized = JSON.stringify(payload);
  const [savedSnapshot, setSavedSnapshot] = useState(serialized);
  const dirty = serialized !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (dirty) setSaved(false);
  }, [dirty]);

  // Close the preview with Escape
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const load = (template: QuoteTemplate) => {
    setCover(template.cover);
    setBooking(template.booking);
    setMiProgram(template.miProgram);
    setSections(withUids(template.sections));
    setValidityDays(String(template.validityDays));
    setEmailSubject(template.emailSubject);
    setEmailMessage(template.emailMessage);
  };

  // ─── Sections ──────────────────────────────────────────────────

  const updateSection = (uid: string, patch: Partial<QuoteTemplateSection>) =>
    setSections((list) => list.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));

  const moveSection = (index: number, by: number) =>
    setSections((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  const removeSection = (uid: string) => setSections((list) => list.filter((s) => s.uid !== uid));

  const addSection = () => {
    const [section] = withUids([{ key: '', title: 'New section', mode: 'locked', text: '' }]);
    setSections((list) => [...list, section]);
    setExpanded(section.uid);
  };

  const hasMode = (mode: QuoteSectionMode, except: string) => sections.some((s) => s.mode === mode && s.uid !== except);

  // ─── miProgram tiers ───────────────────────────────────────────

  const updateTier = (index: number, field: 'upTo' | 'monthly' | 'annual', value: string) =>
    setMiProgram((mp) => ({ ...mp, tiers: mp.tiers.map((t, i) => (i === index ? { ...t, [field]: value === '' ? NaN : Number(value) } : t)) }));

  const addTier = () =>
    setMiProgram((mp) => {
      const last = mp.tiers[mp.tiers.length - 1];
      return { ...mp, tiers: [...mp.tiers, { upTo: last ? last.upTo * 2 : 10, monthly: last?.monthly ?? 0, annual: last?.annual ?? 0 }] };
    });

  const removeTier = (index: number) => setMiProgram((mp) => ({ ...mp, tiers: mp.tiers.filter((_, i) => i !== index) }));

  // ─── Save / preview ────────────────────────────────────────────

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/quote-template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save the quote template');
        return;
      }
      // Pick up keys given to new sections, keeping each card's editor id
      const template = data.template as QuoteTemplate;
      const nextSections = sections.map((s, i) => ({ ...template.sections[i], uid: s.uid }));
      const next = {
        cover: template.cover,
        booking: template.booking,
        miProgram: template.miProgram,
        sections: stripUids(nextSections),
        validityDays: template.validityDays,
        emailSubject: template.emailSubject,
        emailMessage: template.emailMessage,
      };
      setCover(template.cover);
      setBooking(template.booking);
      setMiProgram(template.miProgram);
      setSections(nextSections);
      setValidityDays(String(template.validityDays));
      setEmailSubject(template.emailSubject);
      setEmailMessage(template.emailMessage);
      setSavedSnapshot(JSON.stringify(next));
      setSaved(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openPreview = async () => {
    setPreviewing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/quote-template/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || 'Could not build the preview');
      else setPreview(data);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members/pricing-quoting" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Pricing &amp; Quoting
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Quote Template</h1>
          <p className="mt-2 text-blue-200 text-sm max-w-2xl">
            The standard wording and details in every franchise&apos;s quotes. Head Office sections can only be changed here.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <p className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <FiInfo className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            Changes apply to draft quotes straight away. Quotes already sent keep the wording they were sent with. Where a section is
            &ldquo;Franchise can edit&rdquo;, the text here is the starting point for new quotes.
          </span>
        </p>

        {/* Sections */}
        <section aria-labelledby="sections-heading" className="space-y-3">
          <div>
            <h2 id="sections-heading" className="text-xl font-bold text-gray-900 font-helvetica">
              Sections
            </h2>
            <p className="text-sm text-gray-500">
              In the order they appear, one slide each. A blank line starts a new paragraph; lines starting with &ldquo;- &rdquo; become bullet
              points. Placeholders like {'{companyName}'} are filled in for each quote.
            </p>
          </div>

          {sections.map((section, index) => {
            const open = expanded === section.uid;
            return (
              <div key={section.uid} className={`${cardClass} overflow-hidden`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : section.uid)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-gray-900 font-helvetica">{section.title || 'Untitled section'}</span>
                      {!open && section.text && <span className="block truncate text-xs text-gray-500">{section.text.split('\n')[0]}</span>}
                    </span>
                    <span className={`hidden sm:inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${MODE_STYLES[section.mode]}`}>
                      {section.mode === 'locked' && <FiLock className="h-3 w-3" />}
                      {MODE_LABELS[section.mode]}
                    </span>
                    <FiChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="flex flex-shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                      aria-label={`Move ${section.title} up`}
                    >
                      <FiArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 1)}
                      disabled={index === sections.length - 1}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                      aria-label={`Move ${section.title} down`}
                    >
                      <FiArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="space-y-4 border-t border-gray-100 px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`title-${section.uid}`} className={labelClass}>
                          Title
                        </label>
                        <input
                          id={`title-${section.uid}`}
                          type="text"
                          value={section.title}
                          maxLength={80}
                          onChange={(e) => updateSection(section.uid, { title: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor={`mode-${section.uid}`} className={labelClass}>
                          Who writes it
                        </label>
                        <select
                          id={`mode-${section.uid}`}
                          value={section.mode}
                          onChange={(e) => updateSection(section.uid, { mode: e.target.value as QuoteSectionMode })}
                          className={`${inputClass} bg-white`}
                        >
                          {SECTION_MODES.map((m) => (
                            <option key={m.value} value={m.value} disabled={(m.value === 'pricing' || m.value === 'miprogram') && hasMode(m.value, section.uid)}>
                              {MODE_LABELS[m.value]} — {m.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <PlaceholderField
                      id={`text-${section.uid}`}
                      label={section.mode === 'editable' ? 'Starting text' : 'Text'}
                      rows={Math.min(18, Math.max(6, section.text.split('\n').length + 2))}
                      value={section.text}
                      onChange={(text) => updateSection(section.uid, { text })}
                      help={
                        section.mode === 'pricing'
                          ? 'Shown above the price list chosen for the quote.'
                          : section.mode === 'miprogram'
                            ? 'Shown above the miProgram price table and the client’s discounted price.'
                            : section.mode === 'locked'
                              ? 'Franchisees can’t change this wording.'
                              : undefined
                      }
                    />

                    {section.mode === 'editable' && (
                      <div>
                        <label htmlFor={`hint-${section.uid}`} className={labelClass}>
                          Hint for franchisees <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                          id={`hint-${section.uid}`}
                          type="text"
                          value={section.hint || ''}
                          maxLength={200}
                          placeholder="Shown in the quote builder, e.g. Introduce yourself and your team"
                          onChange={(e) => updateSection(section.uid, { hint: e.target.value || undefined })}
                          className={inputClass}
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeSection(section.uid)}
                        disabled={sections.length === 1}
                        className={`${smallButton} text-red-600 hover:bg-red-50`}
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Remove section
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button type="button" onClick={addSection} className={`${smallButton} py-2 text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
            <FiPlus className="h-4 w-4" />
            Add section
          </button>
        </section>

        {/* Cover */}
        <section className={`${cardClass} p-6 space-y-4`} aria-labelledby="cover-heading">
          <h2 id="cover-heading" className="text-lg font-semibold text-gray-900 font-helvetica">
            Cover slide
          </h2>
          <PlaceholderField id="cover-headline" label="Headline" value={cover.headline} onChange={(headline) => setCover((c) => ({ ...c, headline }))} />
          <PlaceholderField id="cover-intro" label="Intro line" value={cover.intro} onChange={(intro) => setCover((c) => ({ ...c, intro }))} />
        </section>

        {/* Booking */}
        <section className={`${cardClass} p-6 space-y-4`} aria-labelledby="booking-heading">
          <div>
            <h2 id="booking-heading" className="text-lg font-semibold text-gray-900 font-helvetica">
              Head Office booking contacts
            </h2>
            <p className="text-sm text-gray-500">
              Used by {'{bookingPhone}'}, {'{bookingEmail}'} and {'{bookingUrl}'}, and for franchises without their own phone or email.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="booking-phone" className={labelClass}>
                Phone
              </label>
              <input id="booking-phone" type="tel" value={booking.phone} onChange={(e) => setBooking((b) => ({ ...b, phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="booking-email" className={labelClass}>
                Email
              </label>
              <input id="booking-email" type="email" value={booking.email} onChange={(e) => setBooking((b) => ({ ...b, email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="booking-url" className={labelClass}>
                Online booking address
              </label>
              <input id="booking-url" type="text" value={booking.url} onChange={(e) => setBooking((b) => ({ ...b, url: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </section>

        {/* miProgram */}
        <section className={`${cardClass} p-6 space-y-4`} aria-labelledby="miprogram-heading">
          <div>
            <h2 id="miprogram-heading" className="text-lg font-semibold text-gray-900 font-helvetica">
              miProgram licence pricing
            </h2>
            <p className="text-sm text-gray-500">The tier table in the miProgram section, with the miServices client discount applied.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="mp-discount" className={labelClass}>
                miServices client discount
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="mp-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={Number.isFinite(miProgram.discountPercent) ? miProgram.discountPercent : ''}
                  onChange={(e) => setMiProgram((mp) => ({ ...mp, discountPercent: e.target.value === '' ? NaN : Number(e.target.value) }))}
                  className={`${inputClass} w-24`}
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="mp-url" className={labelClass}>
                Pricing web address
              </label>
              <input id="mp-url" type="text" value={miProgram.url} onChange={(e) => setMiProgram((mp) => ({ ...mp, url: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th scope="col" className="px-3 py-2 font-medium">Up to (properties)</th>
                  <th scope="col" className="px-3 py-2 font-medium">Monthly £ ex VAT</th>
                  <th scope="col" className="px-3 py-2 font-medium">Annual £ ex VAT</th>
                  <th scope="col" className="px-3 py-2">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {miProgram.tiers.map((tier, index) => (
                  <tr key={index}>
                    {(['upTo', 'monthly', 'annual'] as const).map((field) => (
                      <td key={field} className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step={field === 'upTo' ? 1 : 0.5}
                          aria-label={`Tier ${index + 1} ${field === 'upTo' ? 'up to properties' : field}`}
                          value={Number.isFinite(tier[field]) ? tier[field] : ''}
                          onChange={(e) => updateTier(index, field, e.target.value)}
                          className={`${inputClass} w-28 py-1.5`}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        disabled={miProgram.tiers.length === 1}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                        aria-label={`Remove tier up to ${tier.upTo}`}
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addTier} className={`${smallButton} text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
            <FiPlus className="h-4 w-4" />
            Add tier
          </button>

          <div>
            <label htmlFor="mp-note" className={labelClass}>
              Small print
            </label>
            <textarea id="mp-note" rows={3} value={miProgram.note} onChange={(e) => setMiProgram((mp) => ({ ...mp, note: e.target.value }))} className={inputClass} />
          </div>
        </section>

        {/* Quote defaults */}
        <section className={`${cardClass} p-6 space-y-4`} aria-labelledby="defaults-heading">
          <div>
            <h2 id="defaults-heading" className="text-lg font-semibold text-gray-900 font-helvetica">
              New quote defaults
            </h2>
            <p className="text-sm text-gray-500">Franchisees can change these on each quote.</p>
          </div>
          <div>
            <label htmlFor="validity" className={labelClass}>
              Quotes valid for
            </label>
            <div className="flex items-center gap-2">
              <input
                id="validity"
                type="number"
                min="1"
                max="365"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className={`${inputClass} w-24`}
              />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>
          <PlaceholderField id="email-subject" label="Email subject" value={emailSubject} onChange={setEmailSubject} />
          <PlaceholderField id="email-message" label="Email message" rows={9} value={emailMessage} onChange={setEmailMessage} />
        </section>

        {/* Actions — kept in view while editing */}
        <div className="sticky bottom-0 -mx-4 sm:mx-0 border-t sm:border sm:rounded-lg border-gray-200 bg-white/95 backdrop-blur px-4 py-3 shadow-sm space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center gap-2" role="alert">
              <FiAlertCircle className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save template'}
            </button>
            <button type="button" onClick={openPreview} disabled={previewing} className={`${smallButton} py-2.5 text-brand-dark-blue bg-blue-50 hover:bg-blue-100`}>
              <FiEye className="w-4 h-4" />
              {previewing ? 'Building preview…' : 'Preview'}
            </button>
            {dirty ? (
              <span className="text-sm text-amber-700">Unsaved changes</span>
            ) : (
              saved && (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-700" role="status">
                  <FiCheck className="w-4 h-4" /> Saved
                </span>
              )
            )}
            <div className="ml-auto flex items-center gap-2">
              {confirmReset ? (
                <>
                  <span className="text-sm text-gray-700">Replace everything with the original wording?</span>
                  <button
                    type="button"
                    onClick={() => {
                      load(DEFAULT_QUOTE_TEMPLATE);
                      setConfirmReset(false);
                    }}
                    className={`${smallButton} py-2 text-white bg-red-600 hover:bg-red-700`}
                  >
                    Reset
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className={`${smallButton} py-2 text-gray-700 bg-gray-100 hover:bg-gray-200`}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmReset(true)} className={`${smallButton} py-2 text-gray-600 hover:bg-gray-100`}>
                  <FiRotateCcw className="w-4 h-4" />
                  Reset to original
                </button>
              )}
            </div>
          </div>
          {confirmReset && <p className="text-xs text-gray-500">Nothing is saved until you click Save template.</p>}
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/70 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Quote preview">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <p className="text-sm">
                <strong>Preview</strong> — a sample quote using {dirty ? 'your unsaved changes' : 'the saved template'}.
              </p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                autoFocus
                className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
              >
                <FiX className="h-4 w-4" /> Close
              </button>
            </div>
            <QuoteSlides data={preview} logoSrc={logoSrc} closing={<p className="text-sm text-gray-600">The client accepts or declines the quote here.</p>} />
          </div>
        </div>
      )}
    </div>
  );
}
