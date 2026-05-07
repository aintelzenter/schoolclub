import { NextResponse } from 'next/server'
import { getClubsFromStore } from '@/lib/clubs-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clubs = await getClubsFromStore()
  return NextResponse.json(clubs)
}
