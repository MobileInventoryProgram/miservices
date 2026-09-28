import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPageDoc, getSiteSettings, telHref } from '@/lib/cms/site';
import { CmsIcon } from '@/lib/cms/icons';
import { RichText } from '@/components/cms/Sections';
import type { CmsFeature, CmsLink } from '@/lib/cms/types';
import { getFranchisees, getFranchiseeBySlug, urlFor } from '@/lib/sanity';
import type { TransformedFranchisee } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProfileTabs from './ProfileTabs';
import NetworkMap from '@/components/network/NetworkMap';
import { getNetworkGeo, type FranchiseGeo } from '@/lib/network/geo';
import { FiMapPin, FiPhone, FiMail, FiCheckCircle, FiUser, FiAward, FiShield, FiClock, FiStar } from 'react-icons/fi';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mobileinventoryservices.co.uk';

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const franchisees = await getFranchisees();
  return franchisees
    .filter((f) => f.slug !== 'head-office')
    .map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const franchisee = await getFranchiseeBySlug(params.slug, { preview: draftMode().isEnabled });

  if (!franchisee) {
    return { title: 'Operative Not Found | miServices' };
  }

  const topTowns = franchisee.townsCities
    ? franchisee.townsCities.split(',').slice(0, 3).map((t) => t.trim()).join(', ')
    : franchisee.territory;

  const template = await getTemplate();
  const values = { territory: franchisee.territory, towns: topTowns };
  const title = fill(template?.profileSeo?.title, values);
  const description = fill(template?.profileSeo?.description, values);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(franchisee.areaImage?.asset?._ref ? { images: [{ url: urlFor(franchisee.areaImage).width(1200).height(630).fit('crop').url(), width: 1200, height: 630 }] } : {}),
      url: `${BASE_URL}/our-network/${params.slug}`,
      siteName: 'miServices',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/our-network/${params.slug}`,
    },
  };
}

interface NetworkProfileTemplate {
  profileHero?: { heading?: string; subheading?: string; primaryButton?: CmsLink; secondaryButton?: CmsLink };
  profileIntro?: { heading?: string; defaultText?: { children?: { text?: string }[] }[] };
  profileServices?: { heading?: string; items?: CmsFeature[] };
  profileAreas?: { areasHeading?: string; areasText?: string; postcodesHeading?: string; postcodesText?: string };
  profileWhy?: { heading?: string; items?: CmsFeature[] };
  profileCta?: { heading?: string; text?: string; primaryButton?: CmsLink; secondaryButton?: CmsLink };
  profileSeo?: { title?: string; description?: string };
}

const getTemplate = () =>
  getPageDoc<NetworkProfileTemplate>('ourNetworkPage', 'profileHero, profileIntro, profileServices, profileAreas, profileWhy, profileCta, profileSeo');

/** Fill {territory} / {towns} in template text from the Our Network page in the CMS */
const fill = (text: string | undefined, values: Record<string, string>) =>
  (text || '').replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m);

/** Rich text with {territory} filled in */
function fillBlocks<T extends { children?: { text?: string }[] }>(value: T[] | undefined, values: Record<string, string>): T[] {
  return (value || []).map((block) => ({ ...block, children: block.children?.map((c) => ({ ...c, text: fill(c.text, values) })) }));
}

/** The service a franchise highlights, from the standard services list */
const findService = (services: CmsFeature[], slug: string) => services.find((s) => s.href === `/services/${slug}`);

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function buildJsonLd(
  franchisee: TransformedFranchisee,
  primaryOwner: TransformedFranchisee['owners'][0] | undefined,
  site: { phone?: string; email?: string; siteName: string },
  geo: FranchiseGeo | null
) {
  const towns = (franchisee.townsCities || '').split(',').map((t) => t.trim()).filter(Boolean);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/our-network/${franchisee.slug}`,
    name: `miServices ${franchisee.territory}`,
    description: `Professional property inventory services in ${franchisee.territory}. Inventory reports, check-ins, check-outs and mid-tenancy inspections.`,
    url: `${BASE_URL}/our-network/${franchisee.slug}`,
    telephone: primaryOwner?.phone || site.phone,
    email: primaryOwner?.email || site.email,
    // The towns covered, so the page can rank for "inventory clerk <town>"
    areaServed: towns.length
      ? towns.slice(0, 40).map((name) => ({ '@type': 'City', name }))
      : { '@type': 'Place', name: franchisee.territory },
    ...(geo
      ? {
          geo: { '@type': 'GeoCoordinates', latitude: +geo.pin[1].toFixed(4), longitude: +geo.pin[0].toFixed(4) },
          address: { '@type': 'PostalAddress', ...(geo.town ? { addressLocality: geo.town } : {}), addressRegion: geo.region, addressCountry: 'GB' },
        }
      : {}),
    parentOrganization: {
      '@type': 'Organization',
      name: 'miServices',
      url: BASE_URL,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '££',
    image: franchisee.areaImage?.asset?._ref ? urlFor(franchisee.areaImage).width(1200).height(630).fit('crop').url() : `${BASE_URL}/logo.png`,
    logo: `${BASE_URL}/logo.png`,
  };

  if (franchisee.qualifications.yearsExperience && franchisee.qualifications.yearsExperience > 0) {
    const foundingYear = new Date().getFullYear() - franchisee.qualifications.yearsExperience;
    schema.foundingDate = `${foundingYear}`;
  }

  if (franchisee.testimonials.length > 0) {
    const avgRating =
      franchisee.testimonials.reduce((sum, t) => sum + t.rating, 0) /
      franchisee.testimonials.length;

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round(avgRating * 10) / 10,
      reviewCount: franchisee.testimonials.length,
      bestRating: 5,
      worstRating: 1,
    };

    schema.review = franchisee.testimonials.map((t) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: t.clientName,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: t.quote,
    }));
  }

  return schema;
}

export default async function FranchiseePage({ params }: Props) {
  // Head Office preview (draft mode) also shows franchises hidden while being set up
  const preview = draftMode().isEnabled;
  const [franchisee, template, site] = await Promise.all([getFranchiseeBySlug(params.slug, { preview }), getTemplate(), getSiteSettings()]);

  if (!franchisee) {
    notFound();
  }

  const locationsArray = franchisee.townsCities
    ? franchisee.townsCities.split(',').map((loc) => loc.trim()).filter(Boolean)
    : [];
  const postcodesArray = franchisee.postCodes
    ? franchisee.postCodes.split(',').map((pc) => pc.trim()).filter(Boolean)
    : [];
  const primaryOwner = franchisee.owners[0];
  const geo = (await getNetworkGeo([franchisee]))[franchisee.slug] || null;
  const localBusinessSchema = buildJsonLd(franchisee, primaryOwner, site, geo);
  const values = { territory: franchisee.territory };
  const standardServices = template?.profileServices?.items || [];

  // Determine if there's any "About" content to show
  const hasQualifications =
    franchisee.qualifications.yearsExperience !== null ||
    franchisee.qualifications.dbsChecked ||
    franchisee.qualifications.certifications.length > 0;
  const hasAboutContent =
    hasQualifications ||
    franchisee.testimonials.length > 0 ||
    franchisee.highlightedServices.length > 0 ||
    franchisee.teamMembers.length > 0;

  // Build highlighted services lookup
  const highlightedSlugs = new Set(
    franchisee.highlightedServices
      .filter((hs) => hs.serviceSlug)
      .map((hs) => hs.serviceSlug)
  );

  // ─── Services tab content (original page content) ─────────────

  const servicesContent = (
    <>
      {/* About / Location Description */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">{fill(template?.profileIntro?.heading, values)}</h2>
        {franchisee.locationDescription ? (
          <div className="prose prose-lg max-w-none text-gray-700">
            <PortableText value={franchisee.locationDescription} />
          </div>
        ) : (
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <RichText value={fillBlocks(template?.profileIntro?.defaultText, values)} paragraphClass="" />
          </div>
        )}
      </div>

      {/* Services — always the standard 6 on this tab */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
          {fill(template?.profileServices?.heading, values)}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {standardServices.map((service, i) => (
            <Link
              key={service._key || i}
              href={service.href || '/services'}
              className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <FiCheckCircle className="text-brand-light-blue mt-1 mr-3 flex-shrink-0" size={20} />
              <div>
                <span className="font-medium group-hover:text-brand-light-blue transition-colors">{service.title}</span>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Areas Covered */}
      {locationsArray.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
            {fill(template?.profileAreas?.areasHeading, values)}
          </h2>
          <p className="text-gray-600 mb-4">
            {template?.profileAreas?.areasText}
          </p>
          {/* The postcode districts covered, on a map */}
          {geo && geo.points.length > 0 && (
            <NetworkMap
              franchises={[{ slug: franchisee.slug, name: `miServices ${franchisee.territory}`, town: geo.town, pin: geo.pin, points: geo.points }]}
              frame={[franchisee.slug]}
              className="relative h-72 md:h-96 rounded-lg overflow-hidden mb-6 bg-gray-100"
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locationsArray.map((location, idx) => (
              <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <FiMapPin className="text-brand-light-blue mr-2 flex-shrink-0" size={16} />
                <span className="text-sm">{location}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Postcodes */}
      {postcodesArray.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">{fill(template?.profileAreas?.postcodesHeading, values)}</h2>
          <p className="text-gray-600 mb-4">
            {template?.profileAreas?.postcodesText}
          </p>
          <div className="flex flex-wrap gap-2">
            {postcodesArray.map((postcode, idx) => (
              <span key={idx} className="bg-brand-light-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                {postcode}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Why Choose */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
          {fill(template?.profileWhy?.heading, values)}
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {(template?.profileWhy?.items || []).map((item, i) => (
            <div key={item._key || i} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-light-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CmsIcon name={item.icon} className="w-6 h-6 text-brand-light-blue" />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark-blue font-helvetica">{item.title}</h3>
                <p className="text-gray-600 text-sm">{fill(item.description, values)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // ─── About tab content (franchisee-specific) ──────────────────

  const aboutContent = (
    <>
      {/* Qualifications */}
      {hasQualifications && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
            Qualifications & Experience
          </h2>
          <div className="flex flex-wrap gap-4">
            {franchisee.qualifications.yearsExperience !== null && (
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-lg">
                <FiClock className="w-5 h-5 text-brand-light-blue flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-brand-dark-blue">
                    {franchisee.qualifications.yearsExperience} year{franchisee.qualifications.yearsExperience !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
            {franchisee.qualifications.dbsChecked && (
              <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-lg">
                <FiShield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Verification</p>
                  <p className="font-medium text-green-700">DBS Checked</p>
                </div>
              </div>
            )}
            {franchisee.qualifications.certifications.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-lg"
              >
                <FiAward className="w-5 h-5 text-brand-light-blue flex-shrink-0" />
                <p className="font-medium text-brand-dark-blue">{cert}</p>
              </div>
            ))}
          </div>
          {franchisee.qualifications.additionalInfo && (
            <p className="mt-4 text-gray-600 leading-relaxed">
              {franchisee.qualifications.additionalInfo}
            </p>
          )}
        </div>
      )}

      {/* Highlighted / Specialist Services */}
      {franchisee.highlightedServices.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
            Our Specialist Services
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {franchisee.highlightedServices.map((hs) => {
              const matched = findService(standardServices, hs.serviceSlug);
              const title = hs.customServiceName || matched?.title || 'Service';
              const description = hs.description || matched?.description || '';
              const href = matched?.href || '/services';

              return (
                <Link
                  key={hs.key}
                  href={href}
                  className="flex items-start p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100"
                >
                  <FiCheckCircle className="text-brand-light-blue mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <span className="font-medium group-hover:text-brand-light-blue transition-colors">
                      {title}
                    </span>
                    <span className="ml-2 inline-block bg-brand-light-blue text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Specialist
                    </span>
                    {description && (
                      <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Members */}
      {franchisee.teamMembers.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
            Meet the Team
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {franchisee.teamMembers.map((tm) => (
              <div key={tm.key} className="flex items-start gap-4">
                {tm.photo ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={tm.photo}
                      alt={tm.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-dark-blue to-brand-light-blue flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-brand-dark-blue">{tm.name}</p>
                  {tm.role && <p className="text-sm text-brand-light-blue">{tm.role}</p>}
                  {tm.bio && <p className="text-sm text-gray-600 mt-1">{tm.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {franchisee.testimonials.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">
            What Our Clients Say
          </h2>
          <div className="space-y-6">
            {franchisee.testimonials.map((testimonial) => (
              <div
                key={testimonial.key}
                className="border-l-4 border-brand-light-blue pl-6 py-2"
              >
                <Stars rating={testimonial.rating} />
                <blockquote className="mt-2 text-gray-700 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-3">
                  <p className="font-medium text-brand-dark-blue">
                    {testimonial.clientName}
                  </p>
                  {testimonial.clientRole && (
                    <p className="text-sm text-gray-500">
                      {testimonial.clientRole}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen">
      {preview && (
        <div className="sticky top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-gray-900">
          Preview{franchisee.showOnNetwork === false ? ': not live yet. Only Head Office can see this page.' : ''}{' '}
          <a href="/api/admin/franchisees/preview/exit" className="underline">
            Leave preview
          </a>
        </div>
      )}
      <JsonLd data={localBusinessSchema} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20 overflow-hidden">
        {/* The area's landmark photo, under the brand colours so the text stays readable */}
        {franchisee.areaImage?.asset?._ref && (
          <>
            <Image
              src={urlFor(franchisee.areaImage).width(2000).height(900).fit('crop').auto('format').url()}
              alt={franchisee.areaImage.alt || ''}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-blue/90 via-brand-dark-blue/60 to-brand-dark-blue/20" />
            {/* On phones the text spans the full width, so darken the whole photo a little more */}
            <div className="absolute inset-0 bg-brand-dark-blue/40 md:hidden" />
          </>
        )}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-helvetica">
            {fill(template?.profileHero?.heading, values)}
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl">
            {template?.profileHero?.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            {template?.profileHero?.primaryButton && (
              <Link
                href={template.profileHero.primaryButton.href}
                className="bg-white text-brand-dark-blue border-2 border-transparent px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-all text-center"
              >
                {template.profileHero.primaryButton.label}
              </Link>
            )}
            {template?.profileHero?.secondaryButton && (
              <Link
                href={template.profileHero.secondaryButton.href}
                className="border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-brand-dark-blue transition-all text-center"
              >
                {template.profileHero.secondaryButton.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      <Breadcrumbs
        items={[
          { label: 'Our Network', href: '/our-network' },
          { label: franchisee.territory || franchisee.companyName },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            <ProfileTabs
              territory={franchisee.territory}
              servicesContent={servicesContent}
              aboutContent={aboutContent}
              hasAboutContent={hasAboutContent}
            />
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24 space-y-6">
              <h3 className="text-xl font-bold text-brand-dark-blue font-helvetica">Your Local Team</h3>

              {franchisee.owners.map((owner, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {owner.profilePicture ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={owner.profilePicture}
                        alt={owner.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-dark-blue to-brand-light-blue flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {owner.firstName[0]}{owner.lastName[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-brand-dark-blue">{owner.name}</p>
                    <p className="text-sm text-gray-500">{franchisee.companyName || `miServices ${franchisee.territory}`}</p>
                  </div>
                </div>
              ))}

              {/* Team Members in sidebar */}
              {franchisee.teamMembers.length > 0 && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Team</p>
                  {franchisee.teamMembers.map((tm) => (
                    <div key={tm.key} className="flex items-start gap-3">
                      {tm.photo ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={tm.photo}
                            alt={tm.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <FiUser className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-brand-dark-blue">{tm.name}</p>
                        {tm.role && (
                          <p className="text-xs text-gray-500">{tm.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {primaryOwner?.phone && (
                  <div className="flex items-center">
                    <FiPhone className="text-brand-light-blue mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Direct</p>
                      <a href={`tel:${primaryOwner.phone}`} className="text-brand-light-blue hover:underline font-medium">
                        {primaryOwner.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <FiPhone className="text-brand-light-blue mr-3 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Head Office</p>
                    <a href={telHref(site.phone)} className="text-brand-light-blue hover:underline font-medium">
                      {site.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiMail className="text-brand-light-blue mr-3 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${primaryOwner?.email}`} className="text-brand-light-blue hover:underline break-all text-sm">
                      {primaryOwner?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiMapPin className="text-brand-light-blue mr-3 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Territory</p>
                    <p className="font-medium">{franchisee.territory}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/booking"
                  className="block w-full bg-brand-light-blue text-white border-2 border-transparent px-6 py-3 rounded-md font-medium hover:bg-opacity-90 text-center transition-all"
                >
                  Book a Service
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border-2 border-brand-light-blue text-brand-light-blue px-6 py-3 rounded-md font-medium hover:bg-brand-light-blue hover:text-white text-center transition-all"
                >
                  Send Enquiry
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link href="/our-network" className="text-brand-light-blue hover:underline flex items-center text-sm">
                  <FiMapPin className="mr-2" />
                  View All Locations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">
            {fill(template?.profileCta?.heading, values)}
          </h2>
          <p className="text-xl mb-8 opacity-95">
            {template?.profileCta?.text}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {template?.profileCta?.primaryButton && (
              <Link
                href={template.profileCta.primaryButton.href}
                className="bg-white text-brand-dark-blue border-2 border-transparent px-10 py-4 rounded-md font-bold hover:bg-gray-100 transition-all text-lg"
              >
                {template.profileCta.primaryButton.label}
              </Link>
            )}
            {template?.profileCta?.secondaryButton && (
              <Link
                href={template.profileCta.secondaryButton.href}
                className="border-2 border-white text-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
              >
                {template.profileCta.secondaryButton.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
