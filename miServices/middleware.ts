import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: process.env.SESSION_SECRET,
  callbacks: {
    authorized: ({ token }) => !!token && !token.revoked,
  },
});

export const config = {
  matcher: ['/members/((?!login).*)'],
};
