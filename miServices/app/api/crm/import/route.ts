import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { imports, contacts, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    let query = db.select().from(imports).orderBy(desc(imports.createdAt));

    const results = await query;

    // Filter by user if not admin
    const filteredResults = isAdmin
      ? results
      : results.filter((imp) => imp.importedBy === userId);

    return NextResponse.json({ imports: filteredResults });
  } catch (error) {
    console.error('Error fetching imports:', error);
    return NextResponse.json({ error: 'Failed to fetch imports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { contacts: contactsData } = body;

    if (!Array.isArray(contactsData) || contactsData.length === 0) {
      return NextResponse.json(
        { error: 'Contacts data array is required' },
        { status: 400 }
      );
    }

    let successful = 0;
    let failed = 0;
    const errors: any[] = [];

    // Process each contact
    for (let i = 0; i < contactsData.length; i++) {
      const contactData = contactsData[i];

      try {
        // Validate required fields
        if (!contactData.firstName || !contactData.lastName) {
          failed++;
          errors.push({
            row: i + 1,
            error: 'First name and last name are required',
            data: contactData,
          });
          continue;
        }

        // Check for duplicate email
        if (contactData.email) {
          const existing = await db
            .select()
            .from(contacts)
            .where(eq(contacts.email, contactData.email))
            .limit(1);

          if (existing.length > 0) {
            failed++;
            errors.push({
              row: i + 1,
              error: 'Email already exists',
              data: contactData,
            });
            continue;
          }
        }

        // Validate franchiseId if provided - must match current user for franchise users
        const userDetails = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const userRole = userDetails[0]?.role;
        const isAdmin = userRole === 'admin' || userRole === 'superadmin';

        let validatedFranchiseId = contactData.franchiseId || null;

        if (!isAdmin) {
          // Non-admin users can only create contacts assigned to themselves
          validatedFranchiseId = userId;
        } else if (validatedFranchiseId) {
          // Admin can assign to any franchise, but validate it exists
          const franchiseExists = await db
            .select()
            .from(users)
            .where(and(eq(users.id, validatedFranchiseId), eq(users.role, 'franchise')))
            .limit(1);

          if (!franchiseExists.length) {
            failed++;
            errors.push({
              row: i + 1,
              error: 'Invalid franchiseId - franchise user not found',
              data: contactData,
            });
            continue;
          }
        }

        // Create contact
        await db.insert(contacts).values({
          franchiseId: validatedFranchiseId,
          ownerId: userId,
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email || null,
          phone: contactData.phone || null,
          company: contactData.company || null,
          status: contactData.status || 'lead',
          source: contactData.source || 'import',
          tags: contactData.tags || [],
        });

        successful++;
      } catch (error: any) {
        failed++;
        errors.push({
          row: i + 1,
          error: error.message || 'Unknown error',
          data: contactData,
        });
      }
    }

    // Create import record
    const [importRecord] = await db
      .insert(imports)
      .values({
        importedBy: userId,
        totalContacts: contactsData.length,
        successful,
        failed,
        errors,
      })
      .returning();

    return NextResponse.json({
      import: importRecord,
      message: `Import completed: ${successful} successful, ${failed} failed`,
    });
  } catch (error) {
    console.error('Error importing contacts:', error);
    return NextResponse.json({ error: 'Failed to import contacts' }, { status: 500 });
  }
}
