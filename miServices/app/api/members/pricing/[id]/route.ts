import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sanityWriteClient } from '@/lib/sanity';
import { parsePriceListInput } from '@/lib/pricing-validate';


/**
 * Resolve the franchisee ID from the authenticated session.
 */
async function resolveFranchiseeId(session: {
  user: { franchiseeId?: string | null; territory?: string | null };
}): Promise<string | null> {
  if (session.user.franchiseeId) {
    const doc = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == "franchisee" && _id == $id && isActive == true][0] { _id }`,
      { id: session.user.franchiseeId }
    );
    if (doc) return doc._id;
  }

  if (session.user.territory) {
    const doc = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == "franchisee" && territory == $territory && isActive == true][0] { _id }`,
      { territory: session.user.territory }
    );
    if (doc) return doc._id;
  }

  return null;
}

/**
 * Verify the price list is owned by the given franchisee.
 */
async function verifyOwnership(
  listId: string,
  franchiseeId: string
): Promise<boolean> {
  const doc = await sanityWriteClient.fetch<{ ownerRef: string } | null>(
    `*[_type == "priceList" && _id == $listId][0] { "ownerRef": owner._ref }`,
    { listId }
  );
  return doc?.ownerRef === franchiseeId;
}

/**
 * PUT — Update an owned price list.
 *
 * Body: { title, serviceRows, flatRates, additionalRoomRates, cancellationFee }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const franchiseeId = await resolveFranchiseeId(session);
    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'No franchisee linked to your account' },
        { status: 403 }
      );
    }

    const { id: listId } = await params;

    if (!(await verifyOwnership(listId, franchiseeId))) {
      return NextResponse.json(
        { error: 'Price list not found or not owned by you' },
        { status: 403 }
      );
    }

    const { data, error } = parsePriceListInput(await request.json());
    if (!data) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await sanityWriteClient
      .patch(listId)
      .set(data)
      .commit();

    return NextResponse.json({ message: 'Price list updated successfully' });
  } catch (error) {
    console.error('Update price list error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * DELETE — Delete an owned price list.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const franchiseeId = await resolveFranchiseeId(session);
    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'No franchisee linked to your account' },
        { status: 403 }
      );
    }

    const { id: listId } = await params;

    if (!(await verifyOwnership(listId, franchiseeId))) {
      return NextResponse.json(
        { error: 'Price list not found or not owned by you' },
        { status: 403 }
      );
    }

    await sanityWriteClient.delete(listId);

    return NextResponse.json({ message: 'Price list deleted successfully' });
  } catch (error) {
    console.error('Delete price list error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
