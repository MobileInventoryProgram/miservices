import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { articleIdFromSlug, articleSlug } from '@/lib/help/articles';
import { helpArticleFields, readHelpInput } from '@/lib/help/input';
import { newKey } from '@/lib/documents/standard';
import { sanityWriteClient } from '@/lib/sanity';

/** POST — Add a Help Centre answer (goes to the end of its topic). Returns its slug. */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const result = readHelpInput(await request.json().catch(() => ({})));
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

    const lastOrder = await sanityWriteClient.fetch<number | null>(`math::max(*[_type == "helpArticle" && topic == $topic].order)`, {
      topic: result.input.topic,
    });
    const id = articleIdFromSlug(newKey());
    await sanityWriteClient.create({ _id: id, _type: 'helpArticle', ...helpArticleFields(result.input), order: (lastOrder || 0) + 1 });
    return NextResponse.json({ slug: articleSlug(id) }, { status: 201 });
  } catch (error) {
    console.error('Error creating help answer:', error);
    return NextResponse.json({ error: 'Failed to save the answer' }, { status: 500 });
  }
}
