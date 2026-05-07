import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/lib/auth'
import { getClubManagerAccess } from '@/lib/access'

type ProfileRow = {
  id: string
  student_name: string | null
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length >= 2 ? trimmed : null
}

async function authorizeAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const access = await getClubManagerAccess(session.user.email)
  if (!access?.isAdmin) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const }
}

export async function POST(request: Request) {
  const auth = await authorizeAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({})) as { dryRun?: boolean }
  const dryRun = Boolean(body?.dryRun)

  const supabase = getAdminClient()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, student_name')
    .or('student_name.is.null,student_name.eq.')

  if (profilesError) {
    console.error('Failed to fetch profiles for backfill:', profilesError)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }

  const targetProfiles = (profiles ?? []) as ProfileRow[]
  if (targetProfiles.length === 0) {
    return NextResponse.json({
      success: true,
      dryRun,
      candidates: 0,
      updated: 0,
      skipped: 0,
      message: 'No profiles need backfilling.',
    })
  }

  const userById = new Map<string, { id: string; user_metadata?: Record<string, unknown> }>()
  let page = 1
  const perPage = 1000

  while (true) {
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page, perPage })
    if (usersError) {
      console.error('Failed to list auth users for backfill:', usersError)
      return NextResponse.json({ error: 'Failed to read auth users' }, { status: 500 })
    }

    const users = usersData?.users ?? []
    for (const user of users) {
      userById.set(user.id, user)
    }

    if (users.length < perPage) break
    page += 1
  }

  const updates: Array<{ id: string; student_name: string }> = []
  let skipped = 0

  for (const profile of targetProfiles) {
    const authUser = userById.get(profile.id)
    if (!authUser) {
      skipped += 1
      continue
    }

    const candidateName =
      normalizeName(authUser.user_metadata?.full_name) ??
      normalizeName(authUser.user_metadata?.name)

    if (!candidateName) {
      skipped += 1
      continue
    }

    updates.push({ id: profile.id, student_name: candidateName })
  }

  if (!dryRun && updates.length > 0) {
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' })

    if (upsertError) {
      console.error('Failed to backfill student names:', upsertError)
      return NextResponse.json({ error: 'Failed to update profiles' }, { status: 500 })
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    candidates: targetProfiles.length,
    updated: updates.length,
    skipped,
  })
}