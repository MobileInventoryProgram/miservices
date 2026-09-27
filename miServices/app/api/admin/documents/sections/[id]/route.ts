import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { readSectionInput } from '@/lib/documents/sections';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * PATCH — Rename a Documents section or change its description, icon or
 * colour. Its web address never changes, so links and documents keep working.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const result = readSectionInput(await request.json().catch(() => ({})));
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const { input } = result;

    const exists = await sanityWriteClient.fetch<boolean>(`defined(*[_type == "documentSection" && _id == $id][0]._id)`, { id: params.id });
    if (!exists) return NextResponse.json({ error: 'Section not found.' }, { status: 404 });

    await sanityWriteClient.patch(params.id).set(input).commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating document section:', error);
    return NextResponse.json({ error: 'Failed to save the section' }, { status: 500 });
  }
}

/**
 * DELETE — Remove an empty Documents section. Refused while any document
 * (published, draft or hidden) is still in it, so nothing is ever orphaned.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const section = await sanityWriteClient.fetch<{ slug: string } | null>(`*[_type == "documentSection" && _id == $id][0]{ "slug": slug.current }`, {
      id: params.id,
    });
    if (!section) return NextResponse.json({ error: 'Section not found.' }, { status: 404 });

    // Drafts count too; older documents may only name the section by slug
    const inUse = await sanityWriteClient.fetch<number>(
      `count(*[_type == "memberDocument" && (references($id) || (category == "documents" && subcategory == $slug))])`,
      { id: params.id, slug: section.slug }
    );
    if (inUse > 0) {
      return NextResponse.json(
        {
          error: `This section still has ${inUse} ${inUse === 1 ? 'document' : 'documents'} (including drafts and hidden ones). Move or delete them first.`,
        },
        { status: 409 }
      );
    }

    await sanityWriteClient.transaction().delete(params.id).delete(`drafts.${params.id}`).commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting document section:', error);
    return NextResponse.json({ error: 'Failed to delete the section' }, { status: 500 });
  }
}
