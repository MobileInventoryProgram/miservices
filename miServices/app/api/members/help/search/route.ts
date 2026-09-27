import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getHelpForSession } from '@/lib/help/access';
import { searchHelp } from '@/lib/help/search';

/** GET ?q= — Help Centre search over the answers and documents this member can see */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 200);
  try {
    const { articles, visibleDocIds } = await getHelpForSession(session);
    return NextResponse.json(await searchHelp(q, articles, visibleDocIds));
  } catch (error) {
    console.error('Help search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
