/**
 * Generate data/clubs.json from the CSV single source of truth.
 * Club images are stored in the same folder naming scheme as the club
 * (public/clubs/ANSXtra/{imageFolder}); this script dynamically discovers
 * all images for each club and orders them (main first, then rest).
 *
 * Usage: node scripts/generate-clubs-from-csv.cjs [path-to-csv]
 *   CSV path defaults to env CSV_PATH or "data/source/clubs.csv"
 */

const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const PUBLIC_CLUBS = path.join(PROJECT_ROOT, 'public', 'clubs', 'ANSXtra')

/** CSV club_name -> { id, imageFolder } for routing and image discovery */
const CLUB_NAME_TO_META = {
  'Operation Smile': { id: 'operation-smile', imageFolder: 'Operation Smile' },
  'School Show': { id: 'school-show', imageFolder: 'School Show' },
  'MUN': { id: 'mun', imageFolder: 'MUN' },
  'SPARK Club': { id: 'spark-club', imageFolder: 'SPARK Club' },
  'Interact Club': { id: 'interact-club', imageFolder: 'Interact Club' },
  'Eco Commitee': { id: 'eco-committee', imageFolder: 'Eco Committee' },
  'Duke of Edinburgh': { id: 'duke-of-edinburgh', imageFolder: 'Duke of Edinburgh', displayName: 'Duke of Edinburgh International Award' },
  'UNICEF Ambassador': { id: 'unicef-ambassador', imageFolder: 'UNICEF Ambassador' },
  'TEDX': { id: 'tedx', imageFolder: 'TEDX', displayName: 'TEDx' },
}

/** Roles not in CSV; keep for join form / display */
const ROLES_BY_ID = {
  'interact-club': ['Finance', 'Events', 'Social Media'],
  'unicef-ambassador': ['Event team', 'Graphics design team'],
}

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp)$/i

function firstSentence(text) {
  if (!text || typeof text !== 'string') return ''
  const trimmed = text.trim()
  const dot = trimmed.indexOf('.')
  if (dot === -1) return trimmed.slice(0, 120)
  return trimmed.slice(0, dot + 1).trim()
}

function parseYearGroupRange(yearGroups) {
  const s = (yearGroups || '').trim()
  const match = s.match(/Y?\s*(\d+)\s*[-–]\s*Y?\s*(\d+)/i) || s.match(/Y?\s*(\d+)/i)
  if (!match) return { yearGroup: s, yearGroupMin: 7, yearGroupMax: 13 }
  const min = parseInt(match[1], 10)
  const max = match[2] ? parseInt(match[2], 10) : min
  return {
    yearGroup: s,
    yearGroupMin: min,
    yearGroupMax: max,
  }
}

function parseLeaders(leadersStr, emailStr) {
  const list = []
  if (!leadersStr || !emailStr) return list
  const emails = emailStr.split(/[;\s]+/).filter(Boolean)
  const tokens = leadersStr.match(/\S+\s+Y\d+/g) || []
  tokens.forEach((t, i) => {
    const parts = t.trim().split(/\s+/)
    const year = parts.pop()
    const name = parts.join(' ')
    list.push({
      name: name || t,
      year: year || null,
      email: emails[i] || '',
    })
  })
  return list
}

function parseTeachers(advisorsStr, emailStr) {
  const list = []
  if (!advisorsStr || !emailStr) return list
  const emails = emailStr.split(/\s+/).filter(Boolean)
  const names = advisorsStr.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean)
  names.forEach((name, i) => {
    list.push({ name, email: emails[i] || '' })
  })
  return list
}

function discoverClubImages(imageFolder) {
  const dir = path.join(PUBLIC_CLUBS, imageFolder)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return []
  const files = fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f))
  const mainFirst = (a, b) => {
    const aMain = /main/i.test(a)
    const bMain = /main/i.test(b)
    if (aMain && !bMain) return -1
    if (!aMain && bMain) return 1
    return a.localeCompare(b)
  }
  files.sort(mainFirst)
  const base = '/clubs/ANSXtra/' + imageFolder
  return files.map((f) => base + '/' + f)
}

function normalizeValue(v) {
  if (v == null) return ''
  const s = String(v).trim()
  return s.toLowerCase() === 'none' ? '' : s
}

function run() {
  const csvPath =
    process.argv[2] ||
    process.env.CSV_PATH ||
    path.join(PROJECT_ROOT, 'data', 'source', 'clubs.csv')
  const csvAbsolute = path.isAbsolute(csvPath) ? csvPath : path.join(PROJECT_ROOT, csvPath)

  if (!fs.existsSync(csvAbsolute)) {
    console.error('CSV not found:', csvAbsolute)
    console.error('Usage: node scripts/generate-clubs-from-csv.cjs [path-to-csv]')
    process.exit(1)
  }

  const raw = fs.readFileSync(csvAbsolute, 'utf8')
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  })

  const clubs = []
  for (const row of rows) {
    const name = (row.club_name || '').trim()
    if (!name) continue

    const meta = CLUB_NAME_TO_META[name]
    if (!meta) {
      console.warn('Unknown club name in CSV, skipping:', name)
      continue
    }

    const description = (row.club_description || '').trim()
    const meetingTime = (row.meeting_time || '').trim().replace(/\s+/g, ' ')
    const meetingDay = (row.meeting_day || '').trim().replace(/\s+/g, ' ')
    const location = (row.location || '').trim()
    const yearGroups = (row.year_groups || '').trim()
    const contactNotes = (row.contact_notes || '').trim()
    const specialConditions = normalizeValue(row.special_conditions)
    const applicationQuestions = normalizeValue(row.application_questions)

    const { yearGroup, yearGroupMin, yearGroupMax } = parseYearGroupRange(yearGroups)
    const leaders = parseLeaders(row.student_leaders_2025_26 || '', row.email || '')
    const teachers = parseTeachers(row.teacher_advisors || '', row['email.2'] || '')

    const images = discoverClubImages(meta.imageFolder)
    const image = images.length > 0 ? images[0] : ''

    clubs.push({
      id: meta.id,
      name: meta.displayName != null ? meta.displayName : name,
      tagline: firstSentence(description) || description.slice(0, 80),
      description,
      meetingDay,
      meetingTime,
      location,
      yearGroup,
      yearGroupMin,
      yearGroupMax,
      leaders,
      teachers,
      contact: contactNotes,
      specialConditions: specialConditions || null,
      applicationQuestionsRaw: applicationQuestions ? applicationQuestions : null,
      questions: [],
      roles: ROLES_BY_ID[meta.id] || [],
      accepting: true,
      image,
      images,
    })
  }

  clubs.push({
    id: 'blank',
    name: '',
    tagline: '',
    description: '',
    meetingDay: '',
    meetingTime: '',
    location: '',
    yearGroup: '',
    yearGroupMin: 7,
    yearGroupMax: 13,
    leaders: [],
    teachers: [],
    contact: '',
    specialConditions: null,
    applicationQuestionsRaw: null,
    questions: [],
    roles: [],
    accepting: false,
    image: '',
    images: [],
  })

  const outPath = path.join(PROJECT_ROOT, 'data', 'clubs.json')
  fs.writeFileSync(outPath, JSON.stringify(clubs, null, 2), 'utf8')
  console.log('Wrote', clubs.length - 1, 'clubs to', outPath)
}

run()
