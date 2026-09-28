import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { HEAD_OFFICE_SLUG } from '@/lib/franchisees/admin';
import { readContract } from '@/lib/franchisees/contract';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * PATCH — Head Office saves a franchise's contract: dates, renewal notice and fee.
 * { clear: true } removes it.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const current = await sanityWriteClient.fetch<{ _id: string; slug?: string } | null>(`*[_type == "franchisee" && _id == $id][0] { _id, "slug": slug.current }`, {
      id: params.id,
    });
    if (!current) return NextResponse.json({ error: 'Franchise not found.' }, { status: 404 });
    if (current.slug === HEAD_OFFICE_SLUG) return NextResponse.json({ error: "Head Office doesn't have a franchise contract." }, { status: 400 });

    if (body.clear === true) {
      await sanityWriteClient.patch(current._id).unset(['contract']).commit();
      return NextResponse.json({ ok: true });
    }

    const result = readContract(body);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const contract = Object.fromEntries(Object.entries(result.contract).filter(([, v]) => v !== null && v !== undefined));
    await sanityWriteClient.patch(current._id).set({ contract }).commit();
    return NextResponse.json({ ok: true, contract });
  } catch (error) {
    console.error('Saving franchise contract failed:', error);
    return NextResponse.json({ error: 'Could not save the contract. Please try again.' }, { status: 500 });
  }
}
