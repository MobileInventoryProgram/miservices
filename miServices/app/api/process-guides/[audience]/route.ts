import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { processDocs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { audience: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { audience } = params;

    if (audience !== 'franchise' && audience !== 'staff') {
      return NextResponse.json(
        { success: false, error: 'Invalid audience' },
        { status: 400 }
      );
    }

    if (session.user.role === 'franchise' && audience !== 'franchise') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (session.user.role === 'staff' && audience !== 'staff') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const docs = await db
      .select()
      .from(processDocs)
      .where(
        and(
          eq(processDocs.audience, audience),
          eq(processDocs.isActive, 'true')
        )
      )
      .orderBy(processDocs.section, processDocs.displayOrder);

    const groupedBySection = docs.reduce((acc, doc) => {
      if (!acc[doc.section]) {
        acc[doc.section] = [];
      }
      acc[doc.section].push({
        id: doc.id,
        title: doc.title,
        slug: doc.ghostSlug,
      });
      return acc;
    }, {} as Record<string, Array<{ id: number; title: string; slug: string }>>);

    const sections = Object.keys(groupedBySection).map(section => ({
      category: section,
      guides: groupedBySection[section],
    }));

    return NextResponse.json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error('Error fetching process guides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}
