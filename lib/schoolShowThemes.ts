
export type SchoolShowProduction = 'mermaid' | 'aladdin' | 'beauty' | 'frozen'

export const SCHOOL_SHOW_PRODUCTIONS: SchoolShowProduction[] = ['mermaid', 'aladdin', 'beauty', 'frozen']

export const SCHOOL_SHOW_PRODUCTION_LABELS: Record<SchoolShowProduction, string> = {
  mermaid: 'The Little Mermaid',
  aladdin: 'Aladdin',
  beauty: 'Beauty and the Beast',
  frozen: 'Frozen',
}

export interface SchoolShowThemePalette {
  accent: string
  accentSoft: string
  accentText: string
  bgTint: string
  border: string
  shadow: string
  /** 0–1, for overlay/decoration opacity */
  decorOpacity: string
  /** RGB for gradients/cursor */
  accentRgb: string
}

export const SCHOOL_SHOW_THEMES: Record<SchoolShowProduction, SchoolShowThemePalette> = {
  mermaid: {
    accent: '#0d9488',
    accentSoft: 'rgba(13, 148, 136, 0.25)',
    accentText: '#f0fdfa',
    bgTint: 'rgba(13, 148, 136, 0.1)',
    border: 'rgba(13, 148, 136, 0.45)',
    shadow: '0 8px 32px rgba(13, 148, 136, 0.2)',
    decorOpacity: '0.12',
    accentRgb: '13,148,136',
  },
  aladdin: {
    accent: '#c9a227',
    accentSoft: 'rgba(201, 162, 39, 0.28)',
    accentText: '#1a1a2e',
    bgTint: 'rgba(201, 162, 39, 0.1)',
    border: 'rgba(201, 162, 39, 0.45)',
    shadow: '0 8px 32px rgba(201, 162, 39, 0.2)',
    decorOpacity: '0.12',
    accentRgb: '201,162,39',
  },
  beauty: {
    accent: '#b91c1c',
    accentSoft: 'rgba(185, 28, 28, 0.22)',
    accentText: '#fef2f2',
    bgTint: 'rgba(185, 28, 28, 0.08)',
    border: 'rgba(185, 28, 28, 0.45)',
    shadow: '0 8px 32px rgba(185, 28, 28, 0.15)',
    decorOpacity: '0.12',
    accentRgb: '185,28,28',
  },
  frozen: {
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.25)',
    accentText: '#0c4a6e',
    bgTint: 'rgba(56, 189, 248, 0.1)',
    border: 'rgba(56, 189, 248, 0.45)',
    shadow: '0 8px 32px rgba(56, 189, 248, 0.2)',
    decorOpacity: '0.12',
    accentRgb: '56,189,248',
  },
}

const STORAGE_KEY = 'schoolshow_theme'

export function getStoredSchoolShowTheme(): SchoolShowProduction {
  if (typeof window === 'undefined') return 'frozen'
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'mermaid' || raw === 'aladdin' || raw === 'beauty' || raw === 'frozen') return raw
  return 'frozen'
}

export function setStoredSchoolShowTheme(production: SchoolShowProduction): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, production)
}

const EFFECTS_STORAGE_KEY = 'schoolShowEffectsEnabled'

export function getStoredSchoolShowEffectsEnabled(reducedMotion: boolean): boolean {
  if (typeof window === 'undefined') return !reducedMotion
  if (reducedMotion) return false
  const raw = window.localStorage.getItem(EFFECTS_STORAGE_KEY)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return true
}

export function setStoredSchoolShowEffectsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(EFFECTS_STORAGE_KEY, String(enabled))
}
