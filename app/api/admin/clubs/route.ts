import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/lib/auth'
import { getClubManagerAccess } from '@/lib/access'
import { clubToRowPayload, getClubsFromStore } from '@/lib/clubs-store'
import type { Club, ClubLeader, ClubTeacher } from '@/lib/types/club'

export const dynamic = 'force-dynamic'

type ClubPayload = Partial<Club>

type CreateBody = {
  club?: ClubPayload
}

type UpdateBody = {
  id?: string
  club?: ClubPayload
}

type DeleteBody = {
  id?: string
}

async function authorizeAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const access = await getClubManagerAccess(session.user.email)
  if (!access || (!access.isAdmin && !access.isTeacher)) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const, access }
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function sanitizeLeaders(value: ClubLeader[] | undefined, fallback: ClubLeader[] = []): ClubLeader[] {
  if (!Array.isArray(value)) return fallback
  return value
    .filter((leader) => leader && typeof leader.name === 'string' && typeof leader.email === 'string')
    .map((leader) => ({
      name: leader.name.trim(),
      year: leader.year == null ? null : String(leader.year).trim() || null,
      email: leader.email.trim(),
      student_id: leader.student_id?.trim() || undefined,
    }))
}

function sanitizeTeachers(value: ClubTeacher[] | undefined, fallback: ClubTeacher[] = []): ClubTeacher[] {
  if (!Array.isArray(value)) return fallback
  return value
    .filter((teacher) => teacher && typeof teacher.name === 'string' && typeof teacher.email === 'string')
    .map((teacher) => ({
      name: teacher.name.trim(),
      email: teacher.email.trim(),
    }))
}

function sanitizeClub(input: ClubPayload, previous?: Club): Club {
  const prev = previous

  const images = Array.isArray(input.images)
    ? input.images.map((img) => String(img).trim()).filter(Boolean)
    : prev?.images ?? []

  const normalizedId = normalizeId(input.id ?? prev?.id ?? '')

  return {
    id: normalizedId,
    name: String(input.name ?? prev?.name ?? '').trim(),
    displayName: String(input.displayName ?? prev?.displayName ?? '').trim() || undefined,
    summary: String(input.summary ?? prev?.summary ?? '').trim() || undefined,
    tagline: String(input.tagline ?? prev?.tagline ?? '').trim(),
    description: String(input.description ?? prev?.description ?? '').trim(),
    meetingDay: String(input.meetingDay ?? prev?.meetingDay ?? '').trim(),
    meetingTime: String(input.meetingTime ?? prev?.meetingTime ?? '').trim(),
    location: String(input.location ?? prev?.location ?? '').trim(),
    yearGroup: String(input.yearGroup ?? prev?.yearGroup ?? '').trim(),
    yearGroupMin: Number(input.yearGroupMin ?? prev?.yearGroupMin ?? 7),
    yearGroupMax: Number(input.yearGroupMax ?? prev?.yearGroupMax ?? 13),
    photoFolder: String(input.photoFolder ?? prev?.photoFolder ?? '').trim() || undefined,
    leaders: sanitizeLeaders(input.leaders, prev?.leaders ?? []),
    teachers: sanitizeTeachers(input.teachers, prev?.teachers ?? []),
    contact: String(input.contact ?? prev?.contact ?? '').trim(),
    specialConditions: String(input.specialConditions ?? prev?.specialConditions ?? '').trim() || null,
    questions: Array.isArray(input.questions) ? input.questions : prev?.questions ?? [],
    roles: Array.isArray(input.roles)
      ? input.roles.map((role) => String(role).trim()).filter(Boolean)
      : prev?.roles ?? [],
    accepting: typeof input.accepting === 'boolean' ? input.accepting : (prev?.accepting ?? true),
    image: String(input.image ?? prev?.image ?? images[0] ?? '').trim(),
    images,
    applicationQuestionsRaw:
      String(input.applicationQuestionsRaw ?? prev?.applicationQuestionsRaw ?? '').trim() || null,
  }
}

export async function GET() {
  const auth = await authorizeAdmin()
  if (!auth.ok) return auth.response

  const clubs = await getClubsFromStore()
  const visibleClubs = auth.access.isAdmin
    ? clubs.filter((club) => club.id !== 'blank')
    : clubs.filter((club) => club.id !== 'blank' && auth.access.managedClubIds.includes(club.id))

  return NextResponse.json(visibleClubs)
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdmin()
  if (!auth.ok) return auth.response
  if (!auth.access.isAdmin) {
    return NextResponse.json({ error: 'Only admins can create clubs' }, { status: 403 })
  }

  const body = (await request.json()) as CreateBody
  const rawClub = body.club ?? {}
  const newClub = sanitizeClub(rawClub)

  if (!newClub.id || !newClub.name) {
    return NextResponse.json({ error: 'Club id and name are required' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const existingClubs = await getClubsFromStore()
  if (existingClubs.some((club) => club.id === newClub.id)) {
    return NextResponse.json({ error: 'Club id already exists' }, { status: 409 })
  }

  const { error } = await supabase.from('clubs').insert({
    ...clubToRowPayload(newClub),
    sort_order: existingClubs.length,
  })

  if (error) {
    console.error('Admin clubs POST failed:', error)
    return NextResponse.json({ error: 'Failed to create club' }, { status: 500 })
  }

  return NextResponse.json(newClub, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeAdmin()
  if (!auth.ok) return auth.response

  const body = (await request.json()) as UpdateBody
  const id = normalizeId(String(body.id ?? ''))
  if (!id) {
    return NextResponse.json({ error: 'Club id is required' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const clubs = await getClubsFromStore()
  const index = clubs.findIndex((club) => club.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 })
  }

  if (!auth.access.isAdmin && !auth.access.managedClubIds.includes(id)) {
    return NextResponse.json({ error: 'You can only update your assigned clubs' }, { status: 403 })
  }

  const updatedClub = sanitizeClub(body.club ?? {}, clubs[index])
  if (!updatedClub.id || !updatedClub.name) {
    return NextResponse.json({ error: 'Club id and name are required' }, { status: 400 })
  }

  if (updatedClub.id !== id && clubs.some((club) => club.id === updatedClub.id)) {
    return NextResponse.json({ error: 'Updated club id already exists' }, { status: 409 })
  }

  if (!auth.access.isAdmin && updatedClub.id !== id) {
    return NextResponse.json({ error: 'Teachers cannot change club ids' }, { status: 403 })
  }

  const { error } = await supabase
    .from('clubs')
    .update(clubToRowPayload(updatedClub))
    .eq('id', id)

  if (error) {
    console.error('Admin clubs PATCH failed:', error)
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 })
  }

  return NextResponse.json(updatedClub)
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeAdmin()
  if (!auth.ok) return auth.response
  if (!auth.access.isAdmin) {
    return NextResponse.json({ error: 'Only admins can delete clubs' }, { status: 403 })
  }

  const body = (await request.json()) as DeleteBody
  const id = normalizeId(String(body.id ?? ''))
  if (!id || id === 'blank') {
    return NextResponse.json({ error: 'Valid club id is required' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const clubs = await getClubsFromStore()
  const target = clubs.find((club) => club.id === id)
  if (!target) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 })
  }

  const { error } = await supabase.from('clubs').delete().eq('id', id)
  if (error) {
    console.error('Admin clubs DELETE failed:', error)
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 })
  }

  return NextResponse.json({ success: true, deleted: target })
}
