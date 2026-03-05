
import type { ClubApplicationPayload } from '@/lib/applications'

const getBaseUrl = () =>
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api'

export type ApiClub = {
  club_id: string
  club_name: string
  year_groups?: string
}

export type ApiFormQuestion = {
  key: string
  label: string
  type: string
  required: boolean
}

export type ApiClubForm = {
  questions: ApiFormQuestion[]
  year_groups?: string
}

export type ApplyRequestBody = {
  student_id: string
  responses: Record<string, string>
}

export type ApplySuccess = { code: 'OK' }

export type ApiApplication = {
  club_id: string
  club_name: string
  club_url?: string
  student_id: string
  responses: Record<string, unknown>
  submitted_at: string
}

export type ApiError = {
  code: string
  message?: string
  details?: unknown
}

async function handleResponse<T>(res: Response, parseJson = true): Promise<T> {
  const body = parseJson ? await res.json().catch(() => ({})) : undefined
  if (!res.ok) {
    const err: ApiError = typeof body === 'object' && body && 'code' in body
      ? (body as ApiError)
      : { code: 'UNKNOWN', message: res.statusText || 'Request failed' }
    throw { status: res.status, ...err }
  }
  return (parseJson ? body : undefined) as T
}

// Frontend slug → backend club_id (snake_case)
export const BACKEND_CLUB_ID_MAP: Record<string, string> = {
  'operation-smile': 'operation_smile',
  'school-show': 'school_show',
  mun: 'mun',
  'spark-club': 'spark_club',
  'interact-club': 'interact_club',
  'eco-committee': 'eco_committee',
  'duke-of-edinburgh': 'duke_of_edinburgh',
  'unicef-ambassador': 'unicef_ambassador',
  tedx: 'tedx',
}

const SLUG_BY_BACKEND_ID: Record<string, string> = Object.fromEntries(
  (Object.entries(BACKEND_CLUB_ID_MAP) as [string, string][]).map(([slug, id]) => [id, slug])
)

function getBackendClubId(slug: string): string {
  return BACKEND_CLUB_ID_MAP[slug] ?? slug
}

function toFrontendSlug(backendClubId: string): string {
  return SLUG_BY_BACKEND_ID[backendClubId] ?? backendClubId.replace(/_/g, '-')
}

/** GET /api/clubs */
export async function fetchClubs(): Promise<ApiClub[]> {
  const res = await fetch(`${getBaseUrl()}/clubs`, { cache: 'no-store' })
  return handleResponse<ApiClub[]>(res)
}

export async function fetchClubForm(clubId: string): Promise<ApiClubForm> {
  const res = await fetch(`${getBaseUrl()}/clubs/${encodeURIComponent(clubId)}/form`, {
    cache: 'no-store',
  })
  return handleResponse<ApiClubForm>(res)
}

export async function submitApplication(
  clubId: string,
  body: ApplyRequestBody
): Promise<ApplySuccess> {
  const backendId = getBackendClubId(clubId)
  const res = await fetch(`${getBaseUrl()}/clubs/${encodeURIComponent(backendId)}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<ApplySuccess>(res)
}

export async function fetchStudentApplications(studentId: string): Promise<ClubApplicationPayload[]> {
  const id = String(studentId).trim()
  if (!id) return []
  const res = await fetch(
    `${getBaseUrl()}/students/${encodeURIComponent(id)}/applications`,
    { cache: 'no-store' }
  )
  if (res.status === 404) return []
  const data = await handleResponse<ApiApplication[] | { applications?: ApiApplication[] }>(res)
  const list = Array.isArray(data) ? data : data?.applications ?? []
  return list.map((app): ClubApplicationPayload => ({
    club_id: toFrontendSlug(app.club_id),
    club_name: app.club_name,
    club_url: app.club_url ?? `/clubs/${toFrontendSlug(app.club_id)}`,
    student_id: app.student_id,
    responses: app.responses ?? {},
    submitted_at: app.submitted_at,
  }))
}

export const APPLY_ERROR_MESSAGES: Record<string, string> = {
  CLUB_NOT_FOUND: 'This club was not found.',
  STUDENT_ID_NOT_FOUND: 'This student ID does not exist.',
  YEAR_GROUP_NOT_ELIGIBLE: 'Your year group is not allowed.',
  YEAR_NOT_ALLOWED: 'Your year group is not allowed.',
  ALREADY_APPLIED: 'You already applied.',
  INVALID_RESPONSES: 'Please check your answers and fill in all required fields.',
}

export function getApplyErrorMessage(code: string, message?: string): string {
  return APPLY_ERROR_MESSAGES[code] ?? message ?? `Something went wrong (${code}).`
}
