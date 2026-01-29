import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/about/Hero';
import AboutIntro from '@/components/about/AboutIntro';
import Timeline from '@/components/about/Timeline';
import AboutStats from '@/components/about/AboutStats';
import FeatureCards from '@/components/about/FeatureCards';
import { FiFileText, FiCheckCircle, FiUsers, FiCalendar, FiCreditCard, FiClipboard, FiMapPin, FiAward } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'About miServices | Property Reporting, Inventory & Inspection Specialists',
  description: 'Discover the story behind miServices. Established in 2009, now operating in 65+ territories, supporting over 700 letting agents with professional property reporting and inventory services.',
  openGraph: {
    title: 'About miServices | Property Reporting, Inventory & Inspection Specialists',
    description: 'Discover the story behind miServices. Established in 2009, now operating in 65+ territories, supporting over 700 letting agents with professional property reporting and inventory services.',
    url: 'https://miservices.co.uk/about',
    type: 'website',
  },
};

export default function AboutPage() {
  const whatWeDoFeatures = [
    {
      icon: FiFileText,
      title: 'Inventory Reporting',
      description: 'Comprehensive property inventory reports with detailed documentation and professional photography.',
    },
    {
      icon: FiCheckCircle,
      title: 'Check-In & Check-Out Inspections',
      description: 'Thorough inspections at the start and end of tenancies to protect landlords and agents.',
    },
    {
      icon: FiClipboard,
      title: 'Mid-Term Property Visits',
      description: 'Regular property inspections to monitor condition and identify maintenance issues early.',
    },
    {
      icon: FiUsers,
      title: 'Block Management Inspections',
      description: 'Comprehensive inspection services for multi-unit properties and apartment blocks.',
    },
    {
      icon: FiAward,
      title: 'Standardised Documentation',
      description: 'Consistent, high-quality reports using digital tools and industry-leading processes.',
    },
    {
      icon: FiMapPin,
      title: 'Nationwide Coverage',
      description: 'Operating in 65+ territories across the UK with local expertise and national support.',
    },
  ];

  const whyDifferentFeatures = [
    {
      icon: FiCalendar,
      title: 'Centralised Booking',
      description: 'One point of contact for all reports — no need to manage multiple clerks or diaries.',
    },
    {
      icon: FiCreditCard,
      title: 'Consolidated Invoicing',
      description: 'Clear, simple, monthly billing for multi-branch agencies and portfolios.',
    },
    {
      icon: FiClipboard,
      title: 'Standardised Reporting',
      description: 'Every report follows the same high standard, backed by our quality assurance processes.',
    },
  ];

  return (
    <>
      <Hero />
      
      <AboutIntro />

      <section className="py-16 bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl md:text-2xl leading-relaxed italic">
            "We introduced technology to modernise the inventory process — improving accessibility, consistency, and efficiency overnight."
          </p>
        </div>
      </section>

      <Timeline />

      <AboutStats />

      <FeatureCards
        title="What We Do"
        subtitle="We specialise in professional property reporting services, using standardised documentation, digital reporting tools, and a nationwide team to ensure total consistency."
        features={whatWeDoFeatures}
        background="gray"
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 border-l-4 border-brand-light-blue p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">
                Build Your Business with miServices
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Join the UK's leading property reporting franchise network. Low startup costs, comprehensive training, proven systems, and nationwide support to help you build a profitable business in the growing rental sector.
              </p>
              <Link
                href="/franchise"
                className="inline-block bg-brand-light-blue text-white px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md"
              >
                Discover Franchise Opportunities
              </Link>
            </div>

            <div className="bg-gray-50 border-l-4 border-brand-light-blue p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">
                Nationwide Coverage
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Our network of professional operatives covers the entire UK. Each franchise is independently owned and operated, providing local expertise with national quality standards.
              </p>
              <Link
                href="/our-network"
                className="inline-block bg-brand-light-blue text-white px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md"
              >
                Find Your Nearest Operative
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl order-2 lg:order-1">
              <Image
                src="/stock_images/apartment_building_e_86a30c47.jpg"
                alt="miServices franchise network across the UK"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
                A Growing Franchise Network
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Each miServices territory is locally operated by trained professionals who follow our processes, QA standards, and service blueprint. This gives customers the best of both worlds: local care, national support, consistent documentation, and reliable scheduling.
              </p>
              <p className="text-gray-700 leading-relaxed mb-8">
                Our franchise team continues to expand, creating new opportunities across the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/our-network"
                  className="inline-block bg-brand-light-blue text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md text-center"
                >
                  Explore Our Network
                </Link>
                <Link
                  href="/contact"
                  className="inline-block bg-transparent border-2 border-brand-light-blue text-brand-light-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-brand-light-blue hover:text-white transition-all text-center"
                >
                  Become a Franchisee
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
            Looking Ahead
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-4">
            Our mission remains the same as it was in 2009:
          </p>
          <p className="text-2xl font-semibold text-brand-light-blue mb-8 italic">
            To make property reporting faster, smarter, and more reliable for everyone involved in the rental process.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            With expanding technology, stronger networks, and constant improvements in service quality, miServices is committed to leading the industry forward.
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
            Need Reliable Property Reporting?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Book a service or contact our team today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="inline-block bg-white text-brand-dark-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
            >
              Book a Service
            </Link>
            <Link
              href="/contact"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
