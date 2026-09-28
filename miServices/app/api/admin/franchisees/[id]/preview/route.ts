import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { requireAdmin } from '@/lib/admin-auth';
import { sanityWriteClient } from '@/lib/sanity';

/** GET — Head Office previews a franchise's public page, even while it's hidden */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const slug = await sanityWriteClient.fetch<string | null>(`*[_type == "franchisee" && _id == $id][0].slug.current`, { id: params.id });
  if (!slug) return NextResponse.json({ error: 'Franchise not found.' }, { status: 404 });

  draftMode().enable();
  return NextResponse.redirect(new URL(`/our-network/${slug}`, request.url));
}
