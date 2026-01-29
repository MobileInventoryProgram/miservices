import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const franchisees = await db
      .select({
        name: users.name,
        email: users.email,
        contactNumber: users.contactNumber,
        franchiseTerritory: users.franchiseTerritory,
      })
      .from(users)
      .where(eq(users.role, 'franchise'))
      .orderBy(users.name);
    
    return NextResponse.json({
      success: true,
      contacts: franchisees,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
