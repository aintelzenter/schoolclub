'use client'

import {
  DOE_JOURNEY,
  type DoeAwardLevel,
  type JourneyCheckpoint,
} from '@/lib/doeThemes'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import type { DoeThemePalette } from '@/lib/doeThemes'

function PanelContent({ active, theme }: { active: JourneyCheckpoint; theme: DoeThemePalette }) {
  return (
    <>
      {active.content.commitment && (
        <p className="text-sm font-medium mb-2" style={{ color: theme.accent }}>
          {active.content.commitment}
        </p>
      )}
      <p className="text-white/90 text-sm leading-relaxed mb-3 md:mb-4">
        {active.content.expectations}
      </p>
      <div className="flex flex-wrap gap-2">
        {active.content.components.map((comp) => (
          <span
            key={comp}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.accentSoft,
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            {comp}
          </span>
        ))}
      </div>
    </>
  )
}

interface DukeJourneyMapProps {
  level: DoeAwardLevel
  theme: DoeThemePalette
  reducedMotion: boolean
  className?: string
}

const ICON_SVG: Record<JourneyCheckpoint['icon'], React.ReactNode> = {
  overview: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  ),
  volunteering: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  ),
  physical: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  ),
  skills: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  ),
  expedition: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  residential: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  ),
}

function CheckpointIcon({ icon }: { icon: JourneyCheckpoint['icon'] }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {ICON_SVG[icon]}
    </svg>
  )
}

export function DukeJourneyMap({ level, theme, reducedMotion, className }: DukeJourneyMapProps) {
  const checkpoints = DOE_JOURNEY[level]
  const [activeId, setActiveId] = useState<string | null>(checkpoints[0]?.id ?? null)
  const active = checkpoints.find((c) => c.id === activeId) ?? checkpoints[0]

  // Keep activeId valid when level changes
  useEffect(() => {
    const ids = new Set(checkpoints.map((c) => c.id))
    if (activeId === null || !ids.has(activeId)) {
      setActiveId(checkpoints[0]?.id ?? null)
    }
  }, [level, checkpoints, activeId])

  const [sheetOpen, setSheetOpen] = useState(false)
  const openPanel = useCallback((id: string) => {
    setActiveId(id)
    setSheetOpen(true)
  }, [])

  const duration = reducedMotion ? 0.01 : 0.25

  return (
    <div className={cn('doe-journey-map', className)}>
      <h2
        className="text-xl font-bold text-white mb-4 tracking-tight"
        style={{ borderLeft: `3px solid ${theme.accent}`, paddingLeft: 12 }}
      >
        Journey Map
      </h2>

      {/* Mobile: bottom sheet — tap checkpoint to open, scrollable content fits screen */}
      <AnimatePresence>
        {sheetOpen && active && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration }}
              onClick={() => setSheetOpen(false)}
              aria-hidden
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden max-h-[85vh] overflow-y-auto rounded-t-2xl border-t"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.bgTint,
                boxShadow: theme.shadow,
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="sticky top-0 flex items-center justify-between p-3 border-b" style={{ borderColor: theme.border, backgroundColor: theme.bgTint }}>
                <h3 className="font-semibold" style={{ color: theme.accent }}>{active.label}</h3>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="p-2 -m-2 rounded-lg text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 pb-8 safe-area-inset-bottom">
                <PanelContent active={active} theme={theme} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trail: horizontal on md+, vertical on small */}
      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-0">
        {checkpoints.map((cp, i) => {
          const isActive = activeId === cp.id
          const isLast = i === checkpoints.length - 1
          return (
            <div key={cp.id} className="flex flex-col md:flex-row md:items-center flex-1 md:flex-initial">
              <button
                type="button"
                onClick={() => openPanel(cp.id)}
                className={cn(
                  'group flex items-center gap-3 md:flex-col md:gap-2 p-3 md:p-4 rounded-xl text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)]',
                  'border-2 min-w-0'
                )}
                style={{
                  borderColor: isActive ? theme.accent : 'rgba(255,255,255,0.12)',
                  backgroundColor: isActive ? theme.accentSoft : 'rgba(255,255,255,0.04)',
                  transitionDuration: reducedMotion ? '0.01ms' : '200ms',
                }}
                aria-expanded={isActive}
                aria-controls={`doe-panel-${cp.id}`}
                id={`doe-checkpoint-${cp.id}`}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                  style={{
                    borderColor: isActive ? theme.accent : 'rgba(255,255,255,0.2)',
                    backgroundColor: isActive ? theme.accent : 'transparent',
                    color: isActive ? theme.accentText : 'rgba(255,255,255,0.7)',
                  }}
                >
                  <CheckpointIcon icon={cp.icon} />
                </span>
                <div className="min-w-0 flex-1 md:text-center">
                  <span
                    className="block font-semibold text-sm"
                    style={{ color: isActive ? theme.accent : 'rgba(255,255,255,0.95)' }}
                  >
                    {cp.label}
                  </span>
                  {cp.subtitle && (
                    <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {cp.subtitle}
                    </span>
                  )}
                </div>
              </button>
              {!isLast && (
                <div
                  className="hidden md:block w-8 h-0.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: theme.border }}
                  aria-hidden
                />
              )}
              {!isLast && (
                <div
                  className="md:hidden w-0.5 h-6 flex-shrink-0 mx-auto rounded-full"
                  style={{ backgroundColor: theme.border }}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Panel — desktop only (mobile uses bottom sheet) */}
      <div className="hidden md:block">
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            id={`doe-panel-${active.id}`}
            role="region"
            aria-labelledby={`doe-checkpoint-${active.id}`}
            className="mt-6 rounded-xl border p-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.bgTint,
              boxShadow: theme.shadow,
            }}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration }}
          >
            <PanelContent active={active} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
