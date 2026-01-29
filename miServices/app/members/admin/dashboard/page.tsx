'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiUsers, FiUpload, FiSettings, FiLogOut, FiFileText, FiDatabase } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'admin' && session?.user.role !== 'superadmin') {
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

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-helvetica">Admin Dashboard</h1>
              <p className="mt-1 text-brand-light-blue">Welcome back, {session.user.name}</p>
              <p className="text-sm mt-1 opacity-90">Full system access</p>
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
          {/* User Management */}
          <Link href="/members/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiUsers className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">User Management</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Create, edit, and manage user accounts for all roles.
            </p>
            <span className="text-brand-light-blue font-medium hover:text-brand-dark-blue">Manage Users →</span>
          </Link>

          {/* Document Management */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiUpload className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">Document Management</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Upload and assign documents to specific users.
            </p>
            <p className="text-sm text-gray-500 italic">Coming soon</p>
          </div>

          {/* Process Documentation */}
          <Link href="/members/admin/process-docs" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiFileText className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">Process Docs</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage process documentation links and categories.
            </p>
            <span className="text-brand-light-blue font-medium hover:text-brand-dark-blue">Manage Docs →</span>
          </Link>

          {/* CRM Contacts */}
          <Link href="/members/crm/contacts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiDatabase className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">CRM Contacts</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage customer relationships, leads, and proposals.
            </p>
            <span className="text-brand-light-blue font-medium hover:text-brand-dark-blue">Manage Contacts →</span>
          </Link>

          {/* News Management */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiFileText className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">News Management</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Publish news and updates to members via Ghost CMS.
            </p>
            <p className="text-sm text-gray-500 italic">Manage via Ghost dashboard</p>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-light-blue/10 rounded-lg">
                <FiSettings className="w-6 h-6 text-brand-light-blue" />
              </div>
              <h2 className="text-xl font-helvetica font-bold text-brand-dark-blue">System Settings</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Configure system-wide settings and permissions.
            </p>
            <p className="text-sm text-gray-500 italic">Coming soon</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-4">
            Admin Control Panel
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have full administrative access to the miServices members area. Upcoming features include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Complete user management (create, edit, suspend accounts)</li>
            <li>Document upload and assignment system</li>
            <li>Contact database with export functionality</li>
            <li>News and announcements management</li>
            <li>Process documentation link curation</li>
            <li>Activity audit logs</li>
            <li>System settings and permissions</li>
          </ul>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong> To create additional users, use the registration API endpoint
              or wait for the user management interface in Phase 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
