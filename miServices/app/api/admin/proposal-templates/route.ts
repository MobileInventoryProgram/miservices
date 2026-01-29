import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { proposalTemplates } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await db
      .select()
      .from(proposalTemplates)
      .orderBy(desc(proposalTemplates.createdAt));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching proposal templates:', error);
    return NextResponse.json({ error: 'Failed to fetch proposal templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { name, description, contentJson } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    const [template] = await db
      .insert(proposalTemplates)
      .values({
        name,
        description: description || null,
        contentJson: contentJson || {},
        createdBy: userId,
      })
      .returning();

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal template:', error);
    return NextResponse.json({ error: 'Failed to create proposal template' }, { status: 500 });
  }
}
