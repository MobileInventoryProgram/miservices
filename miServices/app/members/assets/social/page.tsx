import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import SocialPostCreator from './SocialPostCreator';

export const metadata: Metadata = {
  title: 'Social Post Creator | Franchise Login | miServices',
};

export default async function SocialPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/members/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/members/assets" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft className="w-4 h-4" />
            Back to Assets
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-helvetica">Social Post Creator</h1>
          <p className="mt-1 text-blue-200">Pick a template, add your words and a photo, and download an on-brand post.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SocialPostCreator />
      </div>
    </div>
  );
}
