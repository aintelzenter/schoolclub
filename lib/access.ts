import { isAdminEmail } from '@/lib/admin'
import { getClubsFromStore } from '@/lib/clubs-store'
import type { Club } from '@/lib/types/club'

export type ClubManagerAccess = {
  email: string
  isAdmin: boolean
  isTeacher: boolean
  managedClubIds: string[]
}

export async function getManagedClubIdsForEmail(email?: string | null): Promise<string[]> {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) return []

  const clubs = (await getClubsFromStore()) as Club[]
  return clubs
    .filter((club) => club.id !== 'blank')
    .filter((club) =>
      Array.isArray(club.teachers) && club.teachers.some((teacher) => teacher.email?.trim().toLowerCase() === normalizedEmail)
    )
    .map((club) => club.id)
}

export async function getClubManagerAccess(email?: string | null): Promise<ClubManagerAccess | null> {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) return null

  const admin = isAdminEmail(normalizedEmail)
  const managedClubIds = await getManagedClubIdsForEmail(normalizedEmail)
  const teacher = managedClubIds.length > 0

  return {
    email: normalizedEmail,
    isAdmin: admin,
    isTeacher: teacher,
    managedClubIds: admin ? [] : managedClubIds,
  }
}

export function canManageAnyClub(email?: string | null): boolean {
  throw new Error('Use getClubManagerAccess(email) in async server contexts')
}

export function canManageClub(email: string | null | undefined, clubId: string): boolean {
  void clubId
  throw new Error('Use getClubManagerAccess(email) in async server contexts')
}
