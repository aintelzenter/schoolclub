import { createClient } from '@supabase/supabase-js'
import clubs from '../data/clubs.json' assert { type: 'json' }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const payload = clubs
  .filter((club) => club.id !== 'blank')
  .map((club, index) => ({
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
    contact: club.contact ?? '',
    special_conditions: club.specialConditions ?? null,
    application_questions_raw: club.applicationQuestionsRaw ?? null,
    questions: club.questions ?? [],
    roles: club.roles ?? [],
    accepting: club.accepting ?? true,
    image: club.image ?? '',
    images: club.images ?? [],
    sort_order: index,
  }))

const { error } = await supabase.from('clubs').upsert(payload, { onConflict: 'id' })

if (error) {
  console.error('Failed to seed clubs:', error)
  process.exit(1)
}

console.log(`Seeded ${payload.length} clubs to Supabase.`)
