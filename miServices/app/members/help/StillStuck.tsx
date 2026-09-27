import { FiMail, FiPhone } from 'react-icons/fi';

/** "Still stuck? Contact Head Office", with the search (if any) in the email subject */
export default function StillStuck({ phone, email, query }: { phone: string | null; email: string | null; query?: string }) {
  if (!phone && !email) return null;
  const subject = query ? `Help Centre question: ${query}` : 'Help Centre question';
  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
      <h2 className="font-semibold text-gray-900 font-helvetica">Still stuck?</h2>
      <p className="mt-1 text-sm text-gray-600">Contact Head Office and we&apos;ll help.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {phone && (
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-dark-blue shadow-sm hover:bg-gray-50"
          >
            <FiPhone className="h-4 w-4" /> {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-dark-blue shadow-sm hover:bg-gray-50"
          >
            <FiMail className="h-4 w-4" /> {email}
          </a>
        )}
      </div>
    </section>
  );
}
