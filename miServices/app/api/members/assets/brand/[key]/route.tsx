import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession } from '@/lib/sanity';
import { BRAND_ASSETS, renderBrandAsset } from '@/lib/social/brand-assets';
import { brandFonts, slugify, type BrandTheme } from '@/lib/social/brand';

export const runtime = 'nodejs';

/**
 * GET — A generated brand asset as PNG.
 * Query: ?theme=light|navy&personal=1&download=1
 */
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const { key } = await params;
  const spec = BRAND_ASSETS.find((asset) => asset.key === key);
  if (!spec) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const theme: BrandTheme = query.get('theme') === 'navy' ? 'navy' : 'light';

  let personal = null;
  if (query.get('personal') === '1') {
    const franchisee = await getFranchiseeForSession(session);
    if (franchisee?.territory && franchisee.territory !== 'Head Office') {
      personal = { territory: franchisee.territory, phone: franchisee.owners?.find((o) => o.phone)?.phone };
    }
  }

  const image = new ImageResponse(renderBrandAsset(spec, theme, personal), {
    width: spec.width,
    height: spec.height,
    fonts: brandFonts(),
  });

  const headers = new Headers(image.headers);
  headers.set('Cache-Control', 'private, max-age=300');
  if (query.get('download') === '1') {
    const name = ['miservices', personal ? slugify(personal.territory) : '', spec.key, theme].filter(Boolean).join('-');
    headers.set('Content-Disposition', `attachment; filename="${name}.png"`);
  }
  return new Response(image.body, { status: 200, headers });
}
