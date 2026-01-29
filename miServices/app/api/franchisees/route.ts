import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, User } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const franchisees = await db.select({
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
        eq(users.isActive, 'true')
      )
    )
    .orderBy(users.territory);

    const franchiseesWithName = franchisees.map(franchisee => ({
      ...franchisee,
      name: `${franchisee.firstName} ${franchisee.lastName}`,
    }));

    const groupedByTerritory = franchiseesWithName.reduce((acc: any[], franchisee) => {
      const existingGroup = acc.find(group => group.companyName === franchisee.companyName);
      
      if (existingGroup) {
        existingGroup.owners.push({
          id: franchisee.id,
          firstName: franchisee.firstName,
          lastName: franchisee.lastName,
          name: franchisee.name,
          email: franchisee.email,
          phone: franchisee.phone,
          profilePicture: franchisee.profilePicture,
        });
        
        if (franchisee.slug && !franchisee.slug.match(/-\d+$/)) {
          existingGroup.slug = franchisee.slug;
        }
      } else {
        acc.push({
          id: franchisee.id,
          companyName: franchisee.companyName,
          postCodes: franchisee.postCodes,
          territory: franchisee.territory,
          townsCities: franchisee.townsCities,
          tags: franchisee.tags,
          slug: franchisee.slug,
          owners: [{
            id: franchisee.id,
            firstName: franchisee.firstName,
            lastName: franchisee.lastName,
            name: franchisee.name,
            email: franchisee.email,
            phone: franchisee.phone,
            profilePicture: franchisee.profilePicture,
          }],
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json(groupedByTerritory);
  } catch (error) {
    console.error('Error fetching franchisees:', error);
    return NextResponse.json({ error: 'Failed to fetch franchisees' }, { status: 500 });
  }
}
