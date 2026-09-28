import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { readRequirementInput, requirementFields } from '@/lib/compliance/input';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * PATCH — Change a requirement ({ ...fields }), or { isActive: false } to
 * stop tracking it (its records are kept) and { isActive: true } to bring it back.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const exists = await sanityWriteClient.fetch<boolean>(`defined(*[_type == "complianceRequirement" && _id == $id][0]._id)`, { id: params.id });
    if (!exists) return NextResponse.json({ error: 'Requirement not found.' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (typeof body.isActive === 'boolean' && Object.keys(body).length === 1) {
      await sanityWriteClient.patch(params.id).set({ isActive: body.isActive }).commit();
      return NextResponse.json({ ok: true });
    }
    const result = readRequirementInput(body);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    await sanityWriteClient.patch(params.id).set(requirementFields(result.input)).commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Update requirement failed:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
