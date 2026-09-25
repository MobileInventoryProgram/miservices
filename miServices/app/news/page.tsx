import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts, urlFor, estimateReadingTime } from '@/lib/sanity';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsCta, CmsHero, CmsSeo } from '@/lib/cms/types';
import type { Metadata } from 'next';

export interface NewsPageDoc {
  hero?: CmsHero;
  emptyText?: string;
  postCta?: { heading?: string; text?: string; button?: { label: string; href: string } };
  seo?: CmsSeo;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<NewsPageDoc>('newsPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/news' });
}
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';

export const revalidate = 60;

export default async function NewsPage() {
  const [posts, doc] = await Promise.all([getPosts(), getPageDoc<NewsPageDoc>('newsPage')]);

  return (
    <>
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-helvetica">
            {doc?.hero?.heading}
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            {doc?.hero?.subheading}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">{doc?.emptyText}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const readingTime = post.readingTime || estimateReadingTime(post.body);
                const imageUrl = post.featuredImage?.asset
                  ? urlFor(post.featuredImage).width(600).height(400).url()
                  : null;

                return (
                  <article
                    key={post._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group border border-gray-200"
                  >
                    {imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={post.featuredImage?.alt || post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {post.tags && post.tags.length > 0 && (
                        <div className="mb-3">
                          <span className="inline-block bg-brand-light-blue/10 text-brand-light-blue px-3 py-1 rounded-full text-sm font-medium">
                            {post.tags[0].name}
                          </span>
                        </div>
                      )}

                      <h2 className="text-xl font-bold text-brand-dark-blue mb-3 font-helvetica line-clamp-2 group-hover:text-brand-light-blue transition-colors">
                        <Link href={`/news/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {readingTime} min read
                        </div>
                      </div>

                      <Link
                        href={`/news/${post.slug}`}
                        className="inline-flex items-center text-brand-light-blue font-semibold hover:text-brand-dark-blue transition-colors"
                      >
                        Read More
                        <FiArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
