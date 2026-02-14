import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  // Primary auth is handled by Supabase Auth.
  // NextAuth is kept only for SessionProvider compatibility.
  // No CredentialsProvider - all auth flows go through Supabase OAuth.
  providers: [],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
};