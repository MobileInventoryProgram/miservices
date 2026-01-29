// TypeScript definitions for NextAuth
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'franchise' | 'admin' | 'superadmin';
    territory?: string | null;
    phone?: string | null;
    contractLink?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'franchise' | 'admin' | 'superadmin';
    territory?: string | null;
    phone?: string | null;
    contractLink?: string | null;
  }
}
