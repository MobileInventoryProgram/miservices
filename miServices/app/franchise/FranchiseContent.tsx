'use client';

import React, { useState } from 'react';
import { FiCheck, FiMapPin, FiStar } from 'react-icons/fi';
import { RichText } from '@/components/cms/Sections';
import { CmsIcon } from '@/lib/cms/icons';
import type { CmsFaq, CmsFeature, CmsHero, CmsSeo, CmsStep, CmsTestimonial } from '@/lib/cms/types';
import FranchiseProspectusForm from '@/components/forms/FranchiseProspectusForm';
import CalendarModal from '@/components/ui/CalendarModal';
import FAQAccordion from '@/components/ui/FAQAccordion';
import FiPoundSign from '@/components/icons/FiPoundSign';

export interface FranchisePageDoc {
  hero?: CmsHero;
  heroText?: string;
  callButtonLabel?: string;
  video?: { heading?: string; url?: string };
  why?: { heading?: string; text?: unknown[]; benefitsHeading?: string; benefits?: CmsFeature[] };
  clients?: { heading?: string; text?: string; items?: string[]; footnote?: string };
  investment?: {
    heading?: string; priceFrom?: string; priceTo?: string; priceNote?: string; includesHeading?: string; includesText?: string;
    includedHeading?: string; included?: string[]; callout?: string;
  };
  territories?: {
    heading?: string; text?: string; featuredHeading?: string; featuredButtonLabel?: string; newHeading?: string;
    featured?: Territory[]; available?: Territory[]; customBefore?: string; customLinkLabel?: string; customAfter?: string;
  };
  prospectus?: { heading?: string; text?: string };
  testimonials?: { heading?: string; items?: CmsTestimonial[] };
  journey?: { heading?: string; text?: string; steps?: CmsStep[]; buttonLabel?: string };
  faq?: { heading?: string; items?: CmsFaq[] };
  cta?: { heading?: string; text?: string; prospectusButtonLabel?: string; callButtonLabel?: string };
  seo?: CmsSeo;
}
type Territory = { _key?: string; name?: string; postcodes?: string; price?: string; description?: string; badge?: string };

/** "https://www.youtube.com/watch?v=ID" / "https://youtu.be/ID" → embed address */
function youtubeEmbed(url?: string) {
  const id = url?.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export default function FranchiseContent({ doc }: { doc: FranchisePageDoc | null }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const benefits = doc?.why?.benefits || [];
  const clients = doc?.clients?.items || [];
  const included = doc?.investment?.included || [];
  const steps = doc?.journey?.steps || [];
  const testimonials = doc?.testimonials?.items || [];
  const faqs = doc?.faq?.items || [];
  const featuredTerritories = doc?.territories?.featured || [];
  const availableTerritories = doc?.territories?.available || [];
  const videoUrl = youtubeEmbed(doc?.video?.url);

  return (
    <>
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-helvetica">
            {doc?.hero?.heading}
          </h1>
          <p className="text-xl md:text-2xl text-white opacity-90 mb-8">
            {doc?.hero?.subheading}
          </p>
          <p className="text-lg text-white opacity-85 mb-10 max-w-4xl mx-auto leading-relaxed">
            {doc?.heroText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            {doc?.hero?.primaryButton && (
              <a
                href={doc.hero.primaryButton.href}
                className="inline-block bg-white text-brand-dark-blue border-2 border-transparent px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                {doc.hero.primaryButton.label}
              </a>
            )}
            {doc?.hero?.secondaryButton && (
              <a
                href={doc.hero.secondaryButton.href}
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
              >
                {doc.hero.secondaryButton.label}
              </a>
            )}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
            >
              {doc?.callButtonLabel}
            </button>
          </div>
        </div>
      </section>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

{videoUrl && (
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
            {doc?.video?.heading}
          </h2>
          <div className="aspect-video bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="miServices Franchise Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>
      )}

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              {doc?.why?.heading}
            </h2>
            <div className="max-w-4xl mx-auto [&>p+p]:mt-4">
              <RichText value={doc?.why?.text} paragraphClass="text-xl text-gray-700 leading-relaxed" />
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-8 text-center font-helvetica">
            {doc?.why?.benefitsHeading}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <CmsIcon name={benefit.icon} className="w-12 h-12 text-brand-light-blue mb-4" />
                <h4 className="text-xl font-bold text-brand-dark-blue mb-3 font-helvetica">
                  {benefit.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              {doc?.clients?.heading}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
              {doc?.clients?.text}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client, index) => (
              <div key={index} className="bg-gray-50 border-l-4 border-brand-light-blue p-4 rounded">
                <p className="text-gray-800 font-semibold flex items-center">
                  <FiCheck className="w-5 h-5 text-brand-light-blue mr-2" />
                  {client}
                </p>
              </div>
            ))}
          </div>

          <p className="text-lg text-gray-700 text-center mt-8">
            {doc?.clients?.footnote}
          </p>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              {doc?.investment?.heading}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white rounded-2xl p-10 shadow-2xl">
                <div className="mb-6">
                  <FiPoundSign className="w-16 h-16 mb-4 opacity-80" size={64} />
                  <p className="text-6xl font-bold mb-2">{doc?.investment?.priceFrom}</p>
                  <p className="text-3xl font-semibold mb-4">{doc?.investment?.priceTo}</p>
                  <p className="text-lg opacity-90">
                    {doc?.investment?.priceNote}
                  </p>
                </div>
                <div className="border-t border-white border-opacity-30 pt-6">
                  <p className="text-xl font-semibold mb-3">{doc?.investment?.includesHeading}</p>
                  <p className="text-base opacity-90 leading-relaxed">
                    {doc?.investment?.includesText}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-6 font-helvetica flex items-center">
                <FiCheck className="w-8 h-8 text-brand-light-blue mr-3" />
                {doc?.investment?.includedHeading}
              </h3>
              <ul className="space-y-4">
                {included.map((item, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-light-blue bg-opacity-10 flex items-center justify-center mr-3 mt-0.5 group-hover:bg-opacity-20 transition-colors">
                      <FiCheck className="w-4 h-4 text-brand-light-blue" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-4 bg-brand-light-blue bg-opacity-5 rounded-lg border-l-4 border-brand-light-blue">
                <p className="text-brand-dark-blue font-semibold">
                  {doc?.investment?.callout}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="territories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              {doc?.territories?.heading}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {doc?.territories?.text}
            </p>
          </div>

          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <FiStar className="w-8 h-8 text-yellow-500 mr-3" />
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue font-helvetica">
                {doc?.territories?.featuredHeading}
              </h3>
              <FiStar className="w-8 h-8 text-yellow-500 ml-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredTerritories.map((territory, index) => (
                <div key={index} className="relative bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                      {territory.badge}
                    </span>
                  </div>
                  <FiMapPin className="w-12 h-12 text-brand-light-blue mb-4" />
                  <h4 className="text-3xl font-bold text-brand-dark-blue mb-3 font-helvetica">
                    {territory.name}
                  </h4>
                  <p className="text-4xl font-bold text-brand-light-blue mb-4">
                    {territory.price}
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {territory.description}
                  </p>
                  <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="w-full bg-brand-light-blue text-white border-2 border-transparent px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md"
                  >
                    {doc?.territories?.featuredButtonLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-8 text-center font-helvetica">
              {doc?.territories?.newHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableTerritories.map((territory, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <FiMapPin className="w-8 h-8 text-brand-light-blue mb-3" />
                  <h4 className="text-xl font-bold text-brand-dark-blue mb-2 font-helvetica">
                    {territory.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{territory.postcodes}</p>
                  <p className="text-2xl font-bold text-brand-light-blue">
                    {territory.price}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-gray-700">
              {doc?.territories?.customBefore}{' '}
              <button onClick={() => setIsCalendarOpen(true)} className="text-brand-light-blue font-semibold hover:underline">
                {doc?.territories?.customLinkLabel}
              </button>{' '}
              {doc?.territories?.customAfter}
            </p>
          </div>
        </div>
      </section>

      <section id="prospectus" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              {doc?.prospectus?.heading}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              {doc?.prospectus?.text}
            </p>
          </div>

          <FranchiseProspectusForm />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-12 text-center font-helvetica">
            {doc?.testimonials?.heading}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <p className="text-5xl text-brand-light-blue opacity-50">"</p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  {testimonial.quote}
                </p>
                <div className="border-t pt-4">
                  <p className="font-bold text-brand-dark-blue">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-light-blue rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-dark-blue rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-brand-dark-blue mb-4 font-helvetica">
              {doc?.journey?.heading}
            </h2>
            <p className="text-xl text-gray-600">
              {doc?.journey?.text}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-light-blue to-brand-dark-blue hidden md:block"></div>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex gap-6 items-start group">
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-brand-light-blue">
                      <h3 className="text-2xl font-bold text-brand-dark-blue mb-3 font-helvetica group-hover:text-brand-light-blue transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-block bg-gradient-to-r from-brand-light-blue to-brand-dark-blue text-white border-2 border-transparent px-12 py-5 rounded-lg font-helvetica font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              {doc?.journey?.buttonLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-12 text-center font-helvetica">
            {doc?.faq?.heading}
          </h2>

          <FAQAccordion faqs={faqs} />
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
            <a
              href="#prospectus"
              className="inline-block bg-white text-brand-dark-blue border-2 border-transparent px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
            >
              {doc?.cta?.prospectusButtonLabel}
            </a>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
            >
              {doc?.cta?.callButtonLabel}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
