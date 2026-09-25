import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sanityWriteClient } from '@/lib/sanity';

const BLANK_SERVICES = ['inventory', 'combined', 'checkout'];
const BLANK_SIZES: [string, number][] = [
  ['studio_1', 8],
  ['2', 9],
  ['3', 10],
  ['4', 11],
  ['5', 12],
];

/**
 * POST — Create a Head Office standard price list, blank or copied from any
 * existing list. New lists aren't shared with franchisees until switched on.
 */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    if (!title) {
      return NextResponse.json({ error: 'Please give the price list a name.' }, { status: 400 });
    }

    let content: Record<string, unknown>;
    if (body.copyFromId) {
      const source = await sanityWriteClient.fetch(
        `*[_type == "priceList" && _id == $id][0] { serviceRows, flatRates, additionalRoomRates, cancellationFee, terms, flyerNote }`,
        { id: String(body.copyFromId) }
      );
      if (!source) {
        return NextResponse.json({ error: 'The list to copy was not found.' }, { status: 404 });
      }
      content = Object.fromEntries(Object.entries(source).filter(([, v]) => v != null));
    } else {
      content = {
        serviceRows: BLANK_SERVICES.flatMap((serviceType) =>
          BLANK_SIZES.map(([bedrooms, maxRooms]) => ({
            _type: 'object',
            _key: `${serviceType}-${bedrooms}`,
            serviceType,
            bedrooms,
            maxRooms,
            unfurnishedPrice: 0,
          }))
        ),
        flatRates: [],
        additionalRoomRates: { unfurnishedPerRoom: 0, furnishedPerRoom: 0 },
        cancellationFee: 0,
      };
    }

    const doc = await sanityWriteClient.create({
      _type: 'priceList',
      ...content,
      title,
      isDefault: false,
      availableToFranchisees: false,
    });

    return NextResponse.json({ id: doc._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating standard price list:', error);
    return NextResponse.json({ error: 'Failed to create price list' }, { status: 500 });
  }
}
