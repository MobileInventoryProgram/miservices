import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'franchisee' | 'admin';
    franchiseeId?: string | null;
    territory?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'franchisee' | 'admin';
    franchiseeId?: string | null;
    territory?: string | null;
  }
}
