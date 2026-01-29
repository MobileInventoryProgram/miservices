'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiFileText, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function StaffMyDocuments() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'staff') {
      router.push('/members/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'staff') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/members/staff/dashboard"
                className="flex items-center gap-2 text-brand-light-blue hover:text-white mb-2 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <h1 className="text-3xl font-bold font-helvetica">My Documents</h1>
              <p className="mt-1 text-brand-light-blue">Access your HR documents and contracts</p>
            </div>
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                router.push('/members/login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="p-4 bg-brand-light-blue/10 rounded-full inline-block mb-4">
            <FiFileText className="w-12 h-12 text-brand-light-blue" />
          </div>
          <h3 className="font-helvetica font-bold text-brand-dark-blue text-xl mb-2">
            No Documents Available
          </h3>
          <p className="text-gray-600">
            Your HR documents, contracts, and personal files will be uploaded soon. Please contact HR if you have any questions.
          </p>
        </div>
      </div>
    </div>
  );
}
