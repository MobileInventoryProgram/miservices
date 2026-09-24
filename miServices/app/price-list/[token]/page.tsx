import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import FlyerSheets from '@/components/pricing/flyer/FlyerSheets';
import { getFlyerImageInfo } from '@/lib/flyer/assets';
import { buildFlyerData, type FlyerLayout } from '@/lib/flyer/data';
import { getFlyerSettings, getPriceListByShareToken } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

interface SharedPriceListPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ layout?: string }>;
}

export async function generateMetadata({ params }: SharedPriceListPageProps): Promise<Metadata> {
  const { token } = await params;
  const priceList = await getPriceListByShareToken(token);
  return {
    title: priceList ? `${priceList.title} | miServices` : 'Price List | miServices',
    robots: { index: false, follow: false },
  };
}

/**
 * Public, no-login view of a price list flyer shared from Pricing Documents.
 */
export default async function SharedPriceListPage({ params, searchParams }: SharedPriceListPageProps) {
  const { token } = await params;
  const { layout: layoutParam } = await searchParams;
  const layout: FlyerLayout = layoutParam === 'single' ? 'single' : 'double';

  const [priceList, settings] = await Promise.all([getPriceListByShareToken(token), getFlyerSettings()]);

  if (!priceList) {
    notFound();
  }

  const pdf = (variant: 'print' | 'digital') => `/price-list/${token}/pdf?layout=${layout}&variant=${variant}`;

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-10 px-4">
      <div className="mx-auto mb-5 flex max-w-[1140px] flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-brand-dark-blue font-helvetica">{priceList.title}</h1>
        <div className="flex flex-wrap gap-2">
          <a
            href={pdf('digital')}
            className="inline-flex items-center gap-2 rounded-md bg-brand-dark-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-light-blue transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Download PDF
          </a>
          <a
            href={pdf('print')}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-dark-blue border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiPrinter className="w-4 h-4" />
            Print-ready PDF
          </a>
        </div>
      </div>
      <FlyerSheets data={buildFlyerData(priceList, settings)} layout={layout} images={getFlyerImageInfo()} />
    </div>
  );
}
