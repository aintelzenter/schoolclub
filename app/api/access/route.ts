import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getClubManagerAccess } from '@/lib/access'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ isAdmin: false, isTeacher: false, managedClubIds: [] })
  }

  const access = await getClubManagerAccess(session.user.email)

  return NextResponse.json({
    isAdmin: access?.isAdmin ?? false,
    isTeacher: access?.isTeacher ?? false,
    managedClubIds: access?.managedClubIds ?? [],
  })
}
