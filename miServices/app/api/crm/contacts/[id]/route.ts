import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { contacts } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

// GET /api/crm/contacts/[id] - Get single contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Build query with role-based filtering to avoid authorization oracle
    let whereClause;
    if (userRole === 'admin' || userRole === 'superadmin') {
      whereClause = eq(contacts.id, contactId);
    } else if (userRole === 'franchise') {
      // Franchise can see contacts where franchiseId matches OR they are the owner
      whereClause = and(
        eq(contacts.id, contactId),
        or(
          eq(contacts.franchiseId, userId),
          eq(contacts.ownerId, userId)
        )
      );
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [contact] = await db.select().from(contacts).where(whereClause);

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

// PUT /api/crm/contacts/[id] - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Build query with role-based filtering for UPDATE
    let whereClause;
    if (userRole === 'admin' || userRole === 'superadmin') {
      whereClause = eq(contacts.id, contactId);
    } else if (userRole === 'franchise') {
      // Franchise can update contacts where franchiseId matches OR they are the owner
      whereClause = and(
        eq(contacts.id, contactId),
        or(
          eq(contacts.franchiseId, userId),
          eq(contacts.ownerId, userId)
        )
      );
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [existingContact] = await db.select().from(contacts).where(whereClause);

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
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
      source
    } = body;

    const [updatedContact] = await db
      .update(contacts)
      .set({
        firstName: firstName || existingContact.firstName,
        lastName: lastName || existingContact.lastName,
        email: email !== undefined ? email : existingContact.email,
        phone: phone !== undefined ? phone : existingContact.phone,
        company: company !== undefined ? company : existingContact.company,
        tags: tags || existingContact.tags,
        status: status || existingContact.status,
        source: source !== undefined ? source : existingContact.source,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId))
      .returning();

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

// DELETE /api/crm/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactId = parseInt(params.id);
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Build query with role-based filtering for DELETE
    let deleteWhereClause;
    if (userRole === 'admin' || userRole === 'superadmin') {
      deleteWhereClause = eq(contacts.id, contactId);
    } else if (userRole === 'franchise') {
      // Franchise can delete contacts where franchiseId matches OR they are the owner
      deleteWhereClause = and(
        eq(contacts.id, contactId),
        or(
          eq(contacts.franchiseId, userId),
          eq(contacts.ownerId, userId)
        )
      );
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [existingContact] = await db.select().from(contacts).where(deleteWhereClause);

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await db.delete(contacts).where(and(eq(contacts.id, contactId), deleteWhereClause));

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
