import { Metadata } from 'next';
import Link from 'next/link';
import { getServices } from '@/lib/sanity';
import { CtaBand, GradientHero } from '@/components/cms/Sections';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsCta, CmsHero, CmsSeo } from '@/lib/cms/types';

type ServicesPageDoc = { hero?: CmsHero; cta?: CmsCta; seo?: CmsSeo };

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<ServicesPageDoc>('servicesPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/services' });
}

export const revalidate = 60;

/** All services from the CMS, with the page's header and call to action */
export default async function ServicesPage() {
  const [doc, services] = await Promise.all([getPageDoc<ServicesPageDoc>('servicesPage'), getServices()]);

  return (
    <div className="min-h-screen">
      <GradientHero heading={doc?.hero?.heading} text={doc?.hero?.subheading} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group"
              >
                <h2 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">{service.title}</h2>
                <p className="text-gray-600 mb-4">{service.heroDescription}</p>
                <span className="text-brand-light-blue font-bold group-hover:underline">Learn more &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand cta={doc?.cta} />
    </div>
  );
}
