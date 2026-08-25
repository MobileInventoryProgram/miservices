import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sanityWriteClient } from '@/lib/sanity';

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
 * PATCH — Set a price list as the franchisee's default.
 *
 * Uses a transaction to ensure only one default at a time.
 */
export async function PATCH(
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

    // Verify the target list is owned by this franchisee
    const targetDoc = await sanityWriteClient.fetch<{ ownerRef: string } | null>(
      `*[_type == "priceList" && _id == $listId][0] { "ownerRef": owner._ref }`,
      { listId }
    );

    if (!targetDoc || targetDoc.ownerRef !== franchiseeId) {
      return NextResponse.json(
        { error: 'Price list not found or not owned by you' },
        { status: 403 }
      );
    }

    // Find all other owned lists that are currently default
    const currentDefaults = await sanityWriteClient.fetch<string[]>(
      `*[_type == "priceList" && owner._ref == $franchiseeId && isDefault == true && _id != $listId]._id`,
      { franchiseeId, listId }
    );

    // Transaction: unset old defaults, set new default
    const transaction = sanityWriteClient.transaction();

    for (const oldId of currentDefaults) {
      transaction.patch(oldId, { set: { isDefault: false } });
    }

    transaction.patch(listId, { set: { isDefault: true } });

    await transaction.commit();

    return NextResponse.json({ message: 'Default price list updated' });
  } catch (error) {
    console.error('Set default price list error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
