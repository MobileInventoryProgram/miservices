import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession } from '@/lib/sanity';
import { brandFonts, slugify } from '@/lib/social/brand';
import { renderPost } from '@/lib/social/posts';
import { POST_SIZES, cleanPostFields, getPostTemplate, type PostSize, type PostTheme } from '@/lib/social/templates';

export const runtime = 'nodejs';

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

/**
 * POST — Render a social post to PNG.
 * Body: { template, theme, size, fields, photos: { key: dataUri }, download? }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const template = getPostTemplate(typeof body?.template === 'string' ? body.template : '');
  if (!body || !template) {
    return NextResponse.json({ error: 'Unknown template' }, { status: 400 });
  }

  const theme: PostTheme = body.theme === 'light' ? 'light' : 'navy';
  const size: PostSize = body.size === 'portrait' ? 'portrait' : 'square';
  const fields = cleanPostFields(template, (body.fields as Record<string, unknown>) || {});

  // Photos: only the template's photo fields, only image data URIs, size-capped
  const photos: Record<string, string> = {};
  const submitted = (body.photos as Record<string, unknown>) || {};
  for (const field of template.fields) {
    if (field.type !== 'photo') continue;
    const value = submitted[field.key];
    if (typeof value === 'string' && /^data:image\/(jpeg|png);base64,/.test(value) && value.length < MAX_PHOTO_BYTES * 1.4) {
      photos[field.key] = value;
    }
  }

  const franchisee = await getFranchiseeForSession(session);
  const territory = franchisee?.territory && franchisee.territory !== 'Head Office' ? franchisee.territory : null;

  const { width, height } = POST_SIZES[size];
  const image = new ImageResponse(
    renderPost({ template: template.key, theme, size, fields, photos, franchiseName: territory ? `miServices ${territory}` : 'miServices' }),
    { width, height, fonts: brandFonts() }
  );

  const headers = new Headers(image.headers);
  headers.set('Cache-Control', 'no-store');
  if (body.download) {
    headers.set('Content-Disposition', `attachment; filename="miservices-${slugify(template.name)}-${size}-${theme}.png"`);
  }
  return new Response(image.body, { status: 200, headers });
}
