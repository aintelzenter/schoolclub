
export type DoeAwardLevel = 'bronze' | 'silver' | 'gold'

export const DOE_LEVELS: DoeAwardLevel[] = ['bronze', 'silver', 'gold']

export interface DoeThemePalette {
  accent: string
  accentSoft: string
  accentText: string
  bgTint: string
  border: string
  shadow: string
  accentRgb: string
}

export const DOE_THEMES: Record<DoeAwardLevel, DoeThemePalette> = {
  bronze: {
    accent: '#b87333',
    accentSoft: 'rgba(184, 115, 51, 0.2)',
    accentText: '#1a1a2e',
    bgTint: 'rgba(184, 115, 51, 0.06)',
    border: 'rgba(184, 115, 51, 0.35)',
    shadow: '0 8px 32px rgba(184, 115, 51, 0.15)',
    accentRgb: '184,115,51',
  },
  silver: {
    accent: '#a8b2c1',
    accentSoft: 'rgba(168, 178, 193, 0.2)',
    accentText: '#0f1419',
    bgTint: 'rgba(168, 178, 193, 0.06)',
    border: 'rgba(168, 178, 193, 0.4)',
    shadow: '0 8px 32px rgba(168, 178, 193, 0.12)',
    accentRgb: '168,178,193',
  },
  gold: {
    accent: '#c9a227',
    accentSoft: 'rgba(201, 162, 39, 0.2)',
    accentText: '#1a1a2e',
    bgTint: 'rgba(201, 162, 39, 0.06)',
    border: 'rgba(201, 162, 39, 0.4)',
    shadow: '0 8px 32px rgba(201, 162, 39, 0.15)',
    accentRgb: '201,162,39',
  },
}

export interface JourneyCheckpoint {
  id: string
  label: string
  subtitle?: string
  content: {
    commitment?: string
    expectations: string
    components: string[]
  }
  icon: 'volunteering' | 'physical' | 'skills' | 'expedition' | 'residential' | 'overview'
}

export const DOE_JOURNEY: Record<DoeAwardLevel, JourneyCheckpoint[]> = {
  bronze: [
    {
      id: 'intro',
      label: 'Start',
      subtitle: 'Your DofE journey',
      icon: 'overview',
      content: {
        commitment: 'Minimum 6 months. Adventurous Journey: 5 days / 4 nights.',
        expectations: 'Build habits across four areas: Skills, Physical Recreation, Voluntary Service, and Adventurous Journey. Ideal for first-time participants.',
        components: ['Skills', 'Physical', 'Volunteering', 'Expedition'],
      },
    },
    {
      id: 'sections',
      label: 'Sections',
      subtitle: 'Skills, Physical, Volunteering',
      icon: 'skills',
      content: {
        expectations: 'Complete regular activity in each of the three sections. Minimum periods apply; consistency and progression matter more than intensity.',
        components: ['Skills', 'Physical', 'Volunteering'],
      },
    },
    {
      id: 'expedition',
      label: 'Expedition',
      subtitle: 'Adventurous Journey',
      icon: 'expedition',
      content: {
        expectations: 'Plan, train for, and complete an expedition with your team. Adventurous Journey: 5 days / 4 nights. Builds teamwork, navigation, and resilience.',
        components: ['Expedition'],
      },
    },
  ],
  silver: [
    {
      id: 'intro',
      label: 'Start',
      subtitle: 'Stepping up',
      icon: 'overview',
      content: {
        commitment: 'Minimum 12 months (or 6 months if Bronze completed). Adventurous Journey: 6 days / 7 nights.',
        expectations: 'Deeper involvement across all sections and a longer, more challenging expedition. Progression from Bronze or direct entry (see direct entry rules).',
        components: ['Skills', 'Physical', 'Volunteering', 'Expedition'],
      },
    },
    {
      id: 'skills-physical',
      label: 'Skills & Physical',
      subtitle: 'Personal development',
      icon: 'physical',
      content: {
        expectations: 'Longer minimum periods and higher expectations. Choose activities you can sustain and show clear progress over time.',
        components: ['Skills', 'Physical'],
      },
    },
    {
      id: 'volunteering',
      label: 'Volunteering',
      subtitle: 'Service to others',
      icon: 'volunteering',
      content: {
        expectations: 'Sustained voluntary service that benefits others. Demonstrates commitment to your community and develops empathy and responsibility.',
        components: ['Volunteering'],
      },
    },
    {
      id: 'expedition',
      label: 'Expedition',
      subtitle: 'Adventurous Journey',
      icon: 'expedition',
      content: {
        expectations: 'A more demanding expedition: 6 days / 7 nights. Stronger focus on team planning, leadership, and self-reliance.',
        components: ['Expedition'],
      },
    },
  ],
  gold: [
    {
      id: 'intro',
      label: 'Start',
      subtitle: 'Highest level',
      icon: 'overview',
      content: {
        commitment: 'Minimum 18 months (or 12 months if Silver completed). Adventurous Journey: 7 days / 6 nights. Residential: 5 days / 4 nights.',
        expectations: 'Long-term engagement across all sections plus a Residential project. The full Award experience.',
        components: ['Skills', 'Physical', 'Volunteering', 'Expedition', 'Residential'],
      },
    },
    {
      id: 'skills',
      label: 'Skills',
      subtitle: 'Develop a talent',
      icon: 'skills',
      content: {
        expectations: 'Develop a skill over a sustained period. Show progression and, where possible, share your skill with others.',
        components: ['Skills'],
      },
    },
    {
      id: 'physical',
      label: 'Physical',
      subtitle: 'Regular activity',
      icon: 'physical',
      content: {
        expectations: 'Regular physical recreation to improve fitness and wellbeing. Consistency and improvement over the full period.',
        components: ['Physical'],
      },
    },
    {
      id: 'volunteering-expedition',
      label: 'Volunteering & Expedition',
      subtitle: 'Service and journey',
      icon: 'volunteering',
      content: {
        expectations: 'Sustained volunteering and a demanding expedition (7 days / 6 nights). Teamwork, planning, and resilience at the highest level.',
        components: ['Volunteering', 'Expedition'],
      },
    },
    {
      id: 'residential',
      label: 'Residential',
      subtitle: 'Gold only',
      icon: 'residential',
      content: {
        commitment: 'Gold-only requirement.',
        expectations: 'A shared residential project away from home (5 days, 4 nights). Work with people you don’t know on a shared goal. Develops independence and new perspectives.',
        components: ['Residential'],
      },
    },
  ],
}

export const DOE_LEVEL_LABELS: Record<DoeAwardLevel, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
}

export const DOE_LEVEL_AGES: Record<DoeAwardLevel, { min: number; earlyNote?: string }> = {
  bronze: { min: 14, earlyNote: 'Earlier entry subject to centre approval.' },
  silver: { min: 15, earlyNote: 'Earlier entry subject to centre approval.' },
  gold: { min: 16, earlyNote: 'Earlier entry subject to centre approval.' },
}

export interface DoeLevelRequirements {
  duration: string
  adventurousJourney: string
  residential?: string
}

export const DOE_LEVEL_REQUIREMENTS: Record<DoeAwardLevel, DoeLevelRequirements> = {
  bronze: {
    duration: 'Minimum 6 months',
    adventurousJourney: '5 days / 4 nights',
  },
  silver: {
    duration: 'Minimum 12 months (or 6 months if Bronze completed)',
    adventurousJourney: '6 days / 7 nights',
  },
  gold: {
    duration: 'Minimum 18 months (or 12 months if Silver completed)',
    adventurousJourney: '7 days / 6 nights',
    residential: '5 days / 4 nights',
  },
}

export const DOE_DIRECT_ENTRY_NOTE =
  'If entering Silver or Gold directly without completing the previous level, participants must complete an additional 6 months in either the Service section or the longer of the Physical/Skills sections.'

export const DOE_OFFICIAL_SITE_URL = 'https://sites.google.com/amnuaysilpa.ac.th/dofe/home?authuser=0'

const STORAGE_KEY = 'doe_award_level'

export function getStoredDoeLevel(): DoeAwardLevel {
  if (typeof window === 'undefined') return 'bronze'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'silver' || raw === 'gold' || raw === 'bronze') return raw
  return 'bronze'
}

export function setStoredDoeLevel(level: DoeAwardLevel): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, level)
}
