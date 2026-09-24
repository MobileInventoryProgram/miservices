import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCopy } from 'react-icons/fi';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession, getVisiblePriceList, getPriceListById } from '@/lib/sanity';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ORDER,
  BEDROOM_LABELS,
  BEDROOM_ORDER,
  formatPrice,
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'View Price List | Franchise Login | miServices',
};

export default async function ViewPriceListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/members/login');
  }

  const { id } = await params;
  const isAdmin = session.user.role === 'admin';

  let priceList;
  let backHref: string;
  let backLabel: string;
  let showDuplicateButton = false;

  if (isAdmin) {
    // Admin can view any price list
    priceList = await getPriceListById(id);
    backHref = '/members/pricing/admin';
    backLabel = 'Back to All Pricing';
  } else {
    // Franchisee must have a franchisee association
    if (!session.user.franchiseeId && !session.user.territory) {
      redirect('/members');
    }

    const franchisee = await getFranchiseeForSession(session);

    if (!franchisee) {
      redirect('/members/pricing');
    }

    priceList = await getVisiblePriceList(id, franchisee._id);
    backHref = '/members/pricing';
    backLabel = 'Back to My Pricing';
    showDuplicateButton = true;
  }

  if (!priceList) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-dark-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold font-helvetica">
              {priceList.title}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-800 text-blue-200 rounded-full">
              Read-only
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Service Tables */}
        {SERVICE_TYPE_ORDER.map((serviceType) => {
          const rows = (priceList.serviceRows || []).filter(
            (r) => r.serviceType === serviceType
          );
          if (rows.length === 0) return null;

          const hasFurnished = rows.some((r) => r.furnishedPrice != null);

          return (
            <div key={serviceType} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 font-helvetica">
                  {SERVICE_TYPE_LABELS[serviceType]}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrooms</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Max Rooms</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Unfurnished</th>
                      {hasFurnished && (
                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Furnished</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {BEDROOM_ORDER.map((bed) => {
                      const row = rows.find((r) => r.bedrooms === bed);
                      if (!row) return null;
                      return (
                        <tr key={bed}>
                          <td className="px-3 py-2 text-sm text-gray-700">{BEDROOM_LABELS[bed]}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{row.maxRooms}</td>
                          <td className="px-3 py-2 text-sm text-gray-700 tabular-nums">{formatPrice(row.unfurnishedPrice)}</td>
                          {hasFurnished && (
                            <td className="px-3 py-2 text-sm text-gray-700 tabular-nums">
                              {row.furnishedPrice != null ? formatPrice(row.furnishedPrice) : '—'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Flat Rates & Additional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {priceList.flatRates?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 font-helvetica">Flat Rates</h3>
              </div>
              <div className="px-6 py-4 space-y-2">
                {priceList.flatRates.map((rate) => (
                  <div key={rate._key} className="flex justify-between text-sm">
                    <span className="text-gray-700">{rate.name}</span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(rate.price)}
                      {rate.unit && <span className="text-gray-500 ml-1">{rate.unit}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(priceList.additionalRoomRates || priceList.cancellationFee != null) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 font-helvetica">Additional Rates</h3>
              </div>
              <div className="px-6 py-4 space-y-2">
                {priceList.additionalRoomRates?.unfurnishedPerRoom != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Additional room (unfurnished)</span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(priceList.additionalRoomRates.unfurnishedPerRoom)}
                    </span>
                  </div>
                )}
                {priceList.additionalRoomRates?.furnishedPerRoom != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Additional room (furnished)</span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(priceList.additionalRoomRates.furnishedPerRoom)}
                    </span>
                  </div>
                )}
                {priceList.cancellationFee != null && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-700">Cancellation fee</span>
                    <span className="text-gray-900 font-medium">{formatPrice(priceList.cancellationFee)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showDuplicateButton && (
          <div className="flex items-center gap-3">
            <Link
              href={`/members/pricing/new?templateId=${priceList._id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-brand-light-blue rounded-md hover:bg-brand-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light-blue transition-colors font-helvetica"
            >
              <FiCopy className="w-4 h-4" />
              Duplicate This Template
            </Link>
          </div>
        )}

        <p className="text-xs text-gray-400">All prices exclude VAT at the prevailing rate.</p>
      </div>
    </div>
  );
}
