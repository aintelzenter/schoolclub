'use client'

import { ImageLightbox } from '@/components/clubs/ImageLightbox'
import { PhotoCarousel } from '@/components/clubs/PhotoCarousel'
import { DukeHeroSilhouette } from '@/components/clubs/DukeHeroSilhouette'
import { DukeJourneyMap } from '@/components/clubs/DukeJourneyMap'
import { SchoolShowThemeSelector } from '@/components/clubs/SchoolShowThemeSelector'
import { TEDxLivestreamArchive } from '@/components/clubs/TEDxLivestreamArchive'
import { ThemeEffectsLayer } from '@/components/clubs/ThemeEffectsLayer'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import {
  getClubTintHex,
  getClubTintRgb,
} from '@/lib/clubHues'
import {
  getClubCategory,
  getCategoryLayout,
} from '@/lib/clubCategory'
import { getClubType } from '@/lib/clubTypes'
import { getClubById } from '@/lib/data'
import { truncateAtSentence } from '@/lib/textUtils'
import { cn } from '@/lib/utils/cn'
import {
  DOE_DIRECT_ENTRY_NOTE,
  DOE_LEVELS,
  DOE_LEVEL_AGES,
  DOE_LEVEL_LABELS,
  DOE_LEVEL_REQUIREMENTS,
  DOE_OFFICIAL_SITE_URL,
  DOE_THEMES,
  getStoredDoeLevel,
  setStoredDoeLevel,
  type DoeAwardLevel,
} from '@/lib/doeThemes'
import {
  getStoredSchoolShowEffectsEnabled,
  setStoredSchoolShowEffectsEnabled,
  SCHOOL_SHOW_THEMES,
  type SchoolShowProduction,
} from '@/lib/schoolShowThemes'
import { getSchoolShowPhotos } from '@/lib/schoolShowPhotos'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'


const MUN_TABS = [
  {
    id: 'debate',
    label: 'Debate',
    bullets: [
      'Represent a country or historical figure in committee sessions.',
      'Deliver speeches and respond to points of information.',
      'Build public speaking and argumentation skills.',
    ],
  },
  {
    id: 'draft',
    label: 'Draft Resolution',
    bullets: [
      'Research and write clauses with other delegates.',
      'Collaborate with like-minded countries to build consensus.',
      'Learn formal resolution language and UN procedures.',
    ],
  },
  {
    id: 'negotiate',
    label: 'Negotiate',
    bullets: [
      'Form blocs and negotiate with other delegations.',
      'Build alliances and compromise on wording.',
      'Develop diplomacy and negotiation skills.',
    ],
  },
] as const

function MunConferenceTabs({ tintHex }: { tintHex: string }) {
  const [active, setActive] = useState<string>(MUN_TABS[0].id)
  const content = MUN_TABS.find((t) => t.id === active) ?? MUN_TABS[0]

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${tintHex}30`, backgroundColor: `${tintHex}08` }}>
      <div className="flex border-b" style={{ borderColor: `${tintHex}25` }}>
        {MUN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: active === tab.id ? tintHex : 'rgba(255,255,255,0.6)',
              borderBottom: active === tab.id ? `2px solid ${tintHex}` : '2px solid transparent',
              backgroundColor: active === tab.id ? `${tintHex}15` : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ul className="p-5 space-y-2.5">
        {content.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5 text-white/85 text-sm leading-relaxed">
            <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tintHex }} aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const MEETING_ICONS = {
  day: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  time: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  location: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3  0 016 0z" />
    </>
  ),
  year: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  ),
}

const svgClass = 'w-4 h-4 flex-shrink-0'

/** Short display for School Show long time: "3:45–5:45 · Sun 11am–4pm" */
function formatSchoolShowTime(raw: string): string {
  const t = raw.trim()
  const mainMatch = t.match(/^(\d{1,2}:\d{2}-\d{1,2}:\d{2})/)
  const main = mainMatch ? mainMatch[1] : null
  const sunMatch = t.match(/(\d{1,2}):?(\d{2})?\s*am\s*[–-]\s*(\d{1,2}):?(\d{2})?\s*pm/i)
  if (main && sunMatch) {
    const [, h1, m1, h2, m2] = sunMatch
    const start = m1 && m1 !== '00' ? `${h1}:${m1}am` : `${h1}am`
    const end = m2 && m2 !== '00' ? `${h2}:${m2}pm` : `${h2}pm`
    return `${main} · Sun ${start}–${end}`
  }
  return main || t
}

function DetailChip({ label, value, tintHex }: { label: string; value: string; tintHex: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1.5 text-[11px] bg-white/[0.04]"
      style={{ borderLeft: `2px solid ${tintHex}` }}
    >
      <span className="text-white/50 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-white/90 font-medium">{value}</span>
    </span>
  )
}

const svgProps = { fill: 'none' as const, stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

const DOE_MEDAL_ICONS: Record<DoeAwardLevel, React.ReactNode> = {
  bronze: (
    <svg className={svgClass} {...svgProps}>
      <circle cx="12" cy="12.5" r="7.25" />
      <path d="M10.5 4v2.5h3V4" />
      <circle cx="12" cy="12.5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  silver: (
    <svg className={svgClass} {...svgProps}>
      <circle cx="12" cy="12.5" r="7.25" />
      <path d="M10.5 4v2.5h3V4" />
      <circle cx="9" cy="12.5" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.5" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  gold: (
    <svg className={svgClass} {...svgProps}>
      <circle cx="12" cy="12.5" r="7.25" />
      <path d="M10.5 4v2.5h3V4" />
      <path fill="currentColor" stroke="none" d="M12 8.5l1.4 2.9 3.1.45-2.25 2.2.53 3.1L12 15.1l-2.28 1.15.53-3.1-2.25-2.2 3.1-.45L12 8.5z" />
    </svg>
  ),
}

export default function ClubDetailPage() {
  const params = useParams()
  const clubId = params.id as string
  const club = getClubById(clubId)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [doeLevel, setDoeLevel] = useState<DoeAwardLevel>('bronze')
  const [schoolShowProduction, setSchoolShowProduction] = useState<SchoolShowProduction>('frozen')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  if (!club) notFound()

  const category = getClubCategory(club.id)
  const layout = getCategoryLayout(category)
  const tintRgb = getClubTintRgb(club.id)
  const tintHex = getClubTintHex(club.id)
  const clubType = getClubType(club.id)
  const isDuke = club.id === 'duke-of-edinburgh'
  const isSchoolShow = club.id === 'school-show'
  const doeTheme = isDuke ? DOE_THEMES[doeLevel] : null
  const schoolShowTheme = isSchoolShow ? SCHOOL_SHOW_THEMES[schoolShowProduction] : null
  const sectionAccentHex = isSchoolShow && schoolShowTheme
    ? schoolShowTheme.accent
    : (isDuke && doeTheme ? doeTheme.accent : tintHex)

  useEffect(() => {
    if (isDuke) setDoeLevel(getStoredDoeLevel())
  }, [isDuke])

  // School Show: default production theme is Frozen; we do not restore from localStorage so each visit starts with Frozen

  useEffect(() => {
    if (isSchoolShow) setEffectsEnabled(getStoredSchoolShowEffectsEnabled(prefersReducedMotion))
  }, [isSchoolShow, prefersReducedMotion])

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const setDoeLevelAndPersist = useCallback((level: DoeAwardLevel) => {
    setDoeLevel(level)
    setStoredDoeLevel(level)
  }, [])

  const setSchoolShowEffectsAndPersist = useCallback((enabled: boolean) => {
    setEffectsEnabled(enabled)
    setStoredSchoolShowEffectsEnabled(enabled)
  }, [])

  const scrollToGallery = useCallback(() => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const schoolShowImages = useMemo(
    () => (isSchoolShow ? getSchoolShowPhotos(schoolShowProduction) : []),
    [isSchoolShow, schoolShowProduction]
  )

  const mainImage = (isSchoolShow && schoolShowImages[0])
    ? schoolShowImages[0]
    : club.image || (club.images && club.images[0]) || ''
  const galleryImages = isSchoolShow
    ? schoolShowImages
    : (club.images && club.images.length > 0 ? club.images : mainImage ? [mainImage] : [])

  // Header background only (does not change main image on Browse Clubs). Duke = header image behind gradient + silhouette on top.
  const HEADER_BACKGROUND_IMAGE: Partial<Record<string, string>> = {
    'duke-of-edinburgh': '/clubs/PHOTOS/Duke of Edinburgh/Mainduke.JPG',
    'eco-committee': '/clubs/PHOTOS/Eco Committee/MainECO.PNG',
    'interact-club': '/clubs/PHOTOS/Interact Club/IMG_3052.PNG',
    'spark-club': '/clubs/PHOTOS/SPARK Club/IMG_3008.JPG',
    'tedx': '/clubs/PHOTOS/TEDX/750_8105.JPG',
  }
  const headerBackgroundImage = isSchoolShow
      ? (schoolShowImages[0] || null)
      : (HEADER_BACKGROUND_IMAGE[club.id] ?? (mainImage || null))

  // Crop/position: lower = show lower part of image (e.g. 50% 80%), higher = show upper part (e.g. 50% 25%). Duke = left so silhouette (right) stays dark.
  const HEADER_BACKGROUND_POSITION: Partial<Record<string, string>> = {
    'duke-of-edinburgh': '28% 50%',
    'tedx': '50% 75%',
    'interact-club': '50% 28%',
    'eco-committee': '50% 32%',
    'unicef-ambassador': '50% 72%',
  }
  const headerBackgroundPosition = isSchoolShow
    ? '50% 50%'
    : (HEADER_BACKGROUND_POSITION[club.id] ?? '50% 50%')

  // Determine if we need dark text for bright accents (Operation Smile yellow); Duke/School Show themes use accentText for contrast
  const needsDarkText = useMemo(() => {
    if (isDuke && doeTheme) return true
    if (isSchoolShow && schoolShowTheme) {
      const hex = schoolShowTheme.accent.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      return luminance > 0.6
    }
    const { r, g, b } = tintRgb
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6
  }, [tintRgb, isDuke, doeTheme, isSchoolShow, schoolShowTheme])

  const heroGradientOverlay = `linear-gradient(to right, ${tintHex}40 0%, ${tintHex}20 40%, transparent 70%)`

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const ABOUT_TRUNCATE_CHARS = 280
  const { text: aboutTruncated, wasTruncated: aboutNeedsExpand } = useMemo(
    () => (club.description ? truncateAtSentence(club.description, ABOUT_TRUNCATE_CHARS) : { text: '', wasTruncated: false }),
    [club.description]
  )
  const [aboutExpanded, setAboutExpanded] = useState(false)

  // Cursor spotlight: club accent with lower opacity so it’s not distracting
  useEffect(() => {
    const root = document.documentElement
    const rgb = isSchoolShow && schoolShowTheme
      ? schoolShowTheme.accentRgb
      : isDuke && doeTheme
        ? doeTheme.accentRgb
        : `${tintRgb.r},${tintRgb.g},${tintRgb.b}`
    root.style.setProperty('--cursor-accent', rgb)
    root.style.setProperty('--cursor-accent-secondary', rgb)
    root.style.setProperty('--cursor-spotlight-opacity', '0.075')
    return () => {
      root.style.removeProperty('--cursor-accent')
      root.style.removeProperty('--cursor-accent-secondary')
      root.style.removeProperty('--cursor-spotlight-opacity')
    }
  }, [tintRgb.r, tintRgb.g, tintRgb.b, isDuke, doeTheme, isSchoolShow, schoolShowTheme])

  const displayName = club.displayName || club.name
  const effectiveTintHex = isSchoolShow && schoolShowTheme
    ? schoolShowTheme.accent
    : isDuke && doeTheme
      ? doeTheme.accent
      : tintHex
  const heroGradientBg = isSchoolShow && schoolShowTheme
    ? `linear-gradient(165deg, rgba(${schoolShowTheme.accentRgb},0.12) 0%, rgba(${schoolShowTheme.accentRgb},0.06) 25%, rgba(11,16,32,0.98) 50%, rgba(5,8,18,0.99) 100%), radial-gradient(ellipse 100% 80% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.22) 100%)`
    : isDuke && doeTheme
      ? `linear-gradient(135deg, rgba(${doeTheme.accentRgb},0.1) 0%, rgba(11,16,32,0.98) 50%)`
      : `linear-gradient(135deg, rgba(${tintRgb.r},${tintRgb.g},${tintRgb.b},0.1) 0%, rgba(11,16,32,0.98) 50%)`
  const heroOverlay = isSchoolShow && schoolShowTheme
    ? `linear-gradient(to right, ${schoolShowTheme.accent}45 0%, ${schoolShowTheme.accent}22 40%, ${schoolShowTheme.accent}0a 65%, transparent 85%)`
    : isDuke && doeTheme
      ? `linear-gradient(to right, ${doeTheme.accent}40 0%, ${doeTheme.accent}20 40%, transparent 70%)`
      : heroGradientOverlay

  const doeWrapperStyle = isDuke && doeTheme ? {
    ['--doe-accent' as string]: doeTheme.accent,
    ['--doe-accent-soft' as string]: doeTheme.accentSoft,
    ['--doe-accent-text' as string]: doeTheme.accentText,
    ['--doe-bg-tint' as string]: doeTheme.bgTint,
    ['--doe-border' as string]: doeTheme.border,
    ['--doe-shadow' as string]: doeTheme.shadow,
  } : undefined

  const schoolShowWrapperStyle = isSchoolShow && schoolShowTheme
    ? {
        ['--accent' as string]: schoolShowTheme.accent,
        ['--accentSoft' as string]: schoolShowTheme.accentSoft,
        ['--accentText' as string]: schoolShowTheme.accentText,
        ['--bgTint' as string]: schoolShowTheme.bgTint,
        ['--decorOpacity' as string]: schoolShowTheme.decorOpacity,
        ['--schoolshow-accent' as string]: schoolShowTheme.accent,
        ['--schoolshow-accent-soft' as string]: schoolShowTheme.accentSoft,
        ['--schoolshow-border' as string]: schoolShowTheme.border,
        ['--schoolshow-shadow' as string]: schoolShowTheme.shadow,
      }
    : undefined

  return (
    <div
      className={cn(isDuke && 'doe-page-wrapper', isSchoolShow && 'school-show-page-wrapper')}
      style={{ ...doeWrapperStyle, ...schoolShowWrapperStyle }}
    >
      {isSchoolShow && schoolShowTheme && (
        <ThemeEffectsLayer
          theme={schoolShowProduction}
          enabled={effectsEnabled}
          reducedMotion={prefersReducedMotion}
        />
      )}
      <div className="relative z-[2] min-h-screen">
    <div className="pb-24 md:pb-16 bg-brand-deep">
      <section
        id="club-hero"
        className={cn(
          'relative overflow-hidden pt-6 pb-6 scroll-mt-header min-h-[240px] max-h-[320px] md:min-h-[260px] md:max-h-[340px] flex flex-col justify-center',
          isSchoolShow ? 'school-show-hero-section' : 'club-hero-section'
        )}
        style={{
          background: heroGradientBg,
        }}
      >
        {headerBackgroundImage && (
          <>
            <div
              className="absolute inset-0 bg-cover pointer-events-none"
              style={{
                backgroundImage: `url("${headerBackgroundImage}")`,
                backgroundPosition: headerBackgroundPosition,
                zIndex: 0,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDuke
                  ? 'linear-gradient(to right, rgba(11,16,32,0.75) 0%, rgba(11,16,32,0.82) 45%, rgba(11,16,32,0.92) 70%, rgba(11,16,32,0.97) 100%)'
                  : 'linear-gradient(to right, rgba(11,16,32,0.9) 0%, rgba(11,16,32,0.82) 50%, rgba(11,16,32,0.7) 100%)',
                zIndex: 0,
              }}
              aria-hidden
            />
          </>
        )}
        {heroOverlay != null && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: heroOverlay, zIndex: 1 }}
            aria-hidden
          />
        )}
        {isSchoolShow && (
          <div className="school-show-hero-grain absolute inset-0 pointer-events-none" aria-hidden />
        )}
        {isDuke && doeTheme && (
          <DukeHeroSilhouette level={doeLevel} reducedMotion={prefersReducedMotion} className="z-[2]" />
        )}
        {isSchoolShow && schoolShowTheme ? (
          <Container className="relative z-[2] max-w-6xl py-5 md:py-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
              <div className="min-w-0 space-y-3">
                <Link href="/clubs" className="inline-flex items-center text-white/70 hover:text-white text-sm font-medium mb-0.5 transition-colors w-fit">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Clubs
                </Link>
                <h1 className="font-bold text-white relative text-2xl md:text-3xl tracking-tight leading-tight" style={{ letterSpacing: '0.02em' }}>
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {club.yearGroup && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/10 text-white/90 text-xs font-medium border border-white/10">
                      {club.yearGroup}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-white/85 text-xs border" style={{ borderColor: `${effectiveTintHex}50` }}>
                    {clubType}
                  </span>
                  {club.accepting && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-400 border border-emerald-500/40">
                      Now Accepting Members
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 md:flex-shrink-0 md:self-start">
                {galleryImages.length > 0 && (
                  <button
                    type="button"
                    onClick={scrollToGallery}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full border-2 transition-all hover:opacity-95 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]"
                    style={{
                      backgroundColor: `${schoolShowTheme.accent}35`,
                      borderColor: schoolShowTheme.accent,
                      color: schoolShowTheme.accent,
                      transitionDuration: '200ms',
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View photos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSchoolShowEffectsAndPersist(!effectsEnabled)}
                  disabled={prefersReducedMotion}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]',
                    prefersReducedMotion && 'cursor-not-allowed opacity-60'
                  )}
                  style={{
                    backgroundColor: effectsEnabled ? `${schoolShowTheme.accent}20` : 'rgba(255,255,255,0.06)',
                    borderColor: effectsEnabled ? `${schoolShowTheme.accent}60` : 'rgba(255,255,255,0.2)',
                    color: effectsEnabled ? schoolShowTheme.accent : 'rgba(255,255,255,0.6)',
                    transitionDuration: prefersReducedMotion ? '0.01ms' : '250ms',
                  }}
                >
                  Effects: {effectsEnabled ? 'On' : 'Off'}
                </button>
                <SchoolShowThemeSelector
                  value={schoolShowProduction}
                  onChange={setSchoolShowProduction}
                  reducedMotion={prefersReducedMotion}
                />
              </div>
            </div>
          </Container>
        ) : (
        <Container className="relative py-5 md:py-6">
          <div className="min-w-0 space-y-3">
              <Link href="/clubs" className="inline-flex items-center text-white/70 hover:text-white text-sm font-medium transition-colors w-fit">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Clubs
              </Link>
              <h1 className={cn('font-bold text-white relative tracking-tight leading-tight', isDuke ? layout.titleSize : 'text-2xl md:text-3xl')}>
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {club.yearGroup && (
                  <span className={cn('inline-flex items-center rounded-md border border-white/10 bg-white/10 text-white/90 font-medium', isDuke ? 'px-2.5 py-1 text-xs' : 'px-2.5 py-1 text-xs')}>
                    {club.yearGroup}
                  </span>
                )}
                <span className={cn('inline-flex items-center rounded-md border text-white/85', isDuke ? 'px-2.5 py-1 text-xs' : 'px-2.5 py-1 text-xs')} style={{ borderColor: `${effectiveTintHex}50` }}>
                  {clubType}
                </span>
                {club.accepting && (
                  <span className={cn('inline-flex items-center rounded-full font-semibold bg-emerald-500/25 text-emerald-400 border border-emerald-500/40', isDuke ? 'px-3 py-1 text-xs' : 'px-3 py-1 text-xs')}>
                    Now Accepting Members
                  </span>
                )}
                {galleryImages.length > 0 && (
                  <button
                    type="button"
                    onClick={scrollToGallery}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border-2 font-semibold text-xs transition-all hover:opacity-95 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]',
                      isDuke ? 'px-3 py-1.5' : 'px-3 py-1.5'
                    )}
                    style={{
                      borderColor: effectiveTintHex,
                      backgroundColor: `${effectiveTintHex}30`,
                      color: effectiveTintHex,
                      transitionDuration: '200ms',
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View photos
                  </button>
                )}
              </div>
          </div>

        {isDuke && doeTheme && (
          <div className="mt-2">
            <div
                className="inline-flex p-1 rounded-xl border bg-white/[0.04]"
                style={{ borderColor: doeTheme.border }}
                role="tablist"
                aria-label="Award level"
              >
                {DOE_LEVELS.map((level) => {
                  const isActive = doeLevel === level
                  return (
                    <button
                      key={level}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setDoeLevelAndPersist(level)}
                      className={cn(
                        'inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)] md:min-h-0 md:py-2'
                      )}
                      style={{
                        backgroundColor: isActive ? doeTheme.accentSoft : 'transparent',
                        color: isActive ? doeTheme.accent : 'rgba(255,255,255,0.7)',
                        border: isActive ? `1px solid ${doeTheme.border}` : '1px solid transparent',
                        transitionDuration: prefersReducedMotion ? '0.01ms' : '250ms',
                      }}
                    >
                      {DOE_MEDAL_ICONS[level]}
                      {DOE_LEVEL_LABELS[level]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </Container>
        )}
      </section>

      {/* Single-column content for all clubs except DoFE: details row + About (read more) + body + Gallery + Contact */}
      {!isDuke && (
        <section className="border-t border-white/10 bg-brand-deep scroll-mt-header">
          <Container className="py-3 md:py-4">
            <div className="mx-auto max-w-[1150px]">
            {/* One compact details row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {club.meetingDay && (
                <DetailChip label="Day" value={club.meetingDay} tintHex={effectiveTintHex} />
              )}
              {club.meetingTime && (
                <DetailChip
                  label="Time"
                  value={club.id === 'school-show' ? formatSchoolShowTime(club.meetingTime) : club.meetingTime}
                  tintHex={effectiveTintHex}
                />
              )}
              {club.location && (
                <DetailChip label="Location" value={club.location} tintHex={effectiveTintHex} />
              )}
              {club.yearGroup && (
                <DetailChip label="Year group" value={club.yearGroup} tintHex={effectiveTintHex} />
              )}
            </div>
            {/* About with sentence-safe Read more / Show less */}
            {club.description && (
              <div className="mb-5">
                <h2 className="text-sm font-bold text-white mb-2 tracking-tight" style={{ borderLeft: `3px solid ${effectiveTintHex}`, paddingLeft: 8 }}>
                  About
                </h2>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line" style={{ lineHeight: 1.55 }}>
                  {aboutExpanded || !aboutNeedsExpand ? club.description : aboutTruncated}
                </p>
                {aboutNeedsExpand && (
                  <button
                    type="button"
                    onClick={() => setAboutExpanded((e) => !e)}
                    className="mt-2 text-sm font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)] rounded"
                    style={{ color: effectiveTintHex }}
                  >
                    {aboutExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
            {/* MUN: Conference Simulation */}
            {club.id === 'mun' && (
              <div className="mb-5">
                <h2 className="text-sm font-bold text-white mb-2 tracking-tight" style={{ borderLeft: `3px solid ${effectiveTintHex}`, paddingLeft: 8 }}>
                  Conference Simulation
                </h2>
                <MunConferenceTabs tintHex={effectiveTintHex} />
              </div>
            )}
            {/* Roles */}
            {club.roles.length > 0 && (
              <div className="mb-5">
                <h2 className="text-sm font-bold text-white mb-2 tracking-tight">Available Roles</h2>
                <div className="flex flex-wrap gap-1.5">
                  {club.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-white/90 text-xs border"
                      style={{ borderColor: `${effectiveTintHex}40`, backgroundColor: `${effectiveTintHex}12` }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Special Notice */}
            {club.specialConditions && (
              <div className="mb-5 rounded-lg p-3 border border-amber-500/20 bg-amber-500/5">
                <h3 className="text-white font-semibold mb-1.5 text-sm">Special Notice</h3>
                <p className="text-white/75 text-sm whitespace-pre-line leading-relaxed">{club.specialConditions}</p>
              </div>
            )}
            {/* TEDx: Past Speakers / Livestream Archive */}
            {club.id === 'tedx' && <TEDxLivestreamArchive />}
            </div>
          </Container>
        </section>
      )}

      {/* Gallery — non-DoFE (above Contact); isolate so its controls don't overlap content below when scrolling */}
      {galleryImages.length > 0 && !isDuke && (
        <section id="gallery" className="relative z-0 border-t border-white/10 scroll-mt-header">
          <Container className="py-3 md:py-4">
            <div className="mx-auto max-w-[1150px]">
            <h2 className="text-sm font-semibold text-white/90 mb-2 tracking-tight" style={{ borderLeft: `3px solid ${effectiveTintHex}`, paddingLeft: 8 }}>
              Gallery
            </h2>
            <PhotoCarousel
              images={galleryImages}
              alt={club.name}
              accentHex={effectiveTintHex}
              onImageClick={(i) => openLightbox(i)}
              compact
              clubId={club.id}
              key={club.id === 'school-show' ? schoolShowProduction : club.id}
              className="max-w-2xl mx-auto"
            />
            </div>
          </Container>
        </section>
      )}

      {/* Contact — non-DoFE, below Gallery (z-10 so it stacks above gallery when overlapping on scroll) */}
      {!isDuke && (
        <section className="relative z-10 border-t border-white/10 bg-brand-deep scroll-mt-header">
          <Container className="py-3 md:py-4">
            <div className="mx-auto max-w-[1150px]">
            <h3 className="text-sm font-bold text-white mb-2 tracking-tight">How to Join</h3>
            {club.id === 'school-show' ? (
              <p className="text-white/70 text-sm">Auditions and applications are run externally. Please check with the club or school for how to apply.</p>
            ) : club.accepting ? (
              <>
                <p className="text-white/70 text-sm mb-3">Click Apply to submit an application.</p>
                <JoinButton href={`/join/${club.id}`} tintHex={effectiveTintHex} needsDarkText={needsDarkText} />
              </>
            ) : (
              <p className="text-white/60 text-sm">Not currently accepting. Check back later or contact the club.</p>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-2">Contact</h4>
              {club.leaders.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {club.leaders.map((leader, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: `${effectiveTintHex}50` }}>
                        {leader.name[0]}
                      </span>
                      <span className="text-white/90 text-sm font-medium">{leader.name}</span>
                      {leader.student_id && <span className="text-white/50 text-xs font-mono">#{leader.student_id}</span>}
                      {leader.year && <span className="text-white/40 text-xs">({leader.year})</span>}
                    </div>
                  ))}
                </div>
              )}
              {club.teachers.length > 0 && (
                <div className="text-white/70 text-xs">
                  <span className="text-white/50 uppercase tracking-wider text-[10px]">Teacher Advisors: </span>
                  {club.teachers.map((t) => t.name).join(', ')}
                </div>
              )}
              {club.contact && <p className="text-white/65 text-sm whitespace-pre-line mt-2">{club.contact}</p>}
            </div>
            </div>
          </Container>
        </section>
      )}

      {/* DoFE: keep unique layout — content in 2-col with sidebar */}
      {isDuke && (
        <>
          {club.description && (
            <section className="border-t border-white/10 bg-brand-deep scroll-mt-header" aria-label="Overview">
              <Container className="py-3 md:py-4">
                <div className="max-w-2xl">
                  <h2 className="text-sm font-bold text-white mb-2 tracking-tight" style={{ borderLeft: `3px solid ${effectiveTintHex}`, paddingLeft: 8 }}>About</h2>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line" style={{ lineHeight: 1.55 }}>{club.description}</p>
                </div>
              </Container>
            </section>
          )}
          {galleryImages.length > 0 && (
            <section id="gallery" className="relative z-0 border-t border-white/10 scroll-mt-header">
              <Container className="py-3 md:py-4">
                <h2 className="text-sm font-semibold text-white/90 mb-2 tracking-tight" style={{ borderLeft: `3px solid ${effectiveTintHex}`, paddingLeft: 8 }}>Gallery</h2>
                <PhotoCarousel
                  key={club.id === 'school-show' ? schoolShowProduction : club.id}
                  images={galleryImages}
                  alt={club.name}
                  accentHex={effectiveTintHex}
                  borderColor={doeTheme?.border}
                  onImageClick={(i) => openLightbox(i)}
                  compact
                  clubId={club.id}
                  className="max-w-2xl mx-auto"
                />
              </Container>
            </section>
          )}
        </>
      )}

      {/* Image lightbox with gallery navigation */}
      <ImageLightbox
        images={galleryImages}
        currentIndex={lightboxIndex}
        alt={club.name}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />

      {/* DoFE only: Award levels at a glance (horizontal blocks) + direct entry + 2-column layout; z-10 so it stacks above gallery on scroll */}
      {isDuke && doeTheme && (
        <Container className="relative z-10 mt-3 md:mt-4">
          <section id="doe-levels" className="max-w-[1150px] mx-auto mb-4 md:mb-5 scroll-mt-header">
            <h2 className="text-sm font-bold text-white mb-3 tracking-tight" style={{ borderLeft: `3px solid ${doeTheme.accent}`, paddingLeft: 10 }}>Award levels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {DOE_LEVELS.map((level) => {
                const theme = DOE_THEMES[level]
                const ages = DOE_LEVEL_AGES[level]
                const req = DOE_LEVEL_REQUIREMENTS[level]
                return (
                  <div
                    key={level}
                    className="rounded-xl border p-3 md:p-4 bg-white/[0.04]"
                    style={{ borderColor: theme.border, borderLeftWidth: 3, borderLeftColor: theme.accent }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex-shrink-0" style={{ color: theme.accent }}>{DOE_MEDAL_ICONS[level]}</span>
                      <span className="font-semibold text-white text-sm">{DOE_LEVEL_LABELS[level]}</span>
                    </div>
                    <p className="text-white/80 text-xs mb-1.5">
                      Min. age: {ages.min}. {ages.earlyNote}
                    </p>
                    <p className="text-white/90 text-xs font-medium mb-1">{req.duration}</p>
                    <p className="text-white/70 text-[11px]">Adventurous Journey: {req.adventurousJourney}</p>
                    {req.residential && (
                      <p className="text-white/70 text-[11px] mt-0.5">Residential: {req.residential}</p>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-white/65 text-xs mt-3 max-w-[1150px]">
              {DOE_DIRECT_ENTRY_NOTE}
            </p>
          </section>
          <div className="grid lg:grid-cols-3 gap-3 md:gap-4 max-w-[1150px] mx-auto">
            <div className="lg:col-span-2 space-y-4">
              <section id="doe-journey-map" className="scroll-mt-header">
                <DukeJourneyMap level={doeLevel} theme={doeTheme} reducedMotion={prefersReducedMotion} />
              </section>
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {club.meetingDay && <StatCard label="Day" value={club.meetingDay} icon={MEETING_ICONS.day} tintHex={effectiveTintHex} />}
                  {club.meetingTime && <StatCard label="Time" value={club.meetingTime} icon={MEETING_ICONS.time} tintHex={effectiveTintHex} />}
                  {club.location && <StatCard label="Location" value={club.location} icon={MEETING_ICONS.location} tintHex={effectiveTintHex} />}
                  {club.yearGroup && <StatCard label="Year group" value={club.yearGroup} icon={MEETING_ICONS.year} tintHex={effectiveTintHex} />}
                </div>
                <div className="rounded-xl p-4 border border-white/10 bg-white/[0.04]">
                  <h3 className="text-sm font-bold text-white mb-2 tracking-tight">How to Join</h3>
                  {club.id === 'school-show' ? (
                    <p className="text-white/70 text-sm">Auditions and applications are run externally. Please check with the club or school for how to apply.</p>
                  ) : club.accepting ? (
                    <>
                    <p className="text-white/70 text-sm mb-3">Click Apply to submit an application.</p>
                      <JoinButton href={`/join/${club.id}`} tintHex={effectiveTintHex} needsDarkText={needsDarkText} />
                    </>
                  ) : (
                    <p className="text-white/60 text-sm">Not currently accepting. Check back later or contact the club.</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <h4 className="text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-2">Contact</h4>
                    {club.leaders.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {club.leaders.map((leader, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: `${effectiveTintHex}50` }}>
                              {leader.name[0]}
                            </span>
                            <span className="text-white/90 text-sm font-medium">{leader.name}</span>
                            {leader.student_id && <span className="text-white/50 text-xs font-mono">#{leader.student_id}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {club.teachers.length > 0 && (
                      <div className="text-white/70 text-xs">
                        <span className="text-white/50 uppercase tracking-wider text-[10px]">Teacher Advisors: </span>
                        {club.teachers.map((t) => t.name).join(', ')}
                      </div>
                    )}
                    {club.contact && <p className="text-white/65 text-sm whitespace-pre-line mt-2">{club.contact}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="max-w-[1150px] mx-auto mt-4 pt-3 border-t border-white/10 text-center text-white/50 text-[11px]">
            For full details, policies, and school-specific requirements, please refer to the{' '}
            <Link href={DOE_OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-white/70 underline hover:text-white transition-colors">
              official ANS Duke of Edinburgh website
            </Link>.
          </p>
        </Container>
      )}

      {/* Mobile sticky join bar — hidden when lightbox open so expanded photo can use full screen */}
      {!lightboxOpen && (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[100] lg:hidden',
          'bg-brand-deep/95 backdrop-blur-xl border-t border-white/10 p-4 safe-area-inset-bottom'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold break-words">{displayName}</p>
            <p className="text-white/60 text-sm">
              {club.id === 'school-show' ? 'Apply externally' : club.accepting ? 'Open for registration' : 'Not accepting'}
            </p>
          </div>
          {club.id === 'school-show' ? (
            <span className="text-white/60 text-sm">Auditions & applications run externally</span>
          ) : club.accepting ? (
            <Button
              href={`/join/${club.id}`}
              size="lg"
              style={{
                backgroundColor: effectiveTintHex,
                color: needsDarkText ? '#1a1a2e' : '#fff',
              }}
            >
              Apply
            </Button>
          ) : (
            <Button disabled size="lg">Closed</Button>
          )}
        </div>
      </div>
      )}
    </div>
    </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  tintHex,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tintHex: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      className={cn(
        'rounded-lg border p-2.5 bg-white/[0.04] backdrop-blur-sm transition-shadow',
        'border-white/10'
      )}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: hovered ? tintHex : 'rgba(255,255,255,0.1)',
        boxShadow: hovered ? `0 4px 16px ${tintHex}18` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center mb-1.5"
        style={{ backgroundColor: `${tintHex}20` }}
      >
        <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <p className="text-white/50 text-[9px] uppercase tracking-wide font-medium">{label}</p>
      <p className="text-white font-semibold text-sm mt-0.5 whitespace-pre-line leading-snug">{value}</p>
    </motion.div>
  )
}

function JoinButton({ href, tintHex, needsDarkText }: { href: string; tintHex: string; needsDarkText: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      className="relative inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-all min-h-[44px] overflow-hidden"
      style={{
        backgroundColor: tintHex,
        color: needsDarkText ? '#1a1a2e' : '#fff',
        boxShadow: hovered ? `0 0 24px ${tintHex}50` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Apply
      <span className="inline-block" aria-hidden>→</span>
    </Link>
  )
}
