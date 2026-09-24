import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { parseContactInput } from '@/lib/crm/validate';
import { getMemberScope } from '@/lib/members-access';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Create a contact for the member's franchise.
 *
 * Body: contact fields (see lib/crm/validate.ts), plus optional source: 'quote'
 * Returns: { id }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const scope = await getMemberScope(session);
    if (!scope?.franchiseeId) {
      return NextResponse.json(
        { error: 'Your account is not linked to a franchise, so it cannot add contacts.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { data, error } = parseContactInput(body);
    if (!data) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const now = new Date().toISOString();
    const doc = await sanityWriteClient.create({
      _type: 'contact',
      ...data,
      franchise: { _type: 'reference', _ref: scope.franchiseeId },
      owner: { _type: 'reference', _ref: scope.memberId, _weak: true },
      source: body?.source === 'quote' ? 'quote' : 'manual',
      archived: false,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: doc._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
