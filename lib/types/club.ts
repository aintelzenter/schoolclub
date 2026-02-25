export interface ClubLeader {
  name: string
  year: string | null
  email: string
  /** Student ID for contact display (e.g. "79876") */
  student_id?: string
}

export interface ClubTeacher {
  name: string
  email: string
}

export interface ClubQuestion {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'checkbox'
  required: boolean
  options?: string[]
  helperLink?: string
}

export interface Club {
  id: string
  name: string
  /** Display name for hero/title when different from name (e.g. "Model United Nations" for MUN). */
  displayName?: string
  /** Short 1–2 sentence summary for cards (no "X is a..."). If missing, generated from description. */
  summary?: string
  tagline: string
  description: string
  meetingDay: string
  meetingTime: string
  location: string
  yearGroup: string
  /** Min year (7–13) for filtering */
  yearGroupMin?: number
  /** Max year (7–13) for filtering */
  yearGroupMax?: number
  /** Folder name inside /public/clubs/PHOTOS/ that holds this club's photos */
  photoFolder?: string
  leaders: ClubLeader[]
  teachers: ClubTeacher[]
  contact: string
  specialConditions: string | null
  questions: ClubQuestion[]
  roles: string[]
  accepting: boolean
  image: string
  /** All club images for carousel (main first). Club images are in same folder as club. */
  images?: string[]
  /** Raw application questions text from CSV (if present). */
  applicationQuestionsRaw?: string | null
}

export interface JoinSubmission {
  clubId: string
  clubName: string
  studentId: string
  role?: string
  answers?: Record<string, string>
  submittedAt: string
}
