import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/about/Hero';
import AboutIntro from '@/components/about/AboutIntro';
import Timeline from '@/components/about/Timeline';
import AboutStats from '@/components/about/AboutStats';
import FeatureCards from '@/components/about/FeatureCards';
import { RichText } from '@/components/cms/Sections';
import { buildMetadata, getPageDoc, imageUrl } from '@/lib/cms/site';
import type { CmsCta, CmsFeature, CmsHero, CmsImage, CmsLink, CmsSeo, CmsStat } from '@/lib/cms/types';

interface AboutPageDoc {
  hero?: CmsHero;
  intro?: { heading?: string; text?: unknown[]; image?: CmsImage };
  quote?: string;
  story?: { heading?: string; text?: string; milestones?: { _key?: string; year?: string; title: string; description: string }[] };
  team?: { heading?: string; text?: string; stats?: CmsStat[]; footnote?: string };
  whatWeDo?: { heading?: string; text?: string; items?: CmsFeature[] };
  promoCards?: { _key?: string; heading?: string; text?: string; button?: CmsLink }[];
  network?: { heading?: string; text?: unknown[]; image?: CmsImage; primaryButton?: CmsLink; secondaryButton?: CmsLink };
  lookingAhead?: { heading?: string; lead?: string; mission?: string; text?: string };
  cta?: CmsCta;
  seo?: CmsSeo;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<AboutPageDoc>('aboutPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/about' });
}

export default async function AboutPage() {
  const doc = await getPageDoc<AboutPageDoc>('aboutPage');
  return (
    <>
      <Hero heading={doc?.hero?.heading} text={doc?.hero?.subheading} />

      <AboutIntro heading={doc?.intro?.heading} text={doc?.intro?.text} imageSrc={imageUrl(doc?.intro?.image, 1200)} imageAlt={doc?.intro?.image?.alt} />

      <section className="py-16 bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl md:text-2xl leading-relaxed italic">
            {doc?.quote}
          </p>
        </div>
      </section>

      <Timeline heading={doc?.story?.heading} text={doc?.story?.text} milestones={doc?.story?.milestones || []} />

      <AboutStats heading={doc?.team?.heading} text={doc?.team?.text} footnote={doc?.team?.footnote} items={doc?.team?.stats || []} />

      <FeatureCards title={doc?.whatWeDo?.heading} subtitle={doc?.whatWeDo?.text} features={doc?.whatWeDo?.items || []} background="gray" />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(doc?.promoCards || []).map((card, i) => (
              <div key={card._key || i} className="bg-gray-50 border-l-4 border-brand-light-blue p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">{card.heading}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{card.text}</p>
                {card.button && (
                  <Link
                    href={card.button.href}
                    className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md"
                  >
                    {card.button.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl order-2 lg:order-1">
              {imageUrl(doc?.network?.image, 1200) && <Image
                src={imageUrl(doc?.network?.image, 1200)!}
                alt={doc?.network?.image?.alt || ''}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />}
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">{doc?.network?.heading}</h2>
              <div className="mb-8 [&>p:last-child]:mb-0">
                <RichText value={doc?.network?.text} paragraphClass="text-gray-700 leading-relaxed mb-6" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {doc?.network?.primaryButton && (
                  <Link
                    href={doc.network.primaryButton.href}
                    className="inline-block bg-brand-light-blue text-white border-2 border-transparent px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md text-center"
                  >
                    {doc.network.primaryButton.label}
                  </Link>
                )}
                {doc?.network?.secondaryButton && (
                  <Link
                    href={doc.network.secondaryButton.href}
                    className="inline-block bg-transparent border-2 border-brand-light-blue text-brand-light-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-brand-light-blue hover:text-white transition-all text-center"
                  >
                    {doc.network.secondaryButton.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
            {doc?.lookingAhead?.heading}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-4">
            {doc?.lookingAhead?.lead}
          </p>
          <p className="text-2xl font-semibold text-brand-light-blue mb-8 italic">
            {doc?.lookingAhead?.mission}
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            {doc?.lookingAhead?.text}
          </p>
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" transform="scale(1, -1)">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-helvetica">
            {doc?.cta?.heading}
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            {doc?.cta?.text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {doc?.cta?.primaryButton && (
              <Link
                href={doc.cta.primaryButton.href}
                className="inline-block bg-white text-brand-dark-blue border-2 border-transparent px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                {doc.cta.primaryButton.label}
              </Link>
            )}
            {doc?.cta?.secondaryButton && (
              <Link
                href={doc.cta.secondaryButton.href}
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
              >
                {doc.cta.secondaryButton.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
