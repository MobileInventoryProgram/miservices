import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { proposals, contacts, users } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposalId = parseInt(params.id);
    if (isNaN(proposalId)) {
      return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    const result = await db
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
        contactEmail: contacts.email,
        contactPhone: contacts.phone,
        contactCompany: contacts.company,
      })
      .from(proposals)
      .leftJoin(contacts, eq(proposals.contactId, contacts.id))
      .where(eq(proposals.id, proposalId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposal = result[0];

    // Authorization check
    if (!isAdmin) {
      const userDetails = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const territory = userDetails[0]?.territory;

      const contact = await db.select().from(contacts).where(eq(contacts.id, proposal.contactId)).limit(1);

      const hasAccess =
        proposal.franchiseId === userId ||
        proposal.authorId === userId ||
        contact[0]?.franchiseId === userId;

      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposalId = parseInt(params.id);
    if (isNaN(proposalId)) {
      return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    const body = await request.json();
    const { title, contentJson, status, pdfUrl, viewedAt, acceptedAt, acceptedBy } = body;

    // Fetch existing proposal
    const existing = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, proposalId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposal = existing[0];

    // Authorization check
    if (!isAdmin) {
      const userDetails = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const territory = userDetails[0]?.territory;

      const contact = await db.select().from(contacts).where(eq(contacts.id, proposal.contactId)).limit(1);

      const hasAccess =
        proposal.franchiseId === userId ||
        proposal.authorId === userId ||
        contact[0]?.franchiseId === userId;

      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const [updated] = await db
      .update(proposals)
      .set({
        title: title || proposal.title,
        contentJson: contentJson !== undefined ? contentJson : proposal.contentJson,
        status: status || proposal.status,
        pdfUrl: pdfUrl !== undefined ? pdfUrl : proposal.pdfUrl,
        viewedAt: viewedAt !== undefined ? viewedAt : proposal.viewedAt,
        acceptedAt: acceptedAt !== undefined ? acceptedAt : proposal.acceptedAt,
        acceptedBy: acceptedBy !== undefined ? acceptedBy : proposal.acceptedBy,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, proposalId))
      .returning();

    return NextResponse.json({ proposal: updated });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposalId = parseInt(params.id);
    if (isNaN(proposalId)) {
      return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);
    const userRole = session.user.role;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    // Fetch existing proposal
    const existing = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, proposalId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposal = existing[0];

    // Authorization check - only author or admin can delete
    if (!isAdmin && proposal.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(proposals).where(eq(proposals.id, proposalId));

    return NextResponse.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 });
  }
}
