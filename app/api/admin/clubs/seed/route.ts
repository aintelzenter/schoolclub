import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import clubsData from '@/data/clubs.json'
import type { Club } from '@/lib/types/club'
import { authOptions } from '@/lib/auth'
import { getClubManagerAccess } from '@/lib/access'
import { clubToRowPayload } from '@/lib/clubs-store'

export const dynamic = 'force-dynamic'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const access = await getClubManagerAccess(session.user.email)
  if (!access?.isAdmin) {
    return NextResponse.json({ error: 'Only admins can initialize clubs data' }, { status: 403 })
  }

  const supabase = getAdminClient()

  const { count, error: countError } = await supabase
    .from('clubs')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    console.error('Clubs seed count failed:', countError)
    return NextResponse.json({ error: 'Failed to inspect clubs table' }, { status: 500 })
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Clubs table is not empty. Initialization skipped.', existingCount: count ?? 0 },
      { status: 409 }
    )
  }

  const seedRows = (clubsData as Club[])
    .filter((club) => club.id !== 'blank')
    .map((club, index) => ({ ...clubToRowPayload(club), sort_order: index }))

  const { error } = await supabase.from('clubs').insert(seedRows)

  if (error) {
    console.error('Clubs seed insert failed:', error)
    return NextResponse.json({ error: 'Failed to initialize clubs data' }, { status: 500 })
  }

  return NextResponse.json({ success: true, seededCount: seedRows.length })
}
