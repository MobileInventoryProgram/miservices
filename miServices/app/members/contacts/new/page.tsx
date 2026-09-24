import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import ContactForm from '../ContactForm';

export const metadata: Metadata = {
  title: 'Add Contact | Franchise Login | miServices',
};

export default async function NewContactPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const scope = await getMemberScope(session);
  if (!scope?.franchiseeId) {
    redirect('/members/contacts');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/members/contacts"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Contacts
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Add Contact</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContactForm cancelHref="/members/contacts" />
      </div>
    </div>
  );
}
