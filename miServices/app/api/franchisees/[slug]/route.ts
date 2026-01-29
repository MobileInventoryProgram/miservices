import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const [franchisee] = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      companyName: users.companyName,
      postCodes: users.postCodes,
      territory: users.territory,
      townsCities: users.townsCities,
      profilePicture: users.profilePicture,
      tags: users.tags,
      slug: users.slug,
    })
    .from(users)
    .where(
      and(
        eq(users.role, 'franchise'),
        eq(users.isActive, 'true'),
        eq(users.slug, params.slug)
      )
    )
    .limit(1);

    if (!franchisee) {
      return NextResponse.json({ error: 'Franchisee not found' }, { status: 404 });
    }

    const franchiseeWithName = {
      ...franchisee,
      name: `${franchisee.firstName} ${franchisee.lastName}`,
    };

    return NextResponse.json(franchiseeWithName);
  } catch (error) {
    console.error('Error fetching franchisee:', error);
    return NextResponse.json({ error: 'Failed to fetch franchisee' }, { status: 500 });
  }
}
