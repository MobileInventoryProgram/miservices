import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { articleIdFromSlug } from '@/lib/help/articles';
import { helpArticleFields, readHelpInput } from '@/lib/help/input';
import { sanityWriteClient } from '@/lib/sanity';

async function exists(id: string) {
  return sanityWriteClient.fetch<boolean>(`defined(*[_type == "helpArticle" && _id == $id][0]._id)`, { id });
}

/** PATCH — Change a Help Centre answer (params.id is its slug) */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const id = articleIdFromSlug(params.id);
    if (!(await exists(id))) return NextResponse.json({ error: 'Answer not found.' }, { status: 404 });
    const result = readHelpInput(await request.json().catch(() => ({})));
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

    await sanityWriteClient.patch(id).set(helpArticleFields(result.input)).commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating help answer:', error);
    return NextResponse.json({ error: 'Failed to save the answer' }, { status: 500 });
  }
}

/** DELETE — Remove a Help Centre answer */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const id = articleIdFromSlug(params.id);
    if (!(await exists(id))) return NextResponse.json({ error: 'Answer not found.' }, { status: 404 });
    await sanityWriteClient.transaction().delete(id).delete(`drafts.${id}`).commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting help answer:', error);
    return NextResponse.json({ error: 'Failed to delete the answer' }, { status: 500 });
  }
}
