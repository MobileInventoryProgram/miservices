import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServiceBySlug, getAllServiceSlugs, urlFor } from '@/lib/sanity';
import JsonLd from '@/components/JsonLd';
import { FAQItem, ProcessStep } from '@/components/tenancy/TenancyPageComponents';
import { CtaBand, GradientHero, RichText } from '@/components/cms/Sections';
import { CmsIcon } from '@/lib/cms/icons';
import { BASE_URL, buildMetadata, getSiteSettings } from '@/lib/cms/site';

/** A service page: every section comes from the service's CMS document */
interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  if (!service) return { title: 'Service Not Found' };
  return buildMetadata(service.seo, { title: service.title, description: service.heroDescription, path: `/services/${params.slug}` });
}

export const revalidate = 60;

export default async function ServicePage({ params }: Props) {
  const [service, site] = await Promise.all([getServiceBySlug(params.slug), getSiteSettings()]);
  if (!service) notFound();

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.heroDescription,
    provider: { '@type': 'Organization', name: site.siteName, url: BASE_URL },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    serviceType: service.title,
    url: `${BASE_URL}/services/${params.slug}`,
  };
  const faqs = service.faqs || [];
  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
      }
    : null;

  return (
    <div className="min-h-screen">
      <JsonLd data={serviceSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <GradientHero heading={service.title} text={service.heroDescription} />

      {/* Introduction */}
      {service.bodyHeading && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">{service.bodyHeading}</h2>
            {service.bodyIntro && <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-8">{service.bodyIntro}</p>}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {service.bodySubheading && <h3 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">{service.bodySubheading}</h3>}
                <RichText value={service.bodyText} />
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

      {/* Features */}
      {!!service.features?.length && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{service.featuresHeading}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features.map((feature, idx) => (
                <div key={feature._key || idx} className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-brand-light-blue mt-1 mr-3 flex-shrink-0">
                    <CmsIcon name={feature.icon} className="w-6 h-6" />
                  </div>
                  <span className="text-gray-700">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {!!service.processSteps?.length && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{service.processHeading}</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {service.processSteps.map((s, idx) => (
                <ProcessStep key={s._key || idx} number={String(idx + 1)} title={s.title} description={s.description || ''} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {!!service.benefits?.length && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{service.benefitsHeading}</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {service.benefits.map((benefit, idx) => (
                <div key={benefit._key || idx} className="bg-white p-6 rounded-lg hover:shadow-lg transition-all">
                  <div className="mb-4">
                    <CmsIcon name={benefit.icon} className="w-12 h-12 text-brand-light-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-brand-dark-blue font-helvetica">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {!!faqs.length && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-brand-dark-blue font-helvetica text-center">{service.faqHeading}</h2>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <FAQItem key={faq._key || idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who uses this service */}
      {!!service.whoUsesThis?.length && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{service.whoUsesHeading}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {service.whoUsesThis.map((user, idx) => (
                <Link key={user._key || idx} href={user.href || '#'} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
                  <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">{user.title}</h3>
                  <p className="text-gray-600">{user.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {!!service.relatedServices?.length && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{service.relatedHeading}</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {service.relatedServices.map((related, idx) => (
                <Link
                  key={related._key || idx}
                  href={related.href || '#'}
                  className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group"
                >
                  <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">{related.title}</h3>
                  <p className="text-gray-600 mb-4">{related.description}</p>
                  <span className="text-brand-light-blue font-bold group-hover:underline">Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand cta={service.cta} />
    </div>
  );
}
