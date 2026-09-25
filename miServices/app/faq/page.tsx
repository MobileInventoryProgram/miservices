import { Metadata } from 'next';
import Link from 'next/link';
import FaqSection from '@/components/faq/FaqSection';
import Button from '@/components/ui/Button';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsCta, CmsFaq, CmsHero, CmsSeo } from '@/lib/cms/types';

interface FaqPageDoc {
  hero?: CmsHero;
  categories?: { _key?: string; title?: string; faqs?: CmsFaq[] }[];
  cta?: CmsCta;
  seo?: CmsSeo;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<FaqPageDoc>('faqPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/faq' });
}

export default async function FAQPage() {
  const doc = await getPageDoc<FaqPageDoc>('faqPage');
  const categories = doc?.categories || [];
  const allFaqs = categories.flatMap((c) => c.faqs || []);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-helvetica">{doc?.hero?.heading}</h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">{doc?.hero?.subheading}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category, i) => (
            <FaqSection key={category._key || i} title={category.title || ''} faqs={category.faqs || []} />
          ))}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-4 font-helvetica">{doc?.cta?.heading}</h2>
          <p className="text-xl text-gray-700 mb-8">{doc?.cta?.text}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {doc?.cta?.primaryButton && (
              <Link href={doc.cta.primaryButton.href}>
                <Button variant="primary" className="w-full sm:w-auto">
                  {doc.cta.primaryButton.label}
                </Button>
              </Link>
            )}
            {doc?.cta?.secondaryButton && (
              <Link href={doc.cta.secondaryButton.href}>
                <Button variant="outline" className="w-full sm:w-auto">
                  {doc.cta.secondaryButton.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
