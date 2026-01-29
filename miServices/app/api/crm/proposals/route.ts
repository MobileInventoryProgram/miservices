import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { proposals, contacts, users } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const franchiseId = searchParams.get('franchiseId');

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    // Build base query
    let query = db
      .select({
        id: proposals.id,
        contactId: proposals.contactId,
        franchiseId: proposals.franchiseId,
        authorId: proposals.authorId,
        title: proposals.title,
        status: proposals.status,
        contentJson: proposals.contentJson,
        pdfUrl: proposals.pdfUrl,
        createdAt: proposals.createdAt,
        updatedAt: proposals.updatedAt,
        viewedAt: proposals.viewedAt,
        acceptedAt: proposals.acceptedAt,
        acceptedBy: proposals.acceptedBy,
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(proposals)
      .leftJoin(contacts, eq(proposals.contactId, contacts.id))
      .leftJoin(users, eq(proposals.authorId, users.id))
      .orderBy(desc(proposals.createdAt));

    // Apply SQL-level access control
    if (!isAdmin) {
      // Get user's territory
      const userDetails = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const territory = userDetails[0]?.territory;

      // For territory sharing, get all franchise users with same territory
      let territoryFranchiseIds: number[] = [];
      if (territory) {
        const territoryFranchises = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.role, 'franchise'), eq(users.territory, territory)));
        territoryFranchiseIds = territoryFranchises.map((u) => u.id);
      }

      // Franchise users can only see proposals where:
      // 1. They are the author, OR
      // 2. The proposal franchiseId matches their user ID, OR
      // 3. The proposal franchiseId belongs to another franchise in their territory
      const accessConditions = [
        eq(proposals.authorId, userId),
        eq(proposals.franchiseId, userId),
      ];

      if (territoryFranchiseIds.length > 0) {
        territoryFranchiseIds.forEach((id) => {
          accessConditions.push(eq(proposals.franchiseId, id));
        });
      }

      query = query.where(or(...accessConditions));
    }

    // Apply additional filters after access control
    if (contactId) {
      const contactIdFilter = eq(proposals.contactId, parseInt(contactId));
      if (!isAdmin) {
        const userDetails = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const territory = userDetails[0]?.territory;
        let territoryFranchiseIds: number[] = [];
        if (territory) {
          const territoryFranchises = await db
            .select({ id: users.id })
            .from(users)
            .where(and(eq(users.role, 'franchise'), eq(users.territory, territory)));
          territoryFranchiseIds = territoryFranchises.map((u) => u.id);
        }
        
        const accessConditions = [
          eq(proposals.authorId, userId),
          eq(proposals.franchiseId, userId),
        ];
        territoryFranchiseIds.forEach((id) => accessConditions.push(eq(proposals.franchiseId, id)));
        
        query = db
          .select({
            id: proposals.id,
            contactId: proposals.contactId,
            franchiseId: proposals.franchiseId,
            authorId: proposals.authorId,
            title: proposals.title,
            status: proposals.status,
            contentJson: proposals.contentJson,
            pdfUrl: proposals.pdfUrl,
            createdAt: proposals.createdAt,
            updatedAt: proposals.updatedAt,
            viewedAt: proposals.viewedAt,
            acceptedAt: proposals.acceptedAt,
            acceptedBy: proposals.acceptedBy,
            contactFirstName: contacts.firstName,
            contactLastName: contacts.lastName,
            authorFirstName: users.firstName,
            authorLastName: users.lastName,
          })
          .from(proposals)
          .leftJoin(contacts, eq(proposals.contactId, contacts.id))
          .leftJoin(users, eq(proposals.authorId, users.id))
          .where(and(or(...accessConditions), contactIdFilter))
          .orderBy(desc(proposals.createdAt));
      } else {
        query = db
          .select({
            id: proposals.id,
            contactId: proposals.contactId,
            franchiseId: proposals.franchiseId,
            authorId: proposals.authorId,
            title: proposals.title,
            status: proposals.status,
            contentJson: proposals.contentJson,
            pdfUrl: proposals.pdfUrl,
            createdAt: proposals.createdAt,
            updatedAt: proposals.updatedAt,
            viewedAt: proposals.viewedAt,
            acceptedAt: proposals.acceptedAt,
            acceptedBy: proposals.acceptedBy,
            contactFirstName: contacts.firstName,
            contactLastName: contacts.lastName,
            authorFirstName: users.firstName,
            authorLastName: users.lastName,
          })
          .from(proposals)
          .leftJoin(contacts, eq(proposals.contactId, contacts.id))
          .leftJoin(users, eq(proposals.authorId, users.id))
          .where(contactIdFilter)
          .orderBy(desc(proposals.createdAt));
      }
    }

    if (franchiseId && isAdmin) {
      const franchiseIdFilter = eq(proposals.franchiseId, parseInt(franchiseId));
      query = db
        .select({
          id: proposals.id,
          contactId: proposals.contactId,
          franchiseId: proposals.franchiseId,
          authorId: proposals.authorId,
          title: proposals.title,
          status: proposals.status,
          contentJson: proposals.contentJson,
          pdfUrl: proposals.pdfUrl,
          createdAt: proposals.createdAt,
          updatedAt: proposals.updatedAt,
          viewedAt: proposals.viewedAt,
          acceptedAt: proposals.acceptedAt,
          acceptedBy: proposals.acceptedBy,
          contactFirstName: contacts.firstName,
          contactLastName: contacts.lastName,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
        })
        .from(proposals)
        .leftJoin(contacts, eq(proposals.contactId, contacts.id))
        .leftJoin(users, eq(proposals.authorId, users.id))
        .where(franchiseIdFilter)
        .orderBy(desc(proposals.createdAt));
    }

    const results = await query;

    return NextResponse.json({ proposals: results });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    const body = await request.json();
    const { contactId, title, contentJson, status } = body;

    if (!contactId || !title) {
      return NextResponse.json(
        { error: 'Contact ID and title are required' },
        { status: 400 }
      );
    }

    // Verify contact access
    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    if (!contact.length) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Authorization check - franchise users can only create proposals for their contacts
    if (!isAdmin) {
      const userDetails = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const territory = userDetails[0]?.territory;

      const hasDirectAccess =
        contact[0].franchiseId === userId ||
        contact[0].ownerId === userId;

      if (!hasDirectAccess) {
        // Check territory-based sharing
        if (territory && contact[0].franchiseId) {
          const franchiseUserDetails = await db
            .select()
            .from(users)
            .where(eq(users.id, contact[0].franchiseId))
            .limit(1);

          if (!franchiseUserDetails[0] || franchiseUserDetails[0].territory !== territory) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
          }
        } else {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      }
    }

    const [proposal] = await db
      .insert(proposals)
      .values({
        contactId: parseInt(contactId),
        franchiseId: contact[0].franchiseId,
        authorId: userId,
        title,
        contentJson: contentJson || {},
        status: status || 'draft',
      })
      .returning();

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
