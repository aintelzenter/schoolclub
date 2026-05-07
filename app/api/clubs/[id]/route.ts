import { NextResponse } from 'next/server'
import { getClubByIdFromStore } from '@/lib/clubs-store'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, context: { params: { id: string } }) {
  const club = await getClubByIdFromStore(context.params.id)
  if (!club) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(club)
}
