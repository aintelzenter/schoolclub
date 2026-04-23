'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import clubs from '@/data/clubs.json';

type PendingApplication = {
  id: string;
  user_id: string;
  club_id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  reviewed_at?: string | null;
  notes?: string | null;
};

function prettyClubName(clubId: string): string {
  return clubId.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<PendingApplication[]>([]);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');
  const [exportYearGroup, setExportYearGroup] = useState<number>(7);
  const [exportClubId, setExportClubId] = useState<string>(clubs[0]?.id ?? '');
  const [exportStatusScope, setExportStatusScope] = useState<'pending' | 'all'>('pending');

  const sessionEmail = useMemo(() => session?.user?.email ?? '', [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    void fetchPending();
  }, [session, status, router]);

  async function fetchPending() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch('/api/admin/applications', { cache: 'no-store' });

    if (res.status === 401) {
      router.push('/auth/signin');
      return;
    }

    if (res.status === 403) {
      setError('You are signed in, but your account is not allowed to access admin approvals.');
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError('Failed to load pending applications.');
      setLoading(false);
      return;
    }

    const data = (await res.json()) as PendingApplication[];
    setItems(data);
    setSelectedIds(new Set());
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: 'approved' | 'rejected') {
    setSavingId(id);
    setError(null);
    setSuccess(null);

    const target = items.find((item) => item.id === id);

    const res = await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: newStatus,
        notes: notesById[id] ?? '',
      }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? 'Failed to update application.');
      setSavingId(null);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    const clubName = target ? prettyClubName(target.club_id) : 'application';
    const outcome = newStatus === 'approved' ? 'approved' : 'rejected';
    setSuccess(`Application for ${clubName} was ${outcome}. Notification emails were queued.`);
    setSavingId(null);
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  async function handleBulkUpdate(status: 'approved' | 'rejected') {
    if (selectedIds.size === 0) return;

    setBulkLoading(true);
    setError(null);
    setSuccess(null);

    const ids = Array.from(selectedIds);

    const res = await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids,
        status,
        notes: bulkNotes,
      }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? 'Bulk update failed.');
      setBulkLoading(false);
      return;
    }

    const payload = await res.json();
    const updatedCount = Number(payload.updatedCount ?? ids.length);
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    setBulkNotes('');
    setSuccess(`${updatedCount} application(s) were ${status}. Notification emails were queued.`);
    setBulkLoading(false);
  }

  function downloadYearCsv() {
    window.open(
      `/api/admin/applications/export?groupBy=year&yearGroup=${exportYearGroup}&statusScope=${exportStatusScope}`,
      '_blank'
    );
  }

  function downloadClubCsv() {
    if (!exportClubId) return;
    window.open(
      `/api/admin/applications/export?groupBy=club&clubId=${encodeURIComponent(exportClubId)}&statusScope=${exportStatusScope}`,
      '_blank'
    );
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-deep pt-24 pb-12">
      <Container size="narrow">
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold text-white">Admin Applications</h1>
            <p className="text-white/70 mt-2">Review pending club requests and approve or reject them.</p>
            <p className="text-white/50 text-sm mt-1">Signed in as: {sessionEmail || 'Unknown user'}</p>
          </header>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-300">
              {success}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">Bulk Actions</h2>
            <p className="text-white/70 text-sm">
              Select multiple pending applications, then approve or reject them together.
            </p>

            <div>
              <label className="block text-white/70 text-sm mb-2">Bulk Notes</label>
              <textarea
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                placeholder="Optional note applied to all selected applications"
                rows={2}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-white/80 text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedIds.size === items.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="h-4 w-4"
                />
                Select all
              </label>
              <span className="text-white/60 text-sm">{selectedIds.size} selected</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleBulkUpdate('approved')}
                disabled={bulkLoading || selectedIds.size === 0}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {bulkLoading ? 'Processing...' : 'Bulk Approve'}
              </Button>
              <Button
                onClick={() => handleBulkUpdate('rejected')}
                disabled={bulkLoading || selectedIds.size === 0}
                className="bg-rose-600 hover:bg-rose-500"
              >
                {bulkLoading ? 'Processing...' : 'Bulk Reject'}
              </Button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white">CSV Downloads</h2>
            <p className="text-white/70 text-sm">
              Download application CSV files grouped by year group or by club.
            </p>

            <div className="space-y-2">
              <label className="block text-white/70 text-sm">Status Scope</label>
              <select
                value={exportStatusScope}
                onChange={(e) => setExportStatusScope(e.target.value === 'all' ? 'all' : 'pending')}
                className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white w-full md:max-w-xs"
              >
                <option value="pending" className="text-black">Pending only</option>
                <option value="all" className="text-black">All statuses</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-white/70 text-sm">By Year Group</label>
                <div className="flex gap-2">
                  <select
                    value={exportYearGroup}
                    onChange={(e) => setExportYearGroup(Number(e.target.value))}
                    className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white w-full"
                  >
                    {[7, 8, 9, 10, 11, 12, 13].map((year) => (
                      <option key={year} value={year} className="text-black">Year {year}</option>
                    ))}
                  </select>
                  <Button onClick={downloadYearCsv} variant="outline">Download</Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-white/70 text-sm">By Club</label>
                <div className="flex gap-2">
                  <select
                    value={exportClubId}
                    onChange={(e) => setExportClubId(e.target.value)}
                    className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white w-full"
                  >
                    {clubs
                      .filter((club) => club.id !== 'blank')
                      .map((club) => (
                        <option key={club.id} value={club.id} className="text-black">{club.name}</option>
                      ))}
                  </select>
                  <Button onClick={downloadClubCsv} variant="outline" disabled={!exportClubId}>Download</Button>
                </div>
              </div>
            </div>
          </div>

          {!error && items.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-white/70">
              No pending applications.
            </div>
          )}

          <div className="space-y-4">
            {items.map((item) => {
              const isSaving = savingId === item.id;

              return (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
                    <label className="text-white/80 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => toggleSelect(item.id, e.target.checked)}
                        className="h-4 w-4"
                      />
                      Select
                    </label>
                    <div><span className="text-white/50">Club:</span> {prettyClubName(item.club_id)}</div>
                    <div><span className="text-white/50">User ID:</span> {item.user_id}</div>
                    <div><span className="text-white/50">Applied:</span> {new Date(item.applied_at).toLocaleString()}</div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Admin Notes</label>
                    <textarea
                      value={notesById[item.id] ?? item.notes ?? ''}
                      onChange={(e) =>
                        setNotesById((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Optional notes shown to the student"
                      rows={3}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/60"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => updateStatus(item.id, 'approved')}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      {isSaving ? 'Saving...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => updateStatus(item.id, 'rejected')}
                      disabled={isSaving}
                      className="bg-rose-600 hover:bg-rose-500"
                    >
                      {isSaving ? 'Saving...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
