import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { draftId, getEditableById, isValidDocId } from '@/lib/documents/admin';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Publish the draft: it replaces the live document and the draft is
 * removed, in one transaction. `publishedRev` (the live version the admin
 * started from) stops a newer live version being overwritten.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isValidDocId(id)) return NextResponse.json({ error: 'Invalid document' }, { status: 400 });

  try {
    const body = await request.json().catch(() => ({}));
    const { published, draft } = await getEditableById(id);
    if (!draft) return NextResponse.json({ error: 'There are no changes to publish.' }, { status: 400 });
    if (published && body.publishedRev && published._rev !== body.publishedRev) {
      return NextResponse.json(
        { error: 'The live document was changed by someone else (for example in Studio) after you started editing. Reload the page, check their changes, then publish again.' },
        { status: 409 }
      );
    }

    const full = await sanityWriteClient.getDocument(draftId(id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, _createdAt, _updatedAt, ...content } = full || {};
    const doc = { ...content, _id: id, _type: 'memberDocument', publishedAt: new Date().toISOString() };

    const transaction = sanityWriteClient.transaction();
    if (published) transaction.createOrReplace(doc);
    else transaction.create(doc);
    transaction.delete(draftId(id));
    const result = await transaction.commit({ returnDocuments: false });

    return NextResponse.json({ success: true, publishedRev: result.transactionId });
  } catch (error) {
    console.error('Error publishing document:', error);
    return NextResponse.json({ error: 'Failed to publish the document' }, { status: 500 });
  }
}
