import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { draftId, getEditableById, isValidDocId } from '@/lib/documents/admin';
import { parseDocumentInput } from '@/lib/documents/validate';
import { sanityWriteClient } from '@/lib/sanity';

type Params = { params: Promise<{ id: string }> };

/**
 * PUT — Save the admin's changes as a draft. Members keep seeing the
 * published version until it's published. `draftRev` guards against
 * overwriting a draft someone else saved in the meantime.
 */
export async function PUT(request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isValidDocId(id)) return NextResponse.json({ error: 'Invalid document' }, { status: 400 });

  try {
    const body = await request.json();
    const { data, error } = parseDocumentInput(body);
    if (!data) return NextResponse.json({ error }, { status: 400 });

    const { published, draft } = await getEditableById(id);
    const base = draft || published;
    if (!base || base.category !== 'documents') return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (draft && body.draftRev && draft._rev !== body.draftRev) {
      return NextResponse.json({ error: 'Someone else has changed this draft since you opened it. Reload the page to see their changes.' }, { status: 409 });
    }

    // Keep everything not edited here (slug, targeting, files) from the current version
    const current = await sanityWriteClient.getDocument(base._id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _rev, _createdAt, _updatedAt, ...rest } = current || {};
    const saved = await sanityWriteClient.createOrReplace({ ...rest, ...data, _id: draftId(id), _type: 'memberDocument' });

    return NextResponse.json({ success: true, draftRev: saved._rev, updatedAt: saved._updatedAt });
  } catch (error) {
    console.error('Error saving document draft:', error);
    return NextResponse.json({ error: 'Failed to save the draft' }, { status: 500 });
  }
}

/** DELETE — Throw away the draft, keeping the published document */
export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!isValidDocId(id)) return NextResponse.json({ error: 'Invalid document' }, { status: 400 });

  const { published, draft } = await getEditableById(id);
  if (!draft) return NextResponse.json({ error: 'There is no draft to discard.' }, { status: 404 });
  if (!published) return NextResponse.json({ error: 'This document has never been published — delete it instead.' }, { status: 400 });

  await sanityWriteClient.delete(draftId(id));
  return NextResponse.json({ success: true });
}
