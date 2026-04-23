'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

const YEAR_GROUPS = [
  { value: 7, label: 'Year 7' },
  { value: 8, label: 'Year 8' },
  { value: 9, label: 'Year 9' },
  { value: 10, label: 'Year 10' },
  { value: 11, label: 'Year 11' },
  { value: 12, label: 'Year 12' },
  { value: 13, label: 'Year 13' },
];

export default function ProfileSetup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [yearGroup, setYearGroup] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    // Profile completeness is already enforced by the signIn callback server-side.
    // Nothing to do here on the client.
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if profile is already set up
    checkProfile();
  }, [session, status, router, checkProfile]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !yearGroup) return;

    setLoading(true);
    setError(null);

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year_group: yearGroup }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Failed to save profile. Please try again.');
      console.error('Profile save error:', body);
    } else {
      router.push('/');
    }

    setLoading(false);
  }, [session, yearGroup, router]);

  useEffect(() => {
    if (yearGroup && !loading) {
      // Auto-submit when year group is selected
      handleSubmit({ preventDefault: () => {} } as any);
    }
  }, [yearGroup, loading, handleSubmit]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-deep pt-24 pb-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 mb-2">
                What year group are you in?
              </label>
              <select
                value={yearGroup || ''}
                onChange={(e) => setYearGroup(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                required
              >
                <option value="" disabled>Select your year group</option>
                {YEAR_GROUPS.map((year) => (
                  <option key={year.value} value={year.value} className="text-black">
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !yearGroup}
              className="w-full bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}