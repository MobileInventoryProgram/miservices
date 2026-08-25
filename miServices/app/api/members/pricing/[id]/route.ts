import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sanityWriteClient } from '@/lib/sanity';

const VALID_SERVICE_TYPES = ['inventory', 'combined', 'checkout', 'midterm', 'checkin', 'virtualTourBundle', 'virtualTourFloorplan', 'floorplan'];
const VALID_BEDROOMS = ['studio_1', '2', '3', '4', '5', '6'];

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

    const body = await request.json();
    const { title, serviceRows, flatRates, additionalRoomRates, cancellationFee } = body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Validate serviceRows
    if (!Array.isArray(serviceRows)) {
      return NextResponse.json({ error: 'serviceRows must be an array' }, { status: 400 });
    }

    const sanitizedRows = [];
    for (let i = 0; i < serviceRows.length; i++) {
      const row = serviceRows[i];

      if (!VALID_SERVICE_TYPES.includes(row.serviceType)) {
        return NextResponse.json(
          { error: `Row ${i}: invalid serviceType "${row.serviceType}"` },
          { status: 400 }
        );
      }

      if (!VALID_BEDROOMS.includes(row.bedrooms)) {
        return NextResponse.json(
          { error: `Row ${i}: invalid bedrooms "${row.bedrooms}"` },
          { status: 400 }
        );
      }

      if (typeof row.unfurnishedPrice !== 'number' || !isFinite(row.unfurnishedPrice) || row.unfurnishedPrice < 0) {
        return NextResponse.json(
          { error: `Row ${i}: unfurnishedPrice must be a non-negative number` },
          { status: 400 }
        );
      }

      if (row.furnishedPrice != null && (typeof row.furnishedPrice !== 'number' || !isFinite(row.furnishedPrice) || row.furnishedPrice < 0)) {
        return NextResponse.json(
          { error: `Row ${i}: furnishedPrice must be a non-negative number` },
          { status: 400 }
        );
      }

      sanitizedRows.push({
        _type: 'object',
        _key: `${row.serviceType}-${row.bedrooms}`,
        serviceType: row.serviceType,
        bedrooms: row.bedrooms,
        maxRooms: typeof row.maxRooms === 'number' ? row.maxRooms : 0,
        unfurnishedPrice: row.unfurnishedPrice,
        ...(row.furnishedPrice != null ? { furnishedPrice: row.furnishedPrice } : {}),
      });
    }

    // Validate flatRates
    if (!Array.isArray(flatRates)) {
      return NextResponse.json({ error: 'flatRates must be an array' }, { status: 400 });
    }

    const sanitizedFlatRates = flatRates.map((rate: any, i: number) => {
      if (!rate.name || typeof rate.name !== 'string') {
        throw new Error(`flatRate ${i}: name is required`);
      }
      if (typeof rate.price !== 'number' || !isFinite(rate.price) || rate.price < 0) {
        throw new Error(`flatRate ${i}: price must be a non-negative number`);
      }
      return {
        _type: 'object',
        _key: rate._key || `flat-${i}`,
        name: rate.name,
        price: rate.price,
        unit: rate.unit || undefined,
      };
    });

    // Validate additionalRoomRates
    if (
      !additionalRoomRates ||
      typeof additionalRoomRates.unfurnishedPerRoom !== 'number' ||
      typeof additionalRoomRates.furnishedPerRoom !== 'number'
    ) {
      return NextResponse.json(
        { error: 'additionalRoomRates must include unfurnishedPerRoom and furnishedPerRoom' },
        { status: 400 }
      );
    }

    // Validate cancellationFee
    if (typeof cancellationFee !== 'number' || !isFinite(cancellationFee)) {
      return NextResponse.json(
        { error: 'cancellationFee must be a valid number' },
        { status: 400 }
      );
    }

    await sanityWriteClient
      .patch(listId)
      .set({
        title: title.trim(),
        serviceRows: sanitizedRows,
        flatRates: sanitizedFlatRates,
        additionalRoomRates,
        cancellationFee,
      })
      .commit();

    return NextResponse.json({ message: 'Price list updated successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('flatRate')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
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
