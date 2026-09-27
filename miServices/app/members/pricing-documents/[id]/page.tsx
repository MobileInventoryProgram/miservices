import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import PageHeader from '@/components/members/PageHeader';
import { authOptions } from '@/lib/auth-options';
import FlyerSheets from '@/components/pricing/flyer/FlyerSheets';
import { getFlyerImageInfo } from '@/lib/flyer/assets';
import { buildFlyerData, type FlyerLayout } from '@/lib/flyer/data';
import { canManageShareLink, getPriceListForSession } from '@/lib/pricing-access';
import { getFlyerSettings } from '@/lib/sanity';
import LeafletActions from '../LeafletActions';

export const metadata: Metadata = {
  title: 'Preview | Pricing Documents | Members Area | miServices',
};

const LAYOUTS: { value: FlyerLayout; label: string }[] = [
  { value: 'double', label: 'Double-sided' },
  { value: 'single', label: 'Single-sided' },
];

export default async function PricingDocumentPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ layout?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const { id } = await params;
  const { layout: layoutParam } = await searchParams;
  const layout: FlyerLayout = layoutParam === 'single' ? 'single' : 'double';

  const [priceList, settings] = await Promise.all([getPriceListForSession(session, id), getFlyerSettings()]);

  if (!priceList) {
    notFound();
  }

  const canTurnOffLink = await canManageShareLink(session, priceList);

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader width="6xl"
        title={priceList.title}
        intro={<span className="text-sm">A5 flyer · 148 × 210mm</span>}
        breadcrumbs={[{ label: 'Pricing leaflets', href: '/members/pricing-documents' }, { label: priceList.title }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="inline-flex self-start rounded-md border border-gray-200 p-0.5 text-xs font-medium" role="group" aria-label="Flyer sides">
            {LAYOUTS.map((option) => (
              <Link
                key={option.value}
                href={option.value === 'single' ? '?layout=single' : '?'}
                aria-current={layout === option.value ? 'page' : undefined}
                className={`px-3 py-1.5 rounded transition-colors ${
                  layout === option.value ? 'bg-brand-dark-blue text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <LeafletActions
              key={layout}
              listId={priceList._id}
              shareToken={priceList.shareEnabled ? priceList.shareToken || null : null}
              canTurnOffLink={canTurnOffLink}
              showPreview={false}
              layout={layout}
              showDigital
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Print-ready PDFs include 3mm bleed with trim and bleed boxes set — send them straight to the printer.
          Digital PDFs are trimmed to A5 for emailing.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <FlyerSheets data={buildFlyerData(priceList, settings)} layout={layout} images={getFlyerImageInfo()} />
      </div>
    </div>
  );
}
