import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { processDocs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allDocs = await db.select().from(processDocs).orderBy(processDocs.section, processDocs.displayOrder);
    
    return NextResponse.json(allDocs);
  } catch (error) {
    console.error('Error fetching process docs:', error);
    return NextResponse.json({ error: 'Failed to fetch process docs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, ghostSlug, audience, section } = body;

    if (!title || !ghostSlug || !audience || !section) {
      return NextResponse.json(
        { error: 'Title, Ghost slug, audience, and section are required' },
        { status: 400 }
      );
    }

    if (!['franchise', 'admin'].includes(audience)) {
      return NextResponse.json(
        { error: 'Audience must be either "franchise" or "admin"' },
        { status: 400 }
      );
    }

    const existingDocsInSection = await db.select().from(processDocs).where(eq(processDocs.section, section));
    const maxOrder = existingDocsInSection.length > 0
      ? Math.max(...existingDocsInSection.map(doc => doc.displayOrder ?? 0))
      : -1;

    const [newDoc] = await db.insert(processDocs).values({
      title,
      ghostSlug,
      audience,
      section,
      displayOrder: maxOrder + 1,
      isActive: 'true',
    }).returning();

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating process doc:', error);
    return NextResponse.json({ error: 'Failed to create process doc' }, { status: 500 });
  }
}
