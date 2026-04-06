import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// DEBUG: Log env vars used by NextAuth (avoid leaking in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('NextAuth GOOGLE_CLIENT_ID length:', process.env.GOOGLE_CLIENT_ID?.length);
  console.log('NextAuth GOOGLE_CLIENT_SECRET length:', process.env.GOOGLE_CLIENT_SECRET?.length);
  console.log('NextAuth NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('NextAuth providers:', authOptions.providers?.map((p) => p.id));
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };