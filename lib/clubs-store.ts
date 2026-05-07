import { createClient } from '@supabase/supabase-js'
import clubsData from '@/data/clubs.json'
import type { Club } from '@/lib/types/club'

const BLANK_PLACEHOLDER_ID = 'blank'

const PINNED_ORDER: string[] = [
  'duke-of-edinburgh',
  'school-show',
  'tedx',
  'mun',
  'operation-smile',
  'interact-club',
]

type ClubRow = {
  id: string
  name: string
  display_name: string | null
  summary: string | null
  tagline: string
  description: string
  meeting_day: string
  meeting_time: string
  location: string
  year_group: string
  year_group_min: number | null
  year_group_max: number | null
  photo_folder: string | null
  leaders: unknown
  teachers: unknown
  contact: string
  special_conditions: string | null
  application_questions_raw: string | null
  questions: unknown
  roles: string[] | null
  accepting: boolean | null
  image: string
  images: string[] | null
  sort_order: number | null
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}

function toClub(row: ClubRow): Club {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name ?? undefined,
    summary: row.summary ?? undefined,
    tagline: row.tagline,
    description: row.description,
    meetingDay: row.meeting_day,
    meetingTime: row.meeting_time,
    location: row.location,
    yearGroup: row.year_group,
    yearGroupMin: row.year_group_min ?? 7,
    yearGroupMax: row.year_group_max ?? 13,
    photoFolder: row.photo_folder ?? undefined,
    leaders: Array.isArray(row.leaders)
      ? row.leaders
          .filter(isObject)
          .map((leader) => ({
            name: String(leader.name ?? '').trim(),
            year: leader.year == null ? null : String(leader.year).trim(),
            email: String(leader.email ?? '').trim(),
            student_id: leader.student_id == null ? undefined : String(leader.student_id).trim(),
          }))
      : [],
    teachers: Array.isArray(row.teachers)
      ? row.teachers
          .filter(isObject)
          .map((teacher) => ({
            name: String(teacher.name ?? '').trim(),
            email: String(teacher.email ?? '').trim(),
          }))
      : [],
    contact: row.contact,
    specialConditions: row.special_conditions,
    applicationQuestionsRaw: row.application_questions_raw,
    questions: Array.isArray(row.questions)
      ? row.questions
          .filter(isObject)
          .map((question) => ({
            id: String(question.id ?? '').trim(),
            label: String(question.label ?? '').trim(),
            type: (question.type ?? 'text') as 'text' | 'textarea' | 'select' | 'date' | 'checkbox',
            required: Boolean(question.required),
            options: Array.isArray(question.options)
              ? question.options.map((option) => String(option)).filter(Boolean)
              : undefined,
            helperLink: question.helperLink == null ? undefined : String(question.helperLink),
          }))
      : [],
    roles: row.roles ?? [],
    accepting: row.accepting ?? true,
    image: row.image,
    images: row.images ?? [],
  }
}

export function sortClubs(clubs: Club[]): Club[] {
  const sanitized = clubs.filter((club) => club.id !== BLANK_PLACEHOLDER_ID)
  const byId = new Map(sanitized.map((club) => [club.id, club]))

  const pinned: Club[] = []
  for (const id of PINNED_ORDER) {
    const club = byId.get(id)
    if (club) pinned.push(club)
  }

  const pinnedIds = new Set(PINNED_ORDER)
  const rest = sanitized
    .filter((club) => !pinnedIds.has(club.id))
    .sort((a, b) => hashId(a.id) - hashId(b.id))

  return [...pinned, ...rest]
}

function fallbackClubs(): Club[] {
  return sortClubs((clubsData as Club[]).filter((club) => club.id !== BLANK_PLACEHOLDER_ID))
}

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey)
}

export async function getClubsFromStore(): Promise<Club[]> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return fallbackClubs()

  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error || !data || data.length === 0) {
    return fallbackClubs()
  }

  return sortClubs((data as ClubRow[]).map(toClub))
}

export async function getClubByIdFromStore(id: string): Promise<Club | undefined> {
  const clubs = await getClubsFromStore()
  return clubs.find((club) => club.id === id)
}

export function clubToRowPayload(club: Club) {
  return {
    id: club.id,
    name: club.name,
    display_name: club.displayName ?? null,
    summary: club.summary ?? null,
    tagline: club.tagline,
    description: club.description,
    meeting_day: club.meetingDay,
    meeting_time: club.meetingTime,
    location: club.location,
    year_group: club.yearGroup,
    year_group_min: club.yearGroupMin ?? 7,
    year_group_max: club.yearGroupMax ?? 13,
    photo_folder: club.photoFolder ?? null,
    leaders: club.leaders ?? [],
    teachers: club.teachers ?? [],
    contact: club.contact,
    special_conditions: club.specialConditions ?? null,
    application_questions_raw: club.applicationQuestionsRaw ?? null,
    questions: club.questions ?? [],
    roles: club.roles ?? [],
    accepting: club.accepting,
    image: club.image,
    images: club.images ?? [],
  }
}
