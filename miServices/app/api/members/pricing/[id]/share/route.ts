import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { canManageShareLink, getPriceListForSession } from '@/lib/pricing-access';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Turn on the public share link for a price list the member can view.
 * Reuses the existing token so links already sent out keep working.
 *
 * Returns: { shareToken }
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { id } = await params;
    const priceList = await getPriceListForSession(session, id);

    if (!priceList) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    // Read the token uncached so we never mint a second one for the same list
    const current = await sanityWriteClient.fetch<{ shareToken?: string } | null>(
      `*[_type == "priceList" && _id == $id][0] { shareToken }`,
      { id }
    );
    const shareToken = current?.shareToken || randomBytes(16).toString('base64url');

    await sanityWriteClient.patch(id).set({ shareEnabled: true, shareToken }).commit();

    return NextResponse.json({ shareToken });
  } catch (error) {
    console.error('Error enabling price list share link:', error);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}

/**
 * DELETE — Turn off the public share link. The token is removed, so any
 * link already sent out stops working; turning it back on creates a new one.
 * Franchisees can only do this for lists they own; admins for any list.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const { id } = await params;
    const priceList = await getPriceListForSession(session, id);

    if (!priceList) {
      return NextResponse.json({ error: 'Price list not found' }, { status: 404 });
    }

    if (!(await canManageShareLink(session, priceList))) {
      return NextResponse.json(
        { error: 'Only the owner can turn off this link' },
        { status: 403 }
      );
    }

    await sanityWriteClient
      .patch(id)
      .set({ shareEnabled: false })
      .unset(['shareToken'])
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling price list share link:', error);
    return NextResponse.json({ error: 'Failed to turn off share link' }, { status: 500 });
  }
}
