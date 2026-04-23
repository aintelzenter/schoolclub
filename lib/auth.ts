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
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Look up or create a Supabase auth user matching this Google account.
      // This avoids signInWithIdToken which requires nonce/audience alignment.
      const email = user.email!
      let supabaseUserId: string

      const { data: userList, error: lookupError } =
        await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

      if (lookupError) {
        console.error('Supabase admin listUsers failed:', lookupError)
        const reason = encodeURIComponent(lookupError.message ?? 'Unknown error')
        return `/auth/signin?error=ProfileLookup&reason=${reason}`
      }

      const existingUser = userList?.users?.find((u) => u.email === email)

      if (existingUser?.id) {
        supabaseUserId = existingUser.id
      } else {
        // First sign-in: create a Supabase auth user for this Google account.
        const { data: newUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              full_name: user.name,
              avatar_url: user.image,
              provider: 'google',
            },
          })
        if (createError || !newUser?.user?.id) {
          console.error('Failed to create Supabase user:', createError)
          const reason = encodeURIComponent(createError?.message ?? 'Unknown error')
          return `/auth/signin?error=SupabaseOAuth&reason=${reason}`
        }
        supabaseUserId = newUser.user.id
      }

      // Attach Supabase UUID to the NextAuth user so the JWT/session callbacks
      // can store it in the token. Profile completeness is checked client-side
      // after sign-in so that a proper session is always created.
      user.id = supabaseUserId

      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
};

export default NextAuth(authOptions);