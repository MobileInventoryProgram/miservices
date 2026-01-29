import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getPagesByTag } from '@/lib/sanity';

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'franchise' && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const pages = await getPagesByTag(params.tag);

    console.log(`[Sanity API] Tag: ${params.tag}, Pages found: ${pages.length}`);
    if (pages.length > 0) {
      console.log('[Sanity API] First page:', pages[0].title);
    }

    return NextResponse.json({
      success: true,
      guides: pages.map(page => ({
        id: page._id,
        title: page.title,
        slug: page.slug,
        excerpt: page.excerpt,
        published_at: page.publishedAt,
        tags: page.tags || []
      }))
    });
  } catch (error) {
    console.error('Error in Sanity guides API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}
