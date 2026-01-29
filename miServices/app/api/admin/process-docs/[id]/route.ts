import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { processDocs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docId = parseInt(params.id);
    const body = await request.json();
    const { title, ghostSlug, audience, section, isActive } = body;

    const existingDoc = await db.select().from(processDocs).where(eq(processDocs.id, docId));
    if (existingDoc.length === 0) {
      return NextResponse.json({ error: 'Process doc not found' }, { status: 404 });
    }

    if (audience && !['franchise', 'admin'].includes(audience)) {
      return NextResponse.json(
        { error: 'Audience must be either "franchise" or "admin"' },
        { status: 400 }
      );
    }

    const [updatedDoc] = await db
      .update(processDocs)
      .set({
        title: title !== undefined ? title : existingDoc[0].title,
        ghostSlug: ghostSlug !== undefined ? ghostSlug : existingDoc[0].ghostSlug,
        audience: audience !== undefined ? audience : existingDoc[0].audience,
        section: section !== undefined ? section : existingDoc[0].section,
        isActive: isActive !== undefined ? isActive : existingDoc[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(processDocs.id, docId))
      .returning();

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error('Error updating process doc:', error);
    return NextResponse.json({ error: 'Failed to update process doc' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docId = parseInt(params.id);

    const existingDoc = await db.select().from(processDocs).where(eq(processDocs.id, docId));
    if (existingDoc.length === 0) {
      return NextResponse.json({ error: 'Process doc not found' }, { status: 404 });
    }

    await db.delete(processDocs).where(eq(processDocs.id, docId));

    return NextResponse.json({ message: 'Process doc deleted successfully' });
  } catch (error) {
    console.error('Error deleting process doc:', error);
    return NextResponse.json({ error: 'Failed to delete process doc' }, { status: 500 });
  }
}
