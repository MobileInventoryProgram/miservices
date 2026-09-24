import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { contactName, getContactForScope } from '@/lib/crm/contacts';
import { contactToForm } from '@/lib/crm/types';
import { getMemberScope } from '@/lib/members-access';
import ContactForm from '../../ContactForm';

export const metadata: Metadata = {
  title: 'Edit Contact | Franchise Login | miServices',
};

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const { id } = await params;
  const scope = await getMemberScope(session);
  const contact = scope ? await getContactForScope(scope, id) : null;

  if (!contact) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/members/contacts/${id}`}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to {contactName(contact)}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Edit Contact</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContactForm contactId={id} initialValues={contactToForm(contact)} cancelHref={`/members/contacts/${id}`} />
      </div>
    </div>
  );
}
