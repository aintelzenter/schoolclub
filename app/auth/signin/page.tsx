'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient as supabase } from '@/lib/supabase';

export default function SignIn() {
  const router = useRouter();
  const [errorFromQuery, setErrorFromQuery] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        // Check if profile is complete
        const { data } = await supabase
          .from('profiles')
          .select('year_group')
          .eq('id', session.user.id)
          .single();

        if (data?.year_group) {
          router.push('/');
        } else {
          router.push('/profile/setup');
        }
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setErrorFromQuery(params.get('error'))
  }, [])

  const getErrorMessage = (error: string | null) => {
    if (!error) return null
    const map: Record<string, string> = {
      Callback:
        'There was a problem completing authentication (callback mismatch). Try again or clear your cookies.',
      OAuthCallback:
        'The OAuth provider returned an unexpected response. Ensure your credentials are correct.',
      OAuthSignin:
        'Failed to sign in with the OAuth provider. Check your provider configuration.',
      OAuthAccountNotLinked:
        'An account with this email already exists. Try signing in with the original method.',
      google:
        'Google sign-in failed. Verify your Google OAuth client ID, secret, and redirect URI are configured for http://localhost:3000/api/auth/callback/google.',
      EmailSignin: 'There was a problem sending the email. Check your email address.',
      CredentialsSignin: 'Sign in failed. Check your credentials.',
      SessionRequired: 'A session is required. Please sign in again.',
    }
    return map[error] ?? error
  }

  const handleSignIn = async () => {
    // Let NextAuth handle redirects and errors. With `redirect: true` (default),
    // it will send the browser to the provider and return to our error-handling
    // route on failure.
    await signIn('google')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-deep">
      <div className="bg-white p-8 rounded-lg shadow-lg text-black">
        <h1 className="text-2xl font-bold mb-4">Sign In with Google</h1>
        <p className="mb-4 text-sm text-gray-600">You can sign in using any Google account for testing.</p>
        {errorFromQuery && (
          <div className="mb-4 text-sm text-red-600">
            Error: {getErrorMessage(errorFromQuery)}
          </div>
        )}
        <button
          onClick={handleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}