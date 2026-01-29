import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { processDocs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { section, updates } = await request.json();

    if (!section || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Section and updates array are required' },
        { status: 400 }
      );
    }

    const allDocsInSection = await db
      .select()
      .from(processDocs)
      .where(eq(processDocs.section, section));

    if (allDocsInSection.length !== updates.length) {
      return NextResponse.json(
        { error: `Update must include all ${allDocsInSection.length} docs in the section, but received ${updates.length}` },
        { status: 400 }
      );
    }

    const updateIds = new Set(updates.map(u => u.id));
    const sectionIds = new Set(allDocsInSection.map(d => d.id));
    
    const allIdsMatch = allDocsInSection.every(doc => updateIds.has(doc.id)) &&
                        updates.every((u: { id: number }) => sectionIds.has(u.id));
    
    if (!allIdsMatch) {
      return NextResponse.json(
        { error: 'Update IDs must exactly match all docs in the section' },
        { status: 400 }
      );
    }

    const displayOrders = updates.map((u: { displayOrder: number }) => u.displayOrder).sort((a, b) => a - b);
    const expectedOrders = Array.from({ length: updates.length }, (_, i) => i);
    const isSequential = displayOrders.every((order, i) => order === expectedOrders[i]);
    
    if (!isSequential) {
      return NextResponse.json(
        { error: 'Display orders must be sequential starting from 0' },
        { status: 400 }
      );
    }

    for (const update of updates) {
      await db
        .update(processDocs)
        .set({ 
          displayOrder: update.displayOrder,
          updatedAt: new Date(),
        })
        .where(eq(processDocs.id, update.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering process docs:', error);
    return NextResponse.json(
      { error: 'Failed to reorder process docs' },
      { status: 500 }
    );
  }
}
