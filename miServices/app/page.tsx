import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import AnimatedStats from '../components/AnimatedStats';
import JsonLd from '@/components/JsonLd';
import { CmsIcon } from '@/lib/cms/icons';
import { BASE_URL, buildMetadata, getPageDoc, getSiteSettings, imageUrl } from '@/lib/cms/site';
import type { CmsCta, CmsFeature, CmsHero, CmsImage, CmsLink, CmsSeo, CmsStat } from '@/lib/cms/types';

interface HomePageDoc {
  hero?: CmsHero;
  statsSection?: { heading?: string; stats?: CmsStat[] };
  whySection?: { heading?: string; items?: CmsFeature[] };
  servicesSection?: { heading?: string; cards?: CmsFeature[] };
  clientsSection?: { heading?: string; text?: string; logos?: (CmsImage & { _key?: string })[] };
  audiencesSection?: { heading?: string; cards?: CmsFeature[] };
  locationsSection?: { heading?: string; text?: string; locations?: { _key?: string; label?: string; slug?: string; name?: string }[]; allLink?: CmsLink };
  franchiseSection?: { heading?: string; text?: string; stats?: CmsStat[] };
  cta?: CmsCta;
  seo?: CmsSeo;
}

const getHome = () =>
  getPageDoc<HomePageDoc>(
    'homePage',
    `..., locationsSection { ..., "locations": locations[] { _key, label, "slug": franchisee->slug.current, "name": franchisee->companyName } }`
  );

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome();
  return buildMetadata(home?.seo, { title: home?.hero?.heading, description: home?.hero?.subheading, path: '' });
}

export default async function Home() {
  const [home, site] = await Promise.all([getHome(), getSiteSettings()]);
  const hero = home?.hero;
  const [line1, ...addressRest] = site.address || [];
  const postcode = addressRest.pop();
  const town = addressRest.pop();

  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: site.siteName,
          legalName: site.legalName,
          url: BASE_URL,
          logo: `${BASE_URL}/logo.png`,
          description: site.defaultDescription,
          telephone: site.phone,
          email: site.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: [line1, ...addressRest].filter(Boolean).join(', '),
            addressLocality: town,
            postalCode: postcode,
            addressCountry: 'GB',
          },
          areaServed: { '@type': 'Country', name: 'United Kingdom' },
          sameAs: Object.values(site.social || {}).filter(Boolean),
          contactPoint: { '@type': 'ContactPoint', telephone: site.phone, contactType: 'customer service', areaServed: 'GB', availableLanguage: 'English' },
        }}
      />
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark-blue font-helvetica leading-tight">
                {hero?.heading}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                {hero?.subheading}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {hero?.primaryButton && (
                  <Link
                    href={hero.primaryButton.href}
                    className="bg-brand-light-blue text-white border-2 border-transparent px-8 py-3 rounded-md font-medium hover:bg-brand-dark-blue transition-all text-center"
                  >
                    {hero.primaryButton.label}
                  </Link>
                )}
                {hero?.secondaryButton && (
                  <Link
                    href={hero.secondaryButton.href}
                    className="border-2 border-brand-light-blue text-brand-light-blue px-8 py-3 rounded-md font-medium hover:bg-brand-light-blue hover:text-white transition-all text-center"
                  >
                    {hero.secondaryButton.label}
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                {imageUrl(hero?.image) && <Image
                  src={imageUrl(hero?.image)!}
                  alt={hero?.image?.alt || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />}
              </div>
              <svg 
                className="absolute -left-32 lg:-left-64 top-0 w-[600px] h-full -z-10" 
                viewBox="0 0 600 500" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path 
                  d="M 0 0 Q 150 250 0 500 L 600 500 L 600 0 Z" 
                  fill="#3f59a9" 
                  opacity="0.15"
                />
                <path 
                  d="M 50 0 Q 200 250 50 500 L 650 500 L 650 0 Z" 
                  fill="#157ec3" 
                  opacity="0.1"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {!!home?.statsSection?.stats?.length && <AnimatedStats heading={home.statsSection.heading} items={home.statsSection.stats} />}

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-dark-blue font-helvetica">{home?.whySection?.heading}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(home?.whySection?.items || []).map((item, i) => {
              const dark = i % 2 === 1;
              return (
                <div key={item._key || i} className={`bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 ${dark ? 'border-brand-dark-blue' : 'border-brand-light-blue'}`}>
                  <div className={`w-16 h-16 ${dark ? 'bg-brand-dark-blue/10' : 'bg-brand-light-blue/10'} rounded-full flex items-center justify-center mb-6`}>
                    <CmsIcon name={item.icon} className={`w-8 h-8 ${dark ? 'text-brand-dark-blue' : 'text-brand-light-blue'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
          <svg viewBox="0 0 200 500" fill="none" className="w-full h-full">
            <path d="M 200 0 Q 100 125 200 250 Q 100 375 200 500 L 0 500 L 0 0 Z" fill="#3f59a9"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-dark-blue font-helvetica">{home?.servicesSection?.heading}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(home?.servicesSection?.cards || []).map((card, i) => (
              <Link key={card._key || i} href={card.href || '#'} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-l-4 border-brand-light-blue group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  <CmsIcon name={card.icon} className="w-12 h-12 text-brand-light-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!!home?.clientsSection?.logos?.length && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-brand-dark-blue font-helvetica">{home.clientsSection.heading}</h2>
            {home.clientsSection.text && <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">{home.clientsSection.text}</p>}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {home.clientsSection.logos.map((logo, i, all) => (
                  <div
                    key={logo._key || i}
                    className={`p-8 flex items-center justify-center border-gray-200 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'border-r' : 'md:border-r'} ${i === all.length - 1 ? 'md:border-r-0' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''}`}
                  >
                    <div className="relative w-40 h-20">
                      {imageUrl(logo, 400) && <Image src={imageUrl(logo, 400)!} alt={logo.alt || ''} fill sizes="160px" className="object-contain" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-64">
          <svg viewBox="0 0 1200 200" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M 0 100 Q 300 50 600 100 Q 900 150 1200 100 L 1200 200 L 0 200 Z" fill="#3f59a9" opacity="0.05"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-dark-blue font-helvetica">{home?.audiencesSection?.heading}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(home?.audiencesSection?.cards || []).map((card, i) => (
              <Link key={card._key || i} href={card.href || '#'} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-all border-t-4 border-brand-light-blue group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  <CmsIcon name={card.icon} className="w-12 h-12 text-brand-light-blue" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-brand-dark-blue font-helvetica">{home?.locationsSection?.heading}</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">{home?.locationsSection?.text}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(home?.locationsSection?.locations || [])
              .filter((location) => location.slug)
              .map((location) => (
                <Link
                  key={location._key || location.slug}
                  href={`/our-network/${location.slug}`}
                  className="text-center p-3 rounded-lg border border-gray-200 hover:border-brand-light-blue hover:shadow-md transition-all text-sm font-medium text-brand-dark-blue hover:text-brand-light-blue"
                >
                  {location.label || location.name}
                </Link>
              ))}
          </div>
          {home?.locationsSection?.allLink && (
            <div className="text-center mt-8">
              <Link href={home.locationsSection.allLink.href} className="text-brand-light-blue font-medium hover:underline">
                {home.locationsSection.allLink.label}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-helvetica">{home?.franchiseSection?.heading}</h2>
            <p className="text-lg md:text-xl mb-8 opacity-95 leading-relaxed">{home?.franchiseSection?.text}</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {(home?.franchiseSection?.stats || []).map((s, i) => (
                <div key={s._key || i} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                  <div className="text-4xl font-bold mb-2 font-helvetica">{s.value}</div>
                  <div className="text-sm opacity-90">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/20 pt-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-helvetica">{home?.cta?.heading}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">{home?.cta?.text}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {home?.cta?.primaryButton && (
                <Link href={home.cta.primaryButton.href} className="bg-white text-brand-dark-blue border-2 border-transparent px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-all text-lg">
                  {home.cta.primaryButton.label}
                </Link>
              )}
              {home?.cta?.secondaryButton && (
                <Link
                  href={home.cta.secondaryButton.href}
                  className="border-2 border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-brand-dark-blue transition-all text-lg"
                >
                  {home.cta.secondaryButton.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
