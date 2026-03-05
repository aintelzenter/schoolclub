export interface ClubLeader {
  name: string
  year: string | null
  email: string
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
  displayName?: string
  summary?: string
  tagline: string
  description: string
  meetingDay: string
  meetingTime: string
  location: string
  yearGroup: string
  yearGroupMin?: number
  yearGroupMax?: number
  photoFolder?: string
  leaders: ClubLeader[]
  teachers: ClubTeacher[]
  contact: string
  specialConditions: string | null
  questions: ClubQuestion[]
  roles: string[]
  accepting: boolean
  image: string
  images?: string[]
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
