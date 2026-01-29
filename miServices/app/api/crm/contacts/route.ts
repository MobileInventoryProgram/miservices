import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { contacts, users, Contact } from '@/db/schema';
import { eq, and, or, sql, ilike } from 'drizzle-orm';

// GET /api/crm/contacts - List contacts with role-based filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    
    // Get query parameters for search and filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const tag = searchParams.get('tag') || '';
    const franchiseId = searchParams.get('franchiseId') || '';

    // Build query based on role
    let allContacts: Contact[];

    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins (both types) can see all contacts, with optional franchiseId filter
      if (franchiseId) {
        allContacts = await db.select().from(contacts)
          .where(eq(contacts.franchiseId, parseInt(franchiseId)));
      } else {
        allContacts = await db.select().from(contacts);
      }
    } else if (userRole === 'franchise') {
      // Get the current user's territory
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      const userTerritory = currentUser?.territory;

      if (userTerritory) {
        // Get all franchisees in the same territory
        const territoryFranchisees = await db.select().from(users)
          .where(and(
            eq(users.role, 'franchise'),
            eq(users.territory, userTerritory)
          ));
        
        const territoryFranchiseeIds = territoryFranchisees.map(f => f.id);

        // Franchise owners see contacts where franchiseId is in their territory OR they own it
        allContacts = await db.select().from(contacts)
          .where(
            or(
              sql`${contacts.franchiseId} IN (${sql.join(territoryFranchiseeIds.map(id => sql`${id}`), sql`, `)})`,
              eq(contacts.ownerId, userId)
            )
          );
      } else {
        // No territory - only see own contacts
        allContacts = await db.select().from(contacts)
          .where(
            or(
              eq(contacts.franchiseId, userId),
              eq(contacts.ownerId, userId)
            )
          );
      }
    } else {
      allContacts = [];
    }

    // Apply client-side filters for search, status, and tags
    let filteredContacts = allContacts;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredContacts = filteredContacts.filter(c => 
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filteredContacts = filteredContacts.filter(c => c.status === status);
    }

    if (tag) {
      filteredContacts = filteredContacts.filter(c => 
        c.tags && Array.isArray(c.tags) && c.tags.includes(tag)
      );
    }

    return NextResponse.json({ contacts: filteredContacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// POST /api/crm/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      tags,
      status,
      source,
      franchiseId,
      ownerId
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Determine franchise ID and owner ID
    let contactFranchiseId: number | null = null;
    let contactOwnerId: number;

    if (userRole === 'franchise') {
      // Franchise owners' contacts belong to their franchise
      contactFranchiseId = userId;
      contactOwnerId = ownerId ? parseInt(ownerId) : userId;
    } else if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can assign to specific franchise and owner
      contactFranchiseId = franchiseId ? parseInt(franchiseId) : null;
      contactOwnerId = ownerId ? parseInt(ownerId) : userId;
    } else {
      contactOwnerId = userId;
    }

    const [newContact] = await db.insert(contacts).values({
      franchiseId: contactFranchiseId,
      ownerId: contactOwnerId,
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      company: company || null,
      tags: tags || [],
      status: status || 'lead',
      source: source || null,
      notesCount: 0,
    }).returning();

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
