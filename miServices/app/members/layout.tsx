import { getServerSession } from 'next-auth';
import MembersShell, { type ShellUser } from '@/components/members/MembersShell';
import { authOptions } from '@/lib/auth-options';
import { getFranchiseeForSession } from '@/lib/sanity';

/** Members Area pages: side menu and user details (no frame on the login page). */
export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  let user: ShellUser | null = null;
  if (session?.user) {
    const franchisee = await getFranchiseeForSession(session);
    const isAdmin = session.user.role === 'admin';
    user = {
      name: session.user.name || session.user.email,
      subtitle: franchisee?.territory || session.user.territory || (isAdmin ? 'Head Office' : 'Member'),
      photoUrl: franchisee?.owners?.[0]?.profilePicture?.asset?.url || null,
      isAdmin,
      hasFranchisee: !!franchisee,
    };
  }

  return <MembersShell user={user}>{children}</MembersShell>;
}
