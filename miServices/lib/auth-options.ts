// NextAuth configuration for miServices members area
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByUsername, getUserByEmail, verifyPassword, sanitizeUser } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Try username first, then email
        let user = await getUserByUsername(credentials.username);
        if (!user) {
          user = await getUserByEmail(credentials.username);
        }

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // Return sanitized user (without password)
        const sanitized = sanitizeUser(user);

        return {
          id: String(sanitized.id),
          name: `${sanitized.firstName} ${sanitized.lastName}`,
          email: sanitized.email,
          role: sanitized.role,
          territory: sanitized.territory,
          phone: sanitized.phone,
          contractLink: sanitized.contractLink,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.territory = user.territory;
        token.phone = user.phone;
        token.contractLink = user.contractLink;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'franchise' | 'staff' | 'admin';
        session.user.territory = token.territory as string | null;
        session.user.phone = token.phone as string | null;
        session.user.contractLink = token.contractLink as string | null;
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
