import { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, getPageDoc } from '@/lib/cms/site';
import type { CmsCta, CmsHero, CmsLink, CmsSeo } from '@/lib/cms/types';

interface CareersPageDoc {
  hero?: CmsHero;
  why?: { heading?: string; text?: string; cards?: { _key?: string; heading?: string; text?: string; button?: CmsLink }[] };
  cta?: CmsCta;
  seo?: CmsSeo;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageDoc<CareersPageDoc>('careersPage');
  return buildMetadata(doc?.seo, { title: doc?.hero?.heading, description: doc?.hero?.subheading, path: '/careers' });
}

export default async function Careers() {
  const doc = await getPageDoc<CareersPageDoc>('careersPage');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">{doc?.hero?.heading}</h1>
          <p className="text-xl">{doc?.hero?.subheading}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-3xl font-bold mb-6 text-brand-dark-blue font-helvetica">{doc?.why?.heading}</h2>
          <p className="mb-6 text-lg">{doc?.why?.text}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {(doc?.why?.cards || []).map((card, i) => (
              <div key={card._key || i} className="border-l-4 border-brand-light-blue pl-4">
                <h3 className="font-bold text-xl mb-2 font-helvetica">{card.heading}</h3>
                <p className="text-gray-600 mb-3">{card.text}</p>
                {card.button && (
                  <Link href={card.button.href} className="text-brand-light-blue hover:underline">
                    {card.button.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-brand-light-blue text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4 font-helvetica">{doc?.cta?.heading}</h2>
          <p className="text-xl mb-6">{doc?.cta?.text}</p>
          {doc?.cta?.primaryButton && (
            <Link href={doc.cta.primaryButton.href} className="bg-white text-brand-light-blue border-2 border-transparent px-8 py-3 rounded-md font-medium hover:bg-gray-100 inline-block">
              {doc.cta.primaryButton.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
