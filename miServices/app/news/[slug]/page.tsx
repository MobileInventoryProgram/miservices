import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSinglePost, getAllPostSlugs, urlFor, estimateReadingTime } from '@/lib/sanity';
import PortableText from '@/components/PortableText';
import { notFound } from 'next/navigation';
import { FiCalendar, FiClock, FiArrowLeft, FiUser } from 'react-icons/fi';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { getPageDoc } from '@/lib/cms/site';
import type { NewsPageDoc } from '../page';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getSinglePost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found | miServices',
    };
  }

  const imageUrl = post.featuredImage?.asset
    ? urlFor(post.featuredImage).width(1200).height(630).url()
    : undefined;

  const title = post.seo?.metaTitle || `${post.title} | miServices News`;
  const description = post.seo?.metaDescription || post.excerpt;
  return {
    title,
    description,
    keywords: post.seo?.keywords,
    robots: post.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      url: `${BASE_URL}/news/${post.slug}`,
      siteName: 'miServices',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/news/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const [post, newsPage] = await Promise.all([getSinglePost(params.slug), getPageDoc<NewsPageDoc>('newsPage')]);

  if (!post) {
    notFound();
  }

  const readingTime = post.readingTime || estimateReadingTime(post.body);
  const featuredImageUrl = post.featuredImage?.asset
    ? urlFor(post.featuredImage).width(1280).height(720).url()
    : null;
  const authorImageUrl = post.author?.image?.asset
    ? urlFor(post.author.image).width(100).height(100).url()
    : null;

  const articleImageUrl = post.featuredImage?.asset
    ? urlFor(post.featuredImage).width(1200).height(630).url()
    : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    ...(articleImageUrl ? { image: articleImageUrl } : {}),
    author: {
      '@type': 'Person',
      name: post.author?.name || 'miServices',
    },
    publisher: {
      '@type': 'Organization',
      name: 'miServices',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/news/${post.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <article className="bg-white">
        <div className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
              <path
                d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                fill="white"
              />
            </svg>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/news"
              className="inline-flex items-center text-white hover:text-white/80 transition-colors mb-6"
            >
              <FiArrowLeft className="mr-2" />
              Back to News
            </Link>

            {post.tags && post.tags.length > 0 && (
              <div className="mb-4">
                <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {post.tags[0].name}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-helvetica">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm mb-8">
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 mr-2" />
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-2" />
                {readingTime} min read
              </div>
              {post.author && (
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  {post.author.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {featuredImageUrl && (
          <div className="relative w-full h-96 -mt-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative h-96 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={featuredImageUrl}
                  alt={post.featuredImage?.alt || post.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <PortableText value={post.body} />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Tagged with:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">{newsPage?.postCta?.heading}</h2>
            <p className="text-gray-600 mb-6">{newsPage?.postCta?.text}</p>
            {newsPage?.postCta?.button && (
              <Link
                href={newsPage.postCta.button.href}
                className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-8 py-3 rounded-lg font-semibold hover:bg-brand-dark-blue transition-colors"
              >
                {newsPage.postCta.button.label}
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
