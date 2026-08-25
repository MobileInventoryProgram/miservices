import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sanityWriteClient } from '@/lib/sanity';
import { bakeAdjustedPrices } from '@/lib/pricing';
import type { ServiceRow } from '@/lib/pricing';

/**
 * Resolve the franchisee ID from the authenticated session.
 * Prefers the direct reference; falls back to territory lookup.
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
 * POST — Duplicate a shared template into a new franchisee-owned price list.
 *
 * Body: { templateId: string, title: string, blanketAdjustment?: number }
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const { templateId, title, blanketAdjustment = 0 } = body;

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (typeof blanketAdjustment !== 'number' || !isFinite(blanketAdjustment)) {
      return NextResponse.json(
        { error: 'blanketAdjustment must be a valid number' },
        { status: 400 }
      );
    }

    // Verify the template exists and is a shared template
    const template = await sanityWriteClient.fetch(
      `*[_type == "priceList" && _id == $templateId && !defined(owner) && availableToFranchisees == true][0] {
        _id,
        serviceRows[] {
          _key,
          serviceType,
          bedrooms,
          maxRooms,
          unfurnishedPrice,
          furnishedPrice
        },
        flatRates[] {
          _key,
          name,
          price,
          unit
        },
        additionalRoomRates {
          unfurnishedPerRoom,
          furnishedPerRoom
        },
        cancellationFee,
        terms
      }`,
      { templateId }
    );

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or not available for duplication' },
        { status: 404 }
      );
    }

    // Apply blanket adjustment and bake prices into service rows
    const templateRows = (template.serviceRows || []) as ServiceRow[];
    const bakedRows = bakeAdjustedPrices(templateRows, blanketAdjustment);

    // Create the new owned price list
    const newDoc = await sanityWriteClient.create({
      _type: 'priceList',
      title: title.trim(),
      owner: { _type: 'reference', _ref: franchiseeId },
      isDefault: false,
      serviceRows: bakedRows.map((row) => ({
        _type: 'object',
        _key: `${row.serviceType}-${row.bedrooms}`,
        serviceType: row.serviceType,
        bedrooms: row.bedrooms,
        maxRooms: row.maxRooms,
        unfurnishedPrice: row.unfurnishedPrice,
        ...(row.furnishedPrice != null ? { furnishedPrice: row.furnishedPrice } : {}),
      })),
      flatRates: (template.flatRates || []).map((rate: any) => ({
        _type: 'object',
        _key: rate._key,
        name: rate.name,
        price: rate.price,
        unit: rate.unit,
      })),
      additionalRoomRates: template.additionalRoomRates,
      cancellationFee: template.cancellationFee,
      terms: template.terms,
    });

    return NextResponse.json({ id: newDoc._id }, { status: 201 });
  } catch (error) {
    console.error('Duplicate template error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
