'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiBookOpen, FiLogOut, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface Guide {
  id: number;
  title: string;
  slug: string;
}

interface GuideCategory {
  category: string;
  guides: Guide[];
}

export default function StaffProcessGuides() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guideCategories, setGuideCategories] = useState<GuideCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'staff') {
      router.push('/members/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchGuides() {
      try {
        setLoading(true);
        const res = await fetch('/api/process-guides/staff');
        const data = await res.json();
        
        if (data.success) {
          setGuideCategories(data.sections);
        }
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchGuides();
    }
  }, [status]);

  if (status === 'loading' || loading) {
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
              <h1 className="text-3xl font-bold font-helvetica">Process Guides</h1>
              <p className="mt-1 text-brand-light-blue">Internal documentation and procedures</p>
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
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-dark-blue hover:text-brand-light-blue mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </button>

        {guideCategories.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No guides available at the moment. Please check back later.</p>
          </div>
        ) : (
          guideCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
                {category.category}
              </h2>
              <div className="space-y-6">
                {category.guides.map((guide) => (
                  <div key={guide.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-brand-light-blue/10 rounded-lg flex-shrink-0">
                        <FiBookOpen className="w-6 h-6 text-brand-light-blue" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-helvetica font-bold text-brand-dark-blue text-xl mb-4">
                          {guide.title}
                        </h3>
                        <Link
                          href={`/members/staff/guides/${guide.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors font-medium"
                        >
                          <span>View Guide</span>
                          <FiArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="mt-8 bg-brand-light-blue/10 rounded-lg p-6">
          <h3 className="font-helvetica font-bold text-brand-dark-blue text-lg mb-2">
            Need Additional Support?
          </h3>
          <p className="text-gray-700">
            If you have questions or need clarification on any of these procedures, please contact your supervisor or the appropriate department.
          </p>
        </div>
      </div>
    </div>
  );
}
