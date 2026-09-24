'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiArrowLeft, FiSave } from 'react-icons/fi';
import ContactFields, { EMPTY_CONTACT, type ContactFormValues } from '@/components/crm/ContactFields';

/**
 * Add or edit a contact. Saves through /api/members/contacts.
 */
export default function ContactForm({
  contactId,
  initialValues = EMPTY_CONTACT,
  cancelHref,
}: {
  contactId?: string;
  initialValues?: ContactFormValues;
  cancelHref: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch(contactId ? `/api/members/contacts/${contactId}` : '/api/members/contacts', {
        method: contactId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save contact');
        return;
      }

      router.push(`/members/contacts/${contactId || data.id}`);
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <FiAlertCircle className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <ContactFields values={values as ContactFormValues} onChange={setValues} />

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-helvetica"
        >
          <FiSave className="w-4 h-4" />
          {isSaving ? 'Saving...' : contactId ? 'Save Changes' : 'Add Contact'}
        </button>
        <Link href={cancelHref} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
      </div>
    </form>
  );
}
