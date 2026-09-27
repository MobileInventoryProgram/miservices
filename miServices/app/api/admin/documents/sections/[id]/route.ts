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
