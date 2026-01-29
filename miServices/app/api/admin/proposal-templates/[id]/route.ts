import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { proposalTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    const template = await db
      .select()
      .from(proposalTemplates)
      .where(eq(proposalTemplates.id, templateId))
      .limit(1);

    if (!template.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template: template[0] });
  } catch (error) {
    console.error('Error fetching proposal template:', error);
    return NextResponse.json({ error: 'Failed to fetch proposal template' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, contentJson } = body;

    const existing = await db
      .select()
      .from(proposalTemplates)
      .where(eq(proposalTemplates.id, templateId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const [updated] = await db
      .update(proposalTemplates)
      .set({
        name: name || existing[0].name,
        description: description !== undefined ? description : existing[0].description,
        contentJson: contentJson !== undefined ? contentJson : existing[0].contentJson,
        updatedAt: new Date(),
      })
      .where(eq(proposalTemplates.id, templateId))
      .returning();

    return NextResponse.json({ template: updated });
  } catch (error) {
    console.error('Error updating proposal template:', error);
    return NextResponse.json({ error: 'Failed to update proposal template' }, { status: 500 });
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

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(proposalTemplates)
      .where(eq(proposalTemplates.id, templateId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await db.delete(proposalTemplates).where(eq(proposalTemplates.id, templateId));

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal template:', error);
    return NextResponse.json({ error: 'Failed to delete proposal template' }, { status: 500 });
  }
}
