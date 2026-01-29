'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiUsers, FiLogOut, FiPhone, FiMail, FiMapPin, FiArrowLeft, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

interface FranchiseeContact {
  name: string;
  email: string;
  contactNumber: string | null;
  franchiseTerritory: string | null;
}

export default function FranchiseeContacts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<FranchiseeContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<FranchiseeContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'franchise') {
      router.push('/members/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/franchisee-contacts');
        const data = await res.json();
        if (data.success) {
          setContacts(data.contacts);
          setFilteredContacts(data.contacts);
        }
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    }
    
    if (status === 'authenticated') {
      fetchContacts();
    }
  }, [status]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.franchiseTerritory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

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
              <Link
                href="/members/franchise/dashboard"
                className="flex items-center gap-2 text-brand-light-blue hover:text-white mb-2 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <h1 className="text-3xl font-bold font-helvetica">My Contacts</h1>
              <p className="mt-1 text-brand-light-blue">Manage your network and connections</p>
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
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, territory, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light-blue"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredContacts.length} of {contacts.length} contacts
            </div>
          </div>
        </div>

        {loadingContacts ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-light-blue"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Territory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-brand-light-blue/10 rounded-full flex items-center justify-center">
                            <FiUsers className="h-4 w-4 text-brand-light-blue" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-brand-dark-blue">{contact.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {contact.franchiseTerritory || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {contact.contactNumber ? (
                          <a
                            href={`tel:${contact.contactNumber}`}
                            className="text-sm text-brand-light-blue hover:text-brand-dark-blue flex items-center gap-1"
                          >
                            <FiPhone className="w-3 h-3" />
                            {contact.contactNumber}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-brand-light-blue hover:text-brand-dark-blue flex items-center gap-1"
                        >
                          <FiMail className="w-3 h-3" />
                          {contact.email}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredContacts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No contacts found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
