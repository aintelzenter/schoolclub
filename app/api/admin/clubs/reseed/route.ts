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
    return NextResponse.json({ error: 'Only admins can reseed clubs data' }, { status: 403 })
  }

  const supabase = getAdminClient()

  const rows = (clubsData as Club[])
    .filter((club) => club.id !== 'blank')
    .map((club, index) => ({
      ...clubToRowPayload(club),
      sort_order: index,
    }))

  const { error } = await supabase.from('clubs').upsert(rows, { onConflict: 'id' })

  if (error) {
    console.error('Clubs reseed upsert failed:', error)
    return NextResponse.json({ error: 'Failed to reseed clubs data' }, { status: 500 })
  }

  return NextResponse.json({ success: true, reseededCount: rows.length })
}
