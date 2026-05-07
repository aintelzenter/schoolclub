'use client'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { Club, ClubLeader, ClubTeacher } from '@/lib/types/club'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ClubFormState = {
  id: string
  name: string
  displayName: string
  summary: string
  tagline: string
  description: string
  meetingDay: string
  meetingTime: string
  location: string
  yearGroup: string
  yearGroupMin: string
  yearGroupMax: string
  photoFolder: string
  contact: string
  specialConditions: string
  applicationQuestionsRaw: string
  roles: string
  image: string
  images: string
  leaders: string
  teachers: string
  accepting: boolean
}

const emptyForm: ClubFormState = {
  id: '',
  name: '',
  displayName: '',
  summary: '',
  tagline: '',
  description: '',
  meetingDay: '',
  meetingTime: '',
  location: '',
  yearGroup: '',
  yearGroupMin: '7',
  yearGroupMax: '13',
  photoFolder: '',
  contact: '',
  specialConditions: '',
  applicationQuestionsRaw: '',
  roles: '',
  image: '',
  images: '',
  leaders: '',
  teachers: '',
  accepting: true,
}

function parseLeaders(value: string): ClubLeader[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', year = '', email = '', studentId = ''] = line.split('|').map((part) => part.trim())
      return {
        name,
        year: year || null,
        email,
        student_id: studentId || undefined,
      }
    })
    .filter((leader) => leader.name && leader.email)
}

function parseTeachers(value: string): ClubTeacher[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', email = ''] = line.split('|').map((part) => part.trim())
      return { name, email }
    })
    .filter((teacher) => teacher.name && teacher.email)
}

function clubToForm(club: Club): ClubFormState {
  return {
    id: club.id,
    name: club.name,
    displayName: club.displayName ?? '',
    summary: club.summary ?? '',
    tagline: club.tagline,
    description: club.description,
    meetingDay: club.meetingDay,
    meetingTime: club.meetingTime,
    location: club.location,
    yearGroup: club.yearGroup,
    yearGroupMin: String(club.yearGroupMin ?? 7),
    yearGroupMax: String(club.yearGroupMax ?? 13),
    photoFolder: club.photoFolder ?? '',
    contact: club.contact,
    specialConditions: club.specialConditions ?? '',
    applicationQuestionsRaw: club.applicationQuestionsRaw ?? '',
    roles: (club.roles ?? []).join(', '),
    image: club.image,
    images: (club.images ?? []).join('\n'),
    leaders: (club.leaders ?? [])
      .map((leader) => [leader.name, leader.year ?? '', leader.email, leader.student_id ?? ''].join('|'))
      .join('\n'),
    teachers: (club.teachers ?? []).map((teacher) => [teacher.name, teacher.email].join('|')).join('\n'),
    accepting: club.accepting,
  }
}

function formToPayload(form: ClubFormState): Partial<Club> {
  const roles = form.roles
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)

  const images = form.images
    .split('\n')
    .map((img) => img.trim())
    .filter(Boolean)

  return {
    id: form.id,
    name: form.name,
    displayName: form.displayName || undefined,
    summary: form.summary || undefined,
    tagline: form.tagline,
    description: form.description,
    meetingDay: form.meetingDay,
    meetingTime: form.meetingTime,
    location: form.location,
    yearGroup: form.yearGroup,
    yearGroupMin: Number(form.yearGroupMin || 7),
    yearGroupMax: Number(form.yearGroupMax || 13),
    photoFolder: form.photoFolder || undefined,
    contact: form.contact,
    specialConditions: form.specialConditions || null,
    applicationQuestionsRaw: form.applicationQuestionsRaw || null,
    roles,
    image: form.image,
    images,
    leaders: parseLeaders(form.leaders),
    teachers: parseTeachers(form.teachers),
    accepting: form.accepting,
  }
}

function normalizeId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default function AdminClubsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [clubs, setClubs] = useState<Club[]>([])
  const [access, setAccess] = useState<{ isAdmin: boolean; isTeacher: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [reseeding, setReseeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState<ClubFormState>(emptyForm)

  const selectedClub = useMemo(
    () => (selectedId ? clubs.find((club) => club.id === selectedId) ?? null : null),
    [selectedId, clubs]
  )

  const loadClubs = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [accessRes, clubsRes] = await Promise.all([
      fetch('/api/access', { cache: 'no-store' }),
      fetch('/api/admin/clubs', { cache: 'no-store' }),
    ])

    if (accessRes.ok) {
      const accessData = await accessRes.json()
      setAccess({
        isAdmin: Boolean(accessData?.isAdmin),
        isTeacher: Boolean(accessData?.isTeacher),
      })
    }

    if (clubsRes.status === 401) {
      router.push('/auth/signin')
      return
    }

    if (clubsRes.status === 403) {
      setError('You are signed in, but your account is not allowed to manage clubs.')
      setLoading(false)
      return
    }

    if (!clubsRes.ok) {
      setError('Failed to load clubs.')
      setLoading(false)
      return
    }

    const data = (await clubsRes.json()) as Club[]
    setClubs(data)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    void loadClubs()
  }, [session, status, router, loadClubs])

  function startCreate() {
    if (!access?.isAdmin) return
    setIsNew(true)
    setSelectedId(null)
    setForm(emptyForm)
    setError(null)
    setSuccess(null)
  }

  function startEdit(club: Club) {
    setIsNew(false)
    setSelectedId(club.id)
    setForm(clubToForm(club))
    setError(null)
    setSuccess(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const normalizedId = normalizeId(form.id)
    if (!normalizedId || !form.name.trim()) {
      setError('Club ID and Name are required.')
      setSaving(false)
      return
    }

    const payload = formToPayload({ ...form, id: normalizedId })

    const res = await fetch('/api/admin/clubs', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? { club: payload } : { id: selectedId, club: payload }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to save club.')
      setSaving(false)
      return
    }

    const saved = (await res.json()) as Club

    setClubs((prev) => {
      if (isNew) return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name))
      return prev.map((club) => (club.id === selectedId ? saved : club)).sort((a, b) => a.name.localeCompare(b.name))
    })

    setIsNew(false)
    setSelectedId(saved.id)
    setForm(clubToForm(saved))
    setSuccess(`Saved ${saved.name}.`)
    setSaving(false)
  }

  async function handleDelete() {
    if (!selectedClub) return

    const confirmed = window.confirm(`Delete ${selectedClub.name}? This cannot be undone.`)
    if (!confirmed) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/admin/clubs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedClub.id }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to delete club.')
      setSaving(false)
      return
    }

    setClubs((prev) => prev.filter((club) => club.id !== selectedClub.id))
    setSelectedId(null)
    setForm(emptyForm)
    setSuccess(`Deleted ${selectedClub.name}.`)
    setSaving(false)
  }

  async function handleInitializeClubsTable() {
    setInitializing(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/admin/clubs/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error ?? 'Failed to initialize clubs table.')
      setInitializing(false)
      return
    }

    setSuccess(`Initialized clubs table with ${body.seededCount ?? 0} clubs.`)
    await loadClubs()
    setInitializing(false)
  }

  async function handleReseedClubsTable() {
    const confirmed = window.confirm(
      'Reseed all clubs from data/clubs.json? This will overwrite matching records in Supabase.'
    )
    if (!confirmed) return

    setReseeding(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/admin/clubs/reseed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error ?? 'Failed to reseed clubs table.')
      setReseeding(false)
      return
    }

    setSuccess(`Reseeded ${body.reseededCount ?? 0} clubs from JSON.`)
    await loadClubs()
    setReseeding(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-deep pt-24 pb-12">
      <Container>
        <div className="space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">Club Management</h1>
              <p className="text-white/70 mt-2">
                {access?.isAdmin
                  ? 'Create, edit, and delete club records.'
                  : 'Update information for the clubs assigned to you.'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button href="/admin/applications" variant="outline">Go to Applications</Button>
              {access?.isAdmin && (
                <Button
                  onClick={handleInitializeClubsTable}
                  variant="outline"
                  disabled={initializing || reseeding || saving}
                >
                  {initializing ? 'Initializing...' : 'Initialize Clubs Table'}
                </Button>
              )}
              {access?.isAdmin && (
                <Button
                  onClick={handleReseedClubsTable}
                  variant="outline"
                  disabled={reseeding || initializing || saving}
                >
                  {reseeding ? 'Reseeding...' : 'Reseed (Upsert)'}
                </Button>
              )}
              {access?.isAdmin && <Button onClick={startCreate}>New Club</Button>}
            </div>
          </header>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-300">{success}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2 max-h-[70vh] overflow-auto">
              {clubs
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((club) => (
                  <button
                    key={club.id}
                    className={`w-full text-left rounded-lg px-3 py-2 border ${selectedId === club.id ? 'border-brand-pink bg-white/10' : 'border-transparent hover:border-white/15 hover:bg-white/5'}`}
                    onClick={() => startEdit(club)}
                  >
                    <div className="text-white font-medium">{club.name}</div>
                    <div className="text-white/50 text-xs">{club.id}</div>
                  </button>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-4">
              <h2 className="text-xl text-white font-semibold">{isNew ? 'Create Club' : selectedClub ? `Edit ${selectedClub.name}` : 'Select a club to edit'}</h2>

              {(isNew || selectedClub) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1 md:col-span-1">
                    <span className="text-white/70 text-sm">Club ID</span>
                    <input
                      value={form.id}
                      onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                      placeholder="interact-club"
                      disabled={!isNew && !access?.isAdmin}
                    />
                  </label>

                  <label className="space-y-1 md:col-span-1">
                    <span className="text-white/70 text-sm">Name</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-1">
                    <span className="text-white/70 text-sm">Display Name</span>
                    <input
                      value={form.displayName}
                      onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-1">
                    <span className="text-white/70 text-sm">Summary</span>
                    <input
                      value={form.summary}
                      onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Tagline</span>
                    <input
                      value={form.tagline}
                      onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Description</span>
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Meeting Day</span>
                    <input
                      value={form.meetingDay}
                      onChange={(e) => setForm((prev) => ({ ...prev, meetingDay: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Meeting Time</span>
                    <input
                      value={form.meetingTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, meetingTime: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Location</span>
                    <input
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Year Group (label)</span>
                    <input
                      value={form.yearGroup}
                      onChange={(e) => setForm((prev) => ({ ...prev, yearGroup: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                      placeholder="Y7-13"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Year Min</span>
                    <input
                      value={form.yearGroupMin}
                      onChange={(e) => setForm((prev) => ({ ...prev, yearGroupMin: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Year Max</span>
                    <input
                      value={form.yearGroupMax}
                      onChange={(e) => setForm((prev) => ({ ...prev, yearGroupMax: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Photo Folder</span>
                    <input
                      value={form.photoFolder}
                      onChange={(e) => setForm((prev) => ({ ...prev, photoFolder: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-white/70 text-sm">Main Image</span>
                    <input
                      value={form.image}
                      onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                      placeholder="/clubs/PHOTOS/..."
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">All Images (one URL per line)</span>
                    <textarea
                      rows={4}
                      value={form.images}
                      onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Leaders (one per line: name|year|email|student_id)</span>
                    <textarea
                      rows={4}
                      value={form.leaders}
                      onChange={(e) => setForm((prev) => ({ ...prev, leaders: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Teachers (one per line: name|email)</span>
                    <textarea
                      rows={3}
                      value={form.teachers}
                      onChange={(e) => setForm((prev) => ({ ...prev, teachers: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Contact Notes</span>
                    <textarea
                      rows={3}
                      value={form.contact}
                      onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Special Conditions</span>
                    <textarea
                      rows={3}
                      value={form.specialConditions}
                      onChange={(e) => setForm((prev) => ({ ...prev, specialConditions: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Application Questions (raw text)</span>
                    <textarea
                      rows={4}
                      value={form.applicationQuestionsRaw}
                      onChange={(e) => setForm((prev) => ({ ...prev, applicationQuestionsRaw: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-white/70 text-sm">Roles (comma-separated)</span>
                    <input
                      value={form.roles}
                      onChange={(e) => setForm((prev) => ({ ...prev, roles: e.target.value }))}
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2 flex items-center gap-2 text-white/80 text-sm">
                    <input
                      type="checkbox"
                      checked={form.accepting}
                      onChange={(e) => setForm((prev) => ({ ...prev, accepting: e.target.checked }))}
                    />
                    Accepting applications
                  </label>
                </div>
              )}

              {(isNew || selectedClub) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Club'}</Button>
                  {access?.isAdmin && !isNew && (
                    <Button onClick={handleDelete} disabled={saving} className="bg-rose-600 hover:bg-rose-500">
                      Delete Club
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
