import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';
import { CtaBand, GradientHero } from '@/components/cms/Sections';
import { CmsIcon } from '@/lib/cms/icons';
import type { CmsCta, CmsFeature, CmsHero, CmsSeo, CmsStep } from '@/lib/cms/types';

export interface AudiencePageDoc {
  title?: string;
  path?: string;
  hero?: CmsHero;
  intro?: { heading?: string; text?: string; points?: string[] };
  servicesHeading?: string;
  services?: CmsFeature[];
  benefitsHeading?: string;
  benefits?: CmsFeature[];
  processHeading?: string;
  processSteps?: CmsStep[];
  cta?: CmsCta;
  seo?: CmsSeo;
}

/** Landlords / Lettings Agents / Property Managers: one layout, content from the CMS */
export default function AudiencePage({ doc }: { doc: AudiencePageDoc | null }) {
  return (
    <div className="min-h-screen">
      <GradientHero heading={doc?.hero?.heading} text={doc?.hero?.subheading} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark-blue font-helvetica">{doc?.intro?.heading}</h2>
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed mb-8">{doc?.intro?.text}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(doc?.intro?.points || []).map((item, idx) => (
              <div key={idx} className="flex items-start bg-gray-50 p-4 rounded-lg">
                <FiCheckCircle className="text-brand-light-blue mt-1 mr-3 flex-shrink-0 w-6 h-6" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!!doc?.services?.length && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{doc.servicesHeading}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doc.services.map((service, i) => (
                <Link key={service._key || i} href={service.href || '#'} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-t-4 border-brand-light-blue group">
                  <h3 className="text-2xl font-bold mb-3 text-brand-dark-blue font-helvetica group-hover:text-brand-light-blue transition-colors">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-brand-light-blue font-medium">Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!doc?.benefits?.length && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{doc.benefitsHeading}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {doc.benefits.map((benefit, i) => (
                <div key={benefit._key || i} className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-all text-center">
                  <div className="mb-4 flex justify-center">
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

      {!!doc?.processSteps?.length && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand-dark-blue font-helvetica text-center">{doc.processHeading}</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {doc.processSteps.map((s, i) => (
                <div key={s._key || i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-dark-blue text-white font-bold text-xl mb-4">{i + 1}</div>
                  <h4 className="font-bold text-lg mb-2 font-helvetica">{s.title}</h4>
                  <p className="text-gray-600">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand cta={doc?.cta} />
    </div>
  );
}
