export const APPLICATIONS_STORAGE_KEY = 'applications'

export type ClubApplicationPayload = {
  club_id: string
  club_name: string
  club_url: string
  student_id: string
  responses: Record<string, unknown>
  submitted_at: string
}

export function getApplications(): ClubApplicationPayload[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveApplication(payload: ClubApplicationPayload): void {
  if (typeof window === 'undefined') return
  const existing = getApplications()
  existing.push(payload)
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(existing))
}

export function getApplicationsByStudentId(studentId: string): ClubApplicationPayload[] {
  const id = String(studentId).trim()
  if (!id) return []
  const all = getApplications()
  return all.filter((a) => String(a.student_id).trim() === id)
}

export function clearApplications(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(APPLICATIONS_STORAGE_KEY)
}

