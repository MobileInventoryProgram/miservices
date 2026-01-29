import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServiceBySlug, getAllServiceSlugs, urlFor } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import { FiCheckCircle, FiClipboard, FiShield, FiHome, FiKey, FiFileText, FiCamera, FiClock, FiTool, FiEye, FiAlertTriangle, FiUsers, FiLayers, FiTrendingUp } from 'react-icons/fi';

// Static content for each service - everything except hero description
const staticContent: Record<string, {
  featuresHeading: string;
  features: { icon: React.ReactNode; text: string }[];
  benefitsHeading: string;
  benefits: { icon: React.ReactNode; title: string; description: string }[];
  relatedServices: { slug: string; title: string; description: string }[];
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonText: string;
}> = {
  'pre-tenancy': {
    featuresHeading: 'What Happens During Pre-Tenancy',
    features: [
      { icon: <FiFileText className="w-6 h-6" />, text: 'Property documentation (inventory)' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety compliance checks' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key & access preparation' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Utility readings' },
      { icon: <FiHome className="w-6 h-6" />, text: 'Initial condition records' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Move-in readiness assessment' },
    ],
    benefitsHeading: 'Why Pre-Tenancy Matters',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Protects Deposits', description: 'Creates a clear baseline to resolve deposit disputes fairly at the end of tenancy' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Reduces Disputes', description: 'Clear documentation prevents misunderstandings between landlords and tenants' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Ensures Legal Compliance', description: 'Helps meet legal obligations for safety checks and property condition reporting' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Clear Baseline', description: 'Creates a comprehensive record for all future inspections and comparisons' },
    ],
    relatedServices: [
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Comprehensive property documentation with detailed condition records and high-quality photography' },
      { slug: 'check-ins', title: 'Check-In Services', description: 'Professional move-in inspections to verify property condition and ensure compliance' },
    ],
    ctaHeading: 'Ready to Prepare Your Property?',
    ctaDescription: 'Get professional pre-tenancy documentation and inspections to start your tenancy right',
    ctaButtonText: 'Book Pre-Tenancy Service',
  },
  'check-ins': {
    featuresHeading: 'What\'s Included in a Check-In',
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Detailed condition comparison against inventory' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence of current state' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key handover and meter readings' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Tenant signature and acknowledgement' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety equipment verification' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Digital report delivery within 24 hours' },
    ],
    benefitsHeading: 'Why Professional Check-Ins Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Dispute Prevention', description: 'Clear documentation at move-in prevents disagreements at check-out' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Tenant Confidence', description: 'Professional process builds trust and sets expectations from day one' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Legal Protection', description: 'Impartial third-party evidence supports deposit claims if needed' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Complete Records', description: 'Comprehensive documentation for your property management files' },
    ],
    relatedServices: [
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Detailed property documentation to compare against at check-in' },
      { slug: 'check-outs', title: 'Check-Out Services', description: 'End of tenancy inspections to complete the tenancy cycle' },
    ],
    ctaHeading: 'Ready to Book a Check-In?',
    ctaDescription: 'Professional check-in services delivered by our nationwide network of trained operatives',
    ctaButtonText: 'Book Check-In Service',
  },
  'mid-tenancy': {
    featuresHeading: 'What We Inspect',
    features: [
      { icon: <FiHome className="w-6 h-6" />, text: 'General property condition' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Maintenance issues identification' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety compliance verification' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic documentation' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Tenant care assessment' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Detailed report with recommendations' },
    ],
    benefitsHeading: 'Why Mid-Tenancy Inspections Matter',
    benefits: [
      { icon: <FiEye className="w-12 h-12 text-brand-light-blue" />, title: 'Early Issue Detection', description: 'Identify maintenance problems before they become expensive repairs' },
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Compliance Assurance', description: 'Verify ongoing compliance with safety regulations and tenancy terms' },
      { icon: <FiHome className="w-12 h-12 text-brand-light-blue" />, title: 'Property Protection', description: 'Ensure your property is being maintained to expected standards' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Tenant Relations', description: 'Professional inspections maintain positive landlord-tenant relationships' },
    ],
    relatedServices: [
      { slug: 'property-visits', title: 'Property Visits', description: 'Regular routine checks between formal inspections' },
      { slug: 'check-outs', title: 'Check-Out Services', description: 'End of tenancy inspections when the tenant moves out' },
    ],
    ctaHeading: 'Schedule a Mid-Tenancy Inspection',
    ctaDescription: 'Keep your property protected with regular professional inspections',
    ctaButtonText: 'Book Mid-Tenancy Inspection',
  },
  'check-outs': {
    featuresHeading: 'What\'s Included in a Check-Out',
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Room-by-room condition comparison' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence of changes' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Fair wear and tear assessment' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Cleaning standards evaluation' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key return and meter readings' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Deposit recommendation summary' },
    ],
    benefitsHeading: 'Why Professional Check-Outs Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Deposit Clarity', description: 'Clear, evidence-based recommendations for deposit deductions' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Dispute Resolution', description: 'Impartial third-party evidence accepted by deposit schemes' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Fair Assessment', description: 'Professional distinction between damage and fair wear and tear' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Complete Documentation', description: 'Comprehensive report comparing start and end of tenancy' },
    ],
    relatedServices: [
      { slug: 'check-ins', title: 'Check-In Services', description: 'Start the next tenancy with professional move-in documentation' },
      { slug: 'end-tenancy', title: 'End-Tenancy Services', description: 'Complete end of tenancy management and reporting' },
    ],
    ctaHeading: 'Book Your Check-Out Inspection',
    ctaDescription: 'Professional check-out services to protect deposits and resolve disputes fairly',
    ctaButtonText: 'Book Check-Out Service',
  },
  'inventory-reports': {
    featuresHeading: 'What\'s Included',
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Room-by-room detailed inventory' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'High-resolution photography' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Condition ratings and descriptions' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Fixture and fitting documentation' },
      { icon: <FiHome className="w-6 h-6" />, text: 'Meter readings and key counts' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Digital delivery within 24-48 hours' },
    ],
    benefitsHeading: 'Why Professional Inventories Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Deposit Protection', description: 'Essential evidence for deposit dispute resolution with schemes' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Impartial Record', description: 'Third-party documentation accepted by courts and adjudicators' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Legal Compliance', description: 'Meet your obligations under deposit protection legislation' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Professional Standards', description: 'Consistent quality from our network of trained inventory clerks' },
    ],
    relatedServices: [
      { slug: 'check-ins', title: 'Check-In Services', description: 'Use the inventory as the basis for move-in inspections' },
      { slug: 'check-outs', title: 'Check-Out Services', description: 'Compare end-of-tenancy condition against the inventory' },
    ],
    ctaHeading: 'Get Your Inventory Report',
    ctaDescription: 'Professional inventory services delivered fast by our nationwide network',
    ctaButtonText: 'Book Inventory Report',
  },
  'property-visits': {
    featuresHeading: 'What We Check',
    features: [
      { icon: <FiHome className="w-6 h-6" />, text: 'General property condition' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Maintenance requirements' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Safety equipment checks' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic evidence' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Tenant compliance verification' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Actionable recommendations' },
    ],
    benefitsHeading: 'Why Regular Property Visits Matter',
    benefits: [
      { icon: <FiEye className="w-12 h-12 text-brand-light-blue" />, title: 'Proactive Management', description: 'Identify issues before they become costly problems' },
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Compliance Monitoring', description: 'Ensure ongoing adherence to tenancy terms and regulations' },
      { icon: <FiHome className="w-12 h-12 text-brand-light-blue" />, title: 'Asset Protection', description: 'Regular oversight helps maintain property value' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Peace of Mind', description: 'Professional reports keep you informed about your property' },
    ],
    relatedServices: [
      { slug: 'mid-tenancy', title: 'Mid-Tenancy Inspections', description: 'More detailed formal inspections during the tenancy' },
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Comprehensive property documentation for comparison' },
    ],
    ctaHeading: 'Schedule a Property Visit',
    ctaDescription: 'Regular property visits to keep you informed and your investment protected',
    ctaButtonText: 'Book Property Visit',
  },
  'block-management': {
    featuresHeading: 'Our Block Management Services',
    features: [
      { icon: <FiLayers className="w-6 h-6" />, text: 'Multi-unit inspection coordination' },
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Communal area assessments' },
      { icon: <FiShield className="w-6 h-6" />, text: 'Health & safety compliance checks' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Photographic documentation' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Consolidated reporting' },
      { icon: <FiTrendingUp className="w-6 h-6" />, text: 'Portfolio-wide consistency' },
    ],
    benefitsHeading: 'Why Choose miServices for Block Management',
    benefits: [
      { icon: <FiUsers className="w-12 h-12 text-brand-light-blue" />, title: 'Nationwide Coverage', description: 'Consistent service quality across all your properties, wherever they are' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Standardised Reporting', description: 'Uniform report formats for easy comparison across your portfolio' },
      { icon: <FiTrendingUp className="w-12 h-12 text-brand-light-blue" />, title: 'Scalable Service', description: 'From single blocks to large portfolios, we scale with your needs' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Reliable Scheduling', description: 'Dependable inspection schedules that fit your management calendar' },
    ],
    relatedServices: [
      { slug: 'property-visits', title: 'Property Visits', description: 'Individual unit inspections within your blocks' },
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Detailed unit documentation for tenancy management' },
    ],
    ctaHeading: 'Partner With miServices',
    ctaDescription: 'Reliable block management inspection services for your entire portfolio',
    ctaButtonText: 'Discuss Your Requirements',
  },
  'end-tenancy': {
    featuresHeading: 'End-Tenancy Process',
    features: [
      { icon: <FiClipboard className="w-6 h-6" />, text: 'Final condition assessment' },
      { icon: <FiCamera className="w-6 h-6" />, text: 'Comprehensive photography' },
      { icon: <FiFileText className="w-6 h-6" />, text: 'Inventory comparison report' },
      { icon: <FiTool className="w-6 h-6" />, text: 'Damage vs wear assessment' },
      { icon: <FiKey className="w-6 h-6" />, text: 'Key collection and meters' },
      { icon: <FiCheckCircle className="w-6 h-6" />, text: 'Deposit recommendations' },
    ],
    benefitsHeading: 'Why Professional End-Tenancy Services Matter',
    benefits: [
      { icon: <FiShield className="w-12 h-12 text-brand-light-blue" />, title: 'Deposit Resolution', description: 'Clear evidence for fair deposit allocation between parties' },
      { icon: <FiClipboard className="w-12 h-12 text-brand-light-blue" />, title: 'Scheme Compliance', description: 'Reports accepted by all major deposit protection schemes' },
      { icon: <FiCheckCircle className="w-12 h-12 text-brand-light-blue" />, title: 'Fair Assessment', description: 'Impartial evaluation distinguishing damage from normal wear' },
      { icon: <FiFileText className="w-12 h-12 text-brand-light-blue" />, title: 'Complete Record', description: 'Full documentation closing out the tenancy professionally' },
    ],
    relatedServices: [
      { slug: 'check-outs', title: 'Check-Out Services', description: 'Detailed check-out inspections as part of the end-tenancy process' },
      { slug: 'inventory-reports', title: 'Inventory Reports', description: 'Start the next tenancy with fresh property documentation' },
    ],
    ctaHeading: 'Book End-Tenancy Services',
    ctaDescription: 'Professional end-tenancy management to close out tenancies smoothly',
    ctaButtonText: 'Book End-Tenancy Service',
  },
};

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  // Include static fallbacks
  const staticSlugs = Object.keys(staticContent);
  const allSlugs = [...new Set([...slugs, ...staticSlugs])];
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  const content = staticContent[params.slug];

  if (!service && !content) {
    return { title: 'Service Not Found' };
  }

  const title = service?.title || params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: service?.seo?.metaTitle || `${title} | miServices`,
    description: service?.seo?.metaDescription || service?.heroDescription,
    keywords: service?.seo?.keywords,
  };
}

export const revalidate = 60;

export default async function ServicePage({ params }: Props) {
  const service = await getServiceBySlug(params.slug);
  const content = staticContent[params.slug];

  if (!content) {
    notFound();
  }

  const title = service?.title || params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const heroDescription = service?.heroDescription || 'Professional property inspection services delivered by our nationwide network of trained operatives.';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-helvetica">{title}</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Body Content Section - from CMS */}
      {service?.bodyHeading && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">
              {service.bodyHeading}
            </h2>
            {service.bodyIntro && (
              <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-12">
                {service.bodyIntro}
              </p>
            )}

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {service.bodySubheading && (
                  <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">
                    {service.bodySubheading}
                  </h3>
                )}
                {service.bodyText && (
                  <div className="text-gray-700 leading-relaxed prose prose-lg">
                    <PortableText value={service.bodyText} />
                  </div>
                )}
              </div>
              {service.bodyImage?.asset && (
                <div className="relative">
                  <Image
                    src={urlFor(service.bodyImage).width(800).height(600).url()}
                    alt={service.bodyImage.alt || `${service.title} service`}
                    width={800}
                    height={600}
                    className="rounded-xl shadow-lg border-4 border-brand-light-blue/20 w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">
            {content.featuresHeading}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map((feature, idx) => (
              <div key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-brand-light-blue mt-1 mr-3 flex-shrink-0">
                  {feature.icon}
                </div>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">
            {content.benefitsHeading}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {content.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg hover:shadow-lg transition-all">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">Related Services</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {content.relatedServices.map((related) => (
              <Link
                key={related.slug}
                href={`/services/${related.slug}`}
                className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group"
              >
                <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">
                  {related.title}
                </h3>
                <p className="text-gray-600 mb-4">{related.description}</p>
                <span className="text-brand-light-blue font-bold group-hover:underline">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">{content.ctaHeading}</h2>
          <p className="text-xl mb-8 opacity-95">{content.ctaDescription}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="bg-white text-brand-dark-blue px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
            >
              {content.ctaButtonText}
            </Link>
            <Link
              href="/our-network"
              className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
            >
              Find Your Local Operative
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
