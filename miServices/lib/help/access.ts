import 'server-only';
import type { Session } from 'next-auth';
import { getVisibleMemberDocumentIds } from '@/lib/sanity';
import { getAllHelpArticles, visibleArticles, type HelpArticle } from './articles';

/** The answers and documents this member can see (Head Office sees everything) */
export async function getHelpForSession(session: Session): Promise<{ isAdmin: boolean; articles: HelpArticle[]; visibleDocIds: Set<string> | null }> {
  const isAdmin = session.user.role === 'admin';
  const [all, ids] = await Promise.all([
    getAllHelpArticles(),
    isAdmin
      ? Promise.resolve(null)
      : getVisibleMemberDocumentIds({ memberId: session.user.id, franchiseeId: session.user.franchiseeId || null, role: session.user.role }),
  ]);
  const visibleDocIds = ids ? new Set(ids) : null;
  return { isAdmin, articles: visibleArticles(all, visibleDocIds || new Set(), isAdmin), visibleDocIds };
}
