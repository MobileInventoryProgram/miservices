import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getMemberByEmail, isMemberStillActive } from '@/lib/sanity';

/** How often a signed-in member's login is re-checked */
const ACTIVE_CHECK_MS = 5 * 60 * 1000;
import { verifyPassword } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const member = await getMemberByEmail(credentials.email);
        if (!member || !member.hashedPassword) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, member.hashedPassword);
        if (!isValid) {
          return null;
        }

        return {
          id: member._id,
          name: member.name || member.email,
          email: member.email,
          role: member.role,
          franchiseeId: member.franchiseeId || null,
          territory: member.territory || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.franchiseeId = user.franchiseeId;
        token.territory = user.territory;
        token.activeCheckedAt = Date.now();
      } else if (token.sub && Date.now() - ((token.activeCheckedAt as number) || 0) > ACTIVE_CHECK_MS) {
        // Logins (or whole franchises) switched off by Head Office stop working within minutes
        if (!(await isMemberStillActive(token.sub))) token.revoked = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.revoked) return { ...session, user: undefined } as unknown as typeof session;
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'franchisee' | 'admin';
        session.user.franchiseeId = token.franchiseeId as string | null;
        session.user.territory = token.territory as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/members/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.SESSION_SECRET,
};
