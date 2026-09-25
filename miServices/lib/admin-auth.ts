import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * For Head Office admin API routes: the session, or the response to return
 * (401 when signed out, 403 for anyone who isn't an admin).
 */
export async function requireAdmin(): Promise<{ session: Session; response?: never } | { session?: never; response: NextResponse }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.user.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Head Office only' }, { status: 403 }) };
  }
  return { session };
}
