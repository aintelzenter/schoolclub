import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    error(code, ...metadata) {
      console.error('NextAuth error:', { code, metadata });
    },
    warn(code, ...metadata) {
      console.warn('NextAuth warning:', { code, metadata });
    },
    debug(code, ...metadata) {
      console.debug('NextAuth debug:', { code, metadata });
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // authorization: {
      //   params: {
      //     hd: 'your-school-domain.com', // Replace with your G Suite domain, e.g., 'duke.edu' or 'school.edu'
      //   },
      // },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token, user }) {
      // Attach user ID to session so server routes can identify the user.
      const userId = user?.id ?? token?.sub;

      if (session?.user && userId) {
        session.user.id = userId;
      }

      if (process.env.NODE_ENV !== 'production') {
        console.debug('NextAuth session callback', {
          user,
          token,
          session,
        });
      }

      return session;
    },
    // async signIn({ user, account, profile }) {
    //   const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    //   // Check if user has a profile with year_group
    //   const { data } = await supabase
    //     .from('profiles')
    //     .select('year_group')
    //     .eq('id', user.id)
    //     .single();

    //   if (!data?.year_group) {
    //     // Redirect to profile setup after sign in
    //     return '/profile/setup';
    //   }
    //   return true;
    // },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
};

export default NextAuth(authOptions);