import { buildFlyerData, type FlyerLayout } from '@/lib/flyer/data';
import { renderFlyerPdf, type FlyerVariant } from '@/lib/flyer/pdf';
import { leafletFilename } from '@/lib/pricing';
import { getFlyerSettings, type SanityPriceList } from '@/lib/sanity';

export interface FlyerOptions {
  layout: FlyerLayout;
  variant: FlyerVariant;
}

/** Read ?layout=double|single&variant=print|digital (defaults: double, print) */
export function flyerOptionsFromUrl(url: string): FlyerOptions {
  const params = new URL(url).searchParams;
  return {
    layout: params.get('layout') === 'single' ? 'single' : 'double',
    variant: params.get('variant') === 'digital' ? 'digital' : 'print',
  };
}

/** PDF download response for a price list's A5 flyer. */
export async function priceListPdfResponse(
  priceList: SanityPriceList,
  options: FlyerOptions
): Promise<Response> {
  const data = buildFlyerData(priceList, await getFlyerSettings());
  const pdf = await renderFlyerPdf(data, options);
  const filename = leafletFilename(priceList.title).replace(
    /\.pdf$/,
    `-a5-${options.layout}-${options.variant}.pdf`
  );

  return new Response(pdf as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
