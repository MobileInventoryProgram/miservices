'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiLock,
  FiRotateCcw,
  FiSearch,
  FiUserPlus,
  FiX,
} from 'react-icons/fi';
import ContactFields, { EMPTY_CONTACT, inputClass, type ContactFormValues } from '@/components/crm/ContactFields';
import { JOB_TYPES } from '@/lib/job-types';
import { QUOTE_PLACEHOLDERS, type QuoteTemplateSection } from '@/lib/quote/template';

export interface BuilderContact {
  _id: string;
  name: string;
  companyName?: string;
  email?: string;
  propertyCount?: number;
  jobTypes?: string[];
}

export interface BuilderPriceList {
  _id: string;
  title: string;
  group: string;
  isDefault?: boolean;
}

export interface QuoteBuilderValues {
  contactId: string;
  priceListId: string;
  propertyCount: string;
  jobTypes: string[];
  sections: Record<string, string>;
  validUntil: string;
  emailSubject: string;
  emailMessage: string;
}

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 text-lg font-semibold text-gray-900 font-helvetica">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark-blue text-sm text-white">{number}</span>
        {title}
      </h2>
      <div className="p-6">{children}</div>
    </section>
  );
}

/**
 * Create or edit a draft quote: client (existing or new), job, price list,
 * section wording and email details.
 */
export default function QuoteBuilder({
  quoteId,
  contacts: initialContacts,
  priceLists,
  sections,
  initialValues,
  canAddContact,
}: {
  quoteId?: string;
  contacts: BuilderContact[];
  priceLists: BuilderPriceList[];
  sections: QuoteTemplateSection[];
  initialValues: QuoteBuilderValues;
  canAddContact: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState('');
  const [picking, setPicking] = useState(!initialValues.contactId);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<ContactFormValues>(EMPTY_CONTACT);
  const [contactError, setContactError] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof QuoteBuilderValues>(key: K, value: QuoteBuilderValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const selectedContact = contacts.find((c) => c._id === values.contactId);
  const templateText = useMemo(() => new Map(sections.map((s) => [s.key, s.text])), [sections]);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? contacts.filter((c) => [c.name, c.companyName, c.email].filter(Boolean).some((f) => f!.toLowerCase().includes(q)))
      : contacts;
    return list.slice(0, 8);
  }, [contacts, search]);

  const selectContact = (contact: BuilderContact) => {
    setValues((v) => ({
      ...v,
      contactId: contact._id,
      // Carry the client's details across when the quote doesn't have its own yet
      propertyCount: v.propertyCount || (contact.propertyCount != null ? String(contact.propertyCount) : ''),
      jobTypes: v.jobTypes.length ? v.jobTypes : contact.jobTypes || [],
    }));
    setPicking(false);
    setAddingContact(false);
    setSearch('');
  };

  const saveNewContact = async () => {
    setSavingContact(true);
    setContactError('');
    try {
      const res = await fetch('/api/members/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newContact, status: 'prospect', source: 'quote' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setContactError(data.error || 'Failed to save client');
        return;
      }
      const created: BuilderContact = {
        _id: data.id,
        name: [newContact.firstName, newContact.lastName].filter(Boolean).join(' ') || newContact.companyName,
        companyName: newContact.companyName || undefined,
        email: newContact.email || undefined,
        propertyCount: newContact.propertyCount ? Number(newContact.propertyCount) : undefined,
        jobTypes: newContact.jobTypes,
      };
      setContacts((list) => [created, ...list]);
      selectContact(created);
      setNewContact(EMPTY_CONTACT);
    } catch {
      setContactError('An error occurred. Please try again.');
    } finally {
      setSavingContact(false);
    }
  };

  const toggleJob = (job: string) =>
    set('jobTypes', values.jobTypes.includes(job) ? values.jobTypes.filter((j) => j !== job) : [...values.jobTypes, job]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(quoteId ? `/api/members/quotes/${quoteId}` : '/api/members/quotes', {
        method: quoteId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          sections: Object.entries(values.sections).map(([key, text]) => ({ key, text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save quote');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      router.push(`/members/quoting/${quoteId || data.id}`);
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const groups = Array.from(new Set(priceLists.map((p) => p.group)));

  return (
    <div className="space-y-6 pb-24">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2" role="alert">
          <FiAlertCircle className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 1. Client */}
      <Step number={1} title="Client">
        {selectedContact && !picking ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand-light-blue/40 bg-blue-50/50 px-4 py-3">
            <div>
              <p className="font-semibold text-gray-900">{selectedContact.name}</p>
              <p className="text-sm text-gray-600">
                {[selectedContact.companyName !== selectedContact.name && selectedContact.companyName, selectedContact.email]
                  .filter(Boolean)
                  .join(' · ') || 'No email address'}
              </p>
            </div>
            <button type="button" onClick={() => setPicking(true)} className="text-sm font-medium text-brand-light-blue hover:text-brand-dark-blue">
              Change client
            </button>
          </div>
        ) : addingContact ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">New client</p>
              <button
                type="button"
                onClick={() => setAddingContact(false)}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <FiX className="w-4 h-4" /> Cancel
              </button>
            </div>
            <ContactFields values={newContact} onChange={setNewContact} compact idPrefix="new-client" />
            {contactError && <p className="text-sm text-red-600">{contactError}</p>}
            <button
              type="button"
              onClick={saveNewContact}
              disabled={savingContact}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50 transition-colors font-helvetica"
            >
              <FiCheck className="w-4 h-4" />
              {savingContact ? 'Saving...' : 'Save client and use for this quote'}
            </button>
            <p className="text-xs text-gray-500">The client is added to your Contacts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="client-search" className="sr-only">
                  Search your contacts
                </label>
                <input
                  id="client-search"
                  type="search"
                  placeholder="Search your contacts by name, company or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} pl-9`}
                  autoFocus={!initialValues.contactId}
                />
              </div>
              {canAddContact && (
                <button
                  type="button"
                  onClick={() => {
                    setAddingContact(true);
                    // Start the new client from what was typed in the search box
                    if (search.trim()) setNewContact({ ...EMPTY_CONTACT, companyName: search.trim() });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-brand-dark-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Add a new client
                </button>
              )}
            </div>
            {matches.length > 0 ? (
              <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                {matches.map((contact) => (
                  <li key={contact._id}>
                    <button
                      type="button"
                      onClick={() => selectContact(contact)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50 ${
                        contact._id === values.contactId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span>
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        {contact.companyName && contact.companyName !== contact.name && (
                          <span className="text-sm text-gray-500"> · {contact.companyName}</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{contact.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {contacts.length === 0 ? 'You have no contacts yet — add the client above.' : 'No contacts match. Add them as a new client.'}
              </p>
            )}
            {selectedContact && (
              <button type="button" onClick={() => setPicking(false)} className="text-sm text-gray-600 hover:text-gray-900">
                Keep {selectedContact.name}
              </button>
            )}
          </div>
        )}
      </Step>

      {/* 2. Job */}
      <Step number={2} title="The job">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="quote-properties" className={labelClass}>
              Number of properties
            </label>
            <input
              id="quote-properties"
              type="number"
              min={0}
              inputMode="numeric"
              value={values.propertyCount}
              onChange={(e) => set('propertyCount', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <fieldset className="mt-4">
          <legend className={labelClass}>Job types</legend>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((job) => {
              const checked = values.jobTypes.includes(job.value);
              return (
                <label
                  key={job.value}
                  className={`inline-flex items-center px-3 py-1.5 text-sm rounded-full border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-brand-light-blue ${
                    checked
                      ? 'bg-brand-dark-blue text-white border-brand-dark-blue'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-brand-light-blue'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleJob(job.value)} />
                  {job.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </Step>

      {/* 3. Price list */}
      <Step number={3} title="Price list">
        <label htmlFor="quote-price-list" className={labelClass}>
          Price list to include
        </label>
        <select
          id="quote-price-list"
          value={values.priceListId}
          onChange={(e) => set('priceListId', e.target.value)}
          className={inputClass}
        >
          <option value="">Choose a price list…</option>
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {priceLists
                .filter((p) => p.group === group)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                    {p.isDefault ? ' (default)' : ''}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {values.priceListId && (
          <Link
            href={`/members/pricing-documents/${values.priceListId}`}
            target="_blank"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-light-blue hover:text-brand-dark-blue"
          >
            <FiEye className="w-4 h-4" />
            View this price list
          </Link>
        )}
      </Step>

      {/* 4. Wording */}
      <Step number={4} title="Quote wording">
        <p className="mb-4 text-sm text-gray-600">
          Locked sections are Head Office wording. Edit the others to make the quote your own. You can use{' '}
          {QUOTE_PLACEHOLDERS.slice(0, 6).map((p, i) => (
            <span key={p.key}>
              <code className="rounded bg-gray-100 px-1 text-xs" title={p.description}>
                {`{${p.key}}`}
              </code>
              {i < 5 ? ', ' : ''}
            </span>
          ))}{' '}
          and they&apos;re filled in for you.
        </p>
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.key} className="rounded-md border border-gray-200">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2">
                <h3 className="font-medium text-gray-900">{section.title}</h3>
                {section.mode === 'locked' && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <FiLock className="w-3 h-3" /> Head Office wording
                  </span>
                )}
                {section.mode === 'pricing' && <span className="text-xs text-gray-500">Price table from your chosen list</span>}
                {section.mode === 'editable' && values.sections[section.key] !== templateText.get(section.key) && (
                  <button
                    type="button"
                    onClick={() => set('sections', { ...values.sections, [section.key]: templateText.get(section.key) || '' })}
                    className="inline-flex items-center gap-1 text-xs text-brand-light-blue hover:text-brand-dark-blue"
                  >
                    <FiRotateCcw className="w-3 h-3" /> Reset to Head Office wording
                  </button>
                )}
              </div>
              {section.mode === 'editable' ? (
                <div className="p-3">
                  {section.hint && <p className="mb-2 text-xs text-gray-500">{section.hint}</p>}
                  <label htmlFor={`section-${section.key}`} className="sr-only">
                    {section.title}
                  </label>
                  <textarea
                    id={`section-${section.key}`}
                    rows={Math.min(12, Math.max(4, (values.sections[section.key] || '').split('\n').length + 1))}
                    value={values.sections[section.key] ?? section.text}
                    onChange={(e) => set('sections', { ...values.sections, [section.key]: e.target.value })}
                    className={`${inputClass} text-sm`}
                  />
                </div>
              ) : section.mode === 'pricing' ? (
                <p className="px-4 py-3 text-sm text-gray-500">{section.text}</p>
              ) : (
                <details className="px-4 py-3">
                  <summary className="cursor-pointer text-sm text-brand-light-blue hover:text-brand-dark-blue">
                    Show Head Office wording
                  </summary>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{section.text}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      </Step>

      {/* 5. Sending */}
      <Step number={5} title="Validity and email">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="quote-valid" className={labelClass}>
              Valid until
            </label>
            <input
              id="quote-valid"
              type="date"
              value={values.validUntil}
              onChange={(e) => set('validUntil', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="quote-subject" className={labelClass}>
              Email subject
            </label>
            <input
              id="quote-subject"
              value={values.emailSubject}
              onChange={(e) => set('emailSubject', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="quote-message" className={labelClass}>
            Email message
          </label>
          <textarea
            id="quote-message"
            rows={8}
            value={values.emailMessage}
            onChange={(e) => set('emailMessage', e.target.value)}
            className={`${inputClass} text-sm`}
          />
          <p className="mt-1 text-xs text-gray-500">Sent with a link to the online quote and the PDF attached. Replies come to you.</p>
        </div>
      </Step>

      {/* Actions */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href={quoteId ? `/members/quoting/${quoteId}` : '/members/quoting'} className="text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue disabled:opacity-50 transition-colors font-helvetica"
          >
            <FiEye className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save and preview'}
          </button>
        </div>
      </div>
    </div>
  );
}
