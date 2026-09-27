import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { readSectionInput } from '@/lib/documents/sections';
import { slugify } from '@/lib/documents/validate';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Add a Documents section. It's published straight away (empty
 * sections stay hidden from franchisees until they have a document) and goes
 * to the end of the list. Returns its slug.
 */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const result = readSectionInput(await request.json().catch(() => ({})));
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const { input } = result;

    // A web address no other section uses
    const base = slugify(input.title).slice(0, 60);
    const taken = new Set(await sanityWriteClient.fetch<string[]>(`*[_type == "documentSection"].slug.current`));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const lastOrder = await sanityWriteClient.fetch<number | null>(`math::max(*[_type == "documentSection" && !(_id in path("drafts.**"))].order)`);

    await sanityWriteClient.create({
      _id: `docSection-${slug}`,
      _type: 'documentSection',
      ...input,
      slug: { _type: 'slug', current: slug },
      order: (lastOrder || 0) + 1,
    });

    return NextResponse.json({ slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating document section:', error);
    return NextResponse.json({ error: 'Failed to create the section' }, { status: 500 });
  }
}
