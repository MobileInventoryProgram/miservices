'use client';

import { JOB_TYPES } from '@/lib/job-types';
import { CLIENT_TYPES, CONTACT_STATUSES } from '@/lib/crm/options';
import type { ContactFormValues } from '@/lib/crm/types';

export { EMPTY_CONTACT, type ContactFormValues } from '@/lib/crm/types';

export const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

/**
 * Contact fields, used by the Contacts form and when adding a contact while
 * building a quote. `compact` hides status and notes.
 */
export default function ContactFields({
  values,
  onChange,
  compact = false,
  idPrefix = 'contact',
}: {
  values: ContactFormValues;
  onChange: (values: ContactFormValues) => void;
  compact?: boolean;
  idPrefix?: string;
}) {
  const set = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) =>
    onChange({ ...values, [key]: value });
  const id = (name: string) => `${idPrefix}-${name}`;

  const toggleJob = (job: string) =>
    set('jobTypes', values.jobTypes.includes(job) ? values.jobTypes.filter((j) => j !== job) : [...values.jobTypes, job]);

  const textField = (name: keyof ContactFormValues, label: string, type = 'text') => (
    <div>
      <label htmlFor={id(name)} className={labelClass}>
        {label}
      </label>
      <input
        id={id(name)}
        type={type}
        autoComplete="off"
        value={values[name] as string}
        onChange={(e) => set(name, e.target.value)}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {textField('firstName', 'First name')}
        {textField('lastName', 'Last name')}
        {textField('companyName', 'Company name')}
        <div>
          <label htmlFor={id('clientType')} className={labelClass}>
            Client type
          </label>
          <select
            id={id('clientType')}
            value={values.clientType}
            onChange={(e) => set('clientType', e.target.value)}
            className={inputClass}
          >
            <option value="">Select…</option>
            {CLIENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        {textField('email', 'Email', 'email')}
        {textField('phone', 'Phone', 'tel')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">{textField('address', 'Address')}</div>
        {textField('postcode', 'Postcode')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor={id('propertyCount')} className={labelClass}>
            Number of properties
          </label>
          <input
            id={id('propertyCount')}
            type="number"
            min={0}
            inputMode="numeric"
            value={values.propertyCount}
            onChange={(e) => set('propertyCount', e.target.value)}
            className={inputClass}
          />
        </div>
        {!compact && (
          <div>
            <label htmlFor={id('status')} className={labelClass}>
              Status
            </label>
            <select
              id={id('status')}
              value={values.status}
              onChange={(e) => set('status', e.target.value)}
              className={inputClass}
            >
              {CONTACT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <fieldset>
        <legend className={labelClass}>Job types</legend>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((job) => {
            const checked = values.jobTypes.includes(job.value);
            return (
              <label
                key={job.value}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-brand-light-blue ${
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

      <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        {values.marketingUnsubscribed ? (
          <p className="text-sm text-gray-600">
            <strong className="font-medium text-gray-800">Unsubscribed from marketing emails.</strong> They used the link in an email, so only they can
            sign up again.
          </p>
        ) : (
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.marketingConsent}
              onChange={(e) => set('marketingConsent', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-light-blue"
            />
            <span className="text-sm">
              <span className="font-medium text-gray-800">Happy to receive marketing emails from miServices</span>
              <span className="block text-gray-500">
                Only tick this if they’ve agreed. They can unsubscribe from any email, and we record when and who ticked it.
              </span>
            </span>
          </label>
        )}
      </div>

      {!compact && (
        <div>
          <label htmlFor={id('notes')} className={labelClass}>
            Notes
          </label>
          <textarea
            id={id('notes')}
            rows={4}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}
