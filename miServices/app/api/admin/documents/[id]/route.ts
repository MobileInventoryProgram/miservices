import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { draftId, isValidDocId } from '@/lib/documents/admin';
import { sanityWriteClient } from '@/lib/sanity';

/** DELETE — Remove a document and any draft of it */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isValidDocId(id)) return NextResponse.json({ error: 'Invalid document' }, { status: 400 });

  try {
    const existing = await sanityWriteClient.fetch<string[]>(`*[_type == "memberDocument" && _id in [$id, $draft]]._id`, { id, draft: draftId(id) });
    if (!existing.length) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    const transaction = sanityWriteClient.transaction();
    existing.forEach((docId) => transaction.delete(docId));
    await transaction.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete the document' }, { status: 500 });
  }
}
