'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiFileText, FiLogOut, FiBookOpen, FiExternalLink, FiArrowRight, FiDatabase } from 'react-icons/fi';
import Link from 'next/link';

export default function FranchiseDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'franchise') {
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

  if (!session || session.user.role !== 'franchise') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-helvetica">Franchise Dashboard</h1>
              <p className="mt-1 text-brand-light-blue">Welcome back, {session.user.name}</p>
              {session.user.territory && (
                <p className="text-sm mt-1 opacity-90">Territory: {session.user.territory}</p>
              )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Documents */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                  <FiFileText className="w-6 h-6 text-brand-light-blue" />
                </div>
                <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">My Documents</h2>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Access your franchise agreement, contracts, and personal documents.
            </p>
            {session.user.contractLink && (
              <div className="mb-4">
                <a
                  href={session.user.contractLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-brand-light-blue/10 rounded-md transition-colors group"
                >
                  <span className="text-brand-dark-blue font-medium text-sm">View Contract</span>
                  <FiExternalLink className="w-4 h-4 text-brand-light-blue group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            )}
            <Link
              href="/members/franchise/documents"
              className="flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue font-medium transition-colors"
            >
              <span>See All</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Process Guides */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                  <FiBookOpen className="w-6 h-6 text-brand-light-blue" />
                </div>
                <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">Process Guides</h2>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Step-by-step guides and best practices for franchise operations, including daily procedures, marketing, sales, and more.
            </p>
            <Link
              href="/members/franchise/guides"
              className="flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue font-medium transition-colors"
            >
              <span>View All Guides</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CRM Contacts */}
          <Link href="/members/crm/contacts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiDatabase className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">CRM Contacts</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage customer relationships, leads, and proposals for your territory.
            </p>
            <span className="text-brand-light-blue font-medium hover:text-brand-dark-blue">Manage Contacts →</span>
          </Link>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-4">
            Welcome to Your Franchise Dashboard
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            This is your central hub for managing your miServices franchise. As we continue to develop
            this platform, you'll soon have access to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Your franchise documentation and agreements</li>
            <li>Comprehensive process guides and training materials</li>
            <li>Contact management system for your clients</li>
            <li>Marketing assets and branding materials</li>
            <li>Support ticket system</li>
            <li>Latest news and updates from head office</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-6">
            If you need assistance or have any questions, please don't hesitate to contact head office.
          </p>
        </div>
      </div>
    </div>
  );
}
