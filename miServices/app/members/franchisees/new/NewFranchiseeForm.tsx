'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiPlus } from 'react-icons/fi';
import { newLoginKey } from '../loginNotice';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-brand-light-blue focus:border-brand-light-blue';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

/** The essentials for a new franchise; the rest of the profile is filled in on its page */
export default function NewFranchiseeForm() {
  const router = useRouter();
  const [form, setForm] = useState({ companyName: '', territory: '', postCodes: '', townsCities: '', firstName: '', lastName: '', email: '', phone: '' });
  const [createLogin, setCreateLogin] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/franchisees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: form.companyName,
        territory: form.territory,
        postCodes: form.postCodes,
        townsCities: form.townsCities,
        owner: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        createLogin,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed to add the franchise');
      setBusy(false);
      return;
    }
    // The temporary password is shown once on the franchise's page (kept out of the address bar)
    if (data.login) {
      try {
        sessionStorage.setItem(newLoginKey(data.id), JSON.stringify(data.login));
      } catch {
        // Private browsing: the page offers a password reset instead
      }
    }
    router.push(`/members/franchisees/${data.id}`);
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 font-helvetica">Franchise</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nf-company" className={labelClass}>
              Company name
            </label>
            <input id="nf-company" required maxLength={120} value={form.companyName} onChange={set('companyName')} placeholder="e.g. miServices Chester" className={inputClass} />
          </div>
          <div>
            <label htmlFor="nf-territory" className={labelClass}>
              Territory
            </label>
            <input id="nf-territory" required maxLength={80} value={form.territory} onChange={set('territory')} placeholder="e.g. Chester" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="nf-postcodes" className={labelClass}>
            Postcodes covered
          </label>
          <textarea id="nf-postcodes" rows={2} value={form.postCodes} onChange={set('postCodes')} placeholder="e.g. CH1-4, CH60-66, BA" className={inputClass} />
          <p className="mt-1 text-xs text-gray-500">Separate with commas. Ranges like CH1-4 and whole areas like BA are fine.</p>
        </div>
        <div>
          <label htmlFor="nf-towns" className={labelClass}>
            Towns and cities
          </label>
          <textarea id="nf-towns" rows={2} value={form.townsCities} onChange={set('townsCities')} placeholder="e.g. Chester, Ellesmere Port, Neston" className={inputClass} />
          <p className="mt-1 text-xs text-gray-500">Separate with commas. The map pin goes on the first town.</p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 font-helvetica">Owner</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nf-first" className={labelClass}>
              First name
            </label>
            <input id="nf-first" required maxLength={60} value={form.firstName} onChange={set('firstName')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="nf-last" className={labelClass}>
              Last name
            </label>
            <input id="nf-last" required maxLength={60} value={form.lastName} onChange={set('lastName')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="nf-email" className={labelClass}>
              Email
            </label>
            <input id="nf-email" type="email" required maxLength={120} value={form.email} onChange={set('email')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="nf-phone" className={labelClass}>
              Phone <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input id="nf-phone" type="tel" maxLength={40} value={form.phone} onChange={set('phone')} className={inputClass} />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={createLogin}
            onChange={(e) => setCreateLogin(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-dark-blue focus:ring-brand-light-blue"
          />
          <span>
            Create a Members Area login for the owner
            <span className="block text-xs text-gray-500">A temporary password is shown once on the next page for you to pass on.</span>
          </span>
        </label>
      </section>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700" role="alert">
          <FiAlertCircle /> {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md bg-brand-light-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark-blue disabled:opacity-50"
      >
        <FiPlus className="h-4 w-4" /> {busy ? 'Adding…' : 'Add franchisee'}
      </button>
    </form>
  );
}
