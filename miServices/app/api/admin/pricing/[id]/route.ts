import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { parsePriceListInput } from '@/lib/pricing-validate';
import { sanityWriteClient } from '@/lib/sanity';

type Params = { params: Promise<{ id: string }> };

/** Only Head Office standard lists (no owner) are edited here */
async function getStandardList(id: string) {
  return sanityWriteClient.fetch<{ _id: string; isDefault?: boolean } | null>(
    `*[_type == "priceList" && _id == $id && !defined(owner)][0] { _id, isDefault }`,
    { id }
  );
}

/**
 * PUT — Save a standard price list, including whether franchisees can use it
 * and whether it is the system default (only one list can be).
 */
export async function PUT(request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    if (!(await getStandardList(id))) {
      return NextResponse.json({ error: 'Standard price list not found' }, { status: 404 });
    }

    const body = await request.json();
    const { data, error } = parsePriceListInput(body);
    if (!data) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const isDefault = body.isDefault === true;
    const flyerNote = typeof body.flyerNote === 'string' ? body.flyerNote.trim().slice(0, 200) : '';

    const transaction = sanityWriteClient.transaction();
    if (isDefault) {
      const otherDefaults = await sanityWriteClient.fetch<string[]>(
        `*[_type == "priceList" && !defined(owner) && isDefault == true && _id != $id]._id`,
        { id }
      );
      otherDefaults.forEach((otherId) => transaction.patch(otherId, { set: { isDefault: false } }));
    }
    transaction.patch(id, (patch) => {
      const next = patch.set({ ...data, isDefault, availableToFranchisees: body.availableToFranchisees === true });
      return flyerNote ? next.set({ flyerNote }) : next.unset(['flyerNote']);
    });
    await transaction.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving standard price list:', error);
    return NextResponse.json({ error: 'Failed to save price list' }, { status: 500 });
  }
}

/**
 * DELETE — Remove a standard list. Franchise copies and sent quotes keep
 * their own prices, so they're unaffected.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const list = await getStandardList(id);
    if (!list) {
      return NextResponse.json({ error: 'Standard price list not found' }, { status: 404 });
    }
    if (list.isDefault) {
      return NextResponse.json({ error: 'Make another list the system default before deleting this one.' }, { status: 400 });
    }

    await sanityWriteClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting standard price list:', error);
    return NextResponse.json({ error: 'Failed to delete price list' }, { status: 500 });
  }
}
