import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { newKey } from '@/lib/documents/standard';
import { slugify } from '@/lib/documents/validate';
import { getDocumentSection, sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Start a new document as a draft (members can't see it until it's
 * published). Returns its slug for the editor.
 */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 160) : '';
    const subcategory = String(body.subcategory || '');
    if (!title) return NextResponse.json({ error: 'Please give the document a title.' }, { status: 400 });
    const section = await getDocumentSection(subcategory);
    if (!section) return NextResponse.json({ error: 'Unknown section.' }, { status: 400 });

    // A slug no other document (or draft) uses
    const base = slugify(title);
    const taken = new Set(
      await sanityWriteClient.fetch<string[]>(`*[_type == "memberDocument" && slug.current match $prefix].slug.current`, { prefix: `${base}*` })
    );
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const nextOrder = await sanityWriteClient.fetch<number | null>(
      `math::max(*[_type == "memberDocument" && category == "documents" && coalesce(section->slug.current, subcategory) == $subcategory].order)`,
      { subcategory }
    );

    const id = `memberDoc-${newKey()}`;
    await sanityWriteClient.create({
      _id: `drafts.${id}`,
      _type: 'memberDocument',
      title,
      slug: { _type: 'slug', current: slug },
      category: 'documents',
      subcategory,
      section: { _type: 'reference', _ref: section._id },
      description: '',
      numberHeadings: false,
      isPublished: true,
      order: (nextOrder || 0) + 1,
      body: [{ _type: 'block', _key: newKey(), style: 'h2', markDefs: [], children: [{ _type: 'span', _key: newKey(), text: 'Introduction', marks: [] }] }],
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create the document' }, { status: 500 });
  }
}
