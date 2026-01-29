'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLogOut, FiArrowLeft, FiClock, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import type { SanityPage } from '@/lib/sanity';
import PortableText from '@/components/PortableText';

export default function GuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<SanityPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role !== 'franchise') {
      router.push('/members/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchPage() {
      if (!slug) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/sanity/page/${slug}`);
        const data = await res.json();

        if (data.success && data.page) {
          setPage(data.page);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchPage();
    }
  }, [slug, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'franchise') {
    return null;
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-brand-dark-blue text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold font-helvetica">Page Not Found</h1>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-600 mb-6">The page you're looking for could not be found.</p>
          <Link
            href="/members/franchise/guides"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-light-blue text-white rounded-md hover:bg-brand-dark-blue transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Guides</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/members/franchise/guides"
                className="flex items-center gap-2 text-brand-light-blue hover:text-white mb-2 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to All Guides</span>
              </Link>
              <h1 className="text-3xl font-bold font-helvetica">{page.title}</h1>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {page.featuredImage?.asset && (
            <div className="w-full h-64 overflow-hidden relative">
              <Image
                src={page.featuredImage.asset.url || ''}
                alt={page.featuredImage.alt || page.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex gap-4 text-sm text-gray-500 mb-8">
              {page.publishedAt && (
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  <time dateTime={page.publishedAt}>
                    {new Date(page.publishedAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              )}
            </div>

            <PortableText value={page.body} />

            {page.tags && page.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {page.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="px-3 py-1 bg-brand-light-blue/10 text-brand-dark-blue rounded-full text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        <div className="mt-6">
          <Link
            href="/members/franchise/guides"
            className="inline-flex items-center gap-2 text-brand-light-blue hover:text-brand-dark-blue font-medium transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to All Guides</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
