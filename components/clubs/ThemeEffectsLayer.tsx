'use client'

import { cn } from '@/lib/utils/cn'
import type { SchoolShowProduction } from '@/lib/schoolShowThemes'
import { useCallback, useEffect, useRef, useState } from 'react'

const DESKTOP_COUNT = { frozen: 12, mermaid: 18, aladdin: 24, beauty: 14 }
const MOBILE_COUNT = { frozen: 7, mermaid: 12, aladdin: 16, beauty: 10 }
const ALADDIN_STREAK_COUNT = 5

function getParticleConfig(index: number, theme: SchoolShowProduction) {
  const left = 2 + ((index * 17 + 7) % 94)
  const duration = 10 + (index % 13)
  const midOpacity = 0.05 + ((index * 5) % 12) * 0.009
  const offset = (index * 3.7) % (duration + 1)
  return { left, duration, midOpacity, offset }
}

function getMermaidBubbleConfig(index: number) {
  const left = 2 + ((index * 19 + 11) % 96)
  const duration = 12 + (index % 11)
  const midOpacity = 0.38 + ((index * 7) % 7) * 0.06
  const offset = (index * 4.1) % (duration + 1)
  return { left, duration, midOpacity, offset }
}

function getAladdinConfig(index: number, isStreak: boolean, total: number) {
  const duration = isStreak ? 12 + (index % 8) : 14 + (index % 13)
  const midOpacity = isStreak ? 0.22 : 0.26 + ((index * 3) % 7) * 0.04
  const offset = (index * 3.2) % (duration + 1)
  const leftPct = (index * 100) / Math.max(1, total)
  return { duration, midOpacity, offset, leftPct }
}

function SnowflakeIcon({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth={0.8}
      strokeLinecap="round"
      style={{ opacity, filter: 'blur(0.4px)' }}
    >
      <line x1={12} y1={12} x2={12} y2={2} />
      <line x1={12} y1={12} x2={18} y2={6} />
      <line x1={12} y1={12} x2={18} y2={18} />
      <line x1={12} y1={12} x2={12} y2={22} />
      <line x1={12} y1={12} x2={6} y2={18} />
      <line x1={12} y1={12} x2={6} y2={6} />
      <line x1={12} y1={12} x2={15} y2={4} />
      <line x1={12} y1={12} x2={20} y2={12} />
      <line x1={12} y1={12} x2={15} y2={20} />
      <line x1={12} y1={12} x2={9} y2={20} />
      <line x1={12} y1={12} x2={4} y2={12} />
      <line x1={12} y1={12} x2={9} y2={4} />
      <circle cx={12} cy={12} r={1.5} fill="rgba(220,240,255,0.5)" stroke="none" />
    </svg>
  )
}

function BeautySparkleIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="rgba(255,220,150,0.7)" strokeWidth={1}>
      <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" fill="rgba(255,220,150,0.2)" />
      <path d="M12 6l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" fill="rgba(255,255,255,0.25)" />
    </svg>
  )
}

function BeautySparkleSpawner({ reducedMotion }: { reducedMotion: boolean }) {
  const poolSize = 10
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([])
  const [spawnState, setSpawnState] = useState<Array<{ left: number; top: number; size: number; duration: number; active: boolean }>>(
    () => Array.from({ length: poolSize }, () => ({ left: 0, top: 0, size: 8, duration: 2400, active: false }))
  )
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pickPosition = useCallback(() => ({
    left: 4 + Math.random() * 92,
    top: 6 + Math.random() * 88,
  }), [])

  const spawnBatch = useCallback(() => {
    if (reducedMotion) return
    setSpawnState((prev) => {
      const available = prev.map((s, i) => ({ ...s, i })).filter((s) => !s.active)
      if (available.length === 0) return prev
      const count = Math.min(1 + Math.floor(Math.random() * 2), available.length)
      const picks = available.sort(() => Math.random() - 0.5).slice(0, count)
      const next = [...prev]
      for (const pick of picks) {
        const { left, top } = pickPosition()
        next[pick.i] = {
          left,
          top,
          size: 6 + Math.random() * 7,
          duration: 2200 + Math.random() * 700,
          active: true,
        }
      }
      return next
    })
  }, [reducedMotion, pickPosition])

  useEffect(() => {
    if (reducedMotion) return
    const scheduleNext = () => {
      const delay = 1800 + Math.random() * 1600
      spawnTimerRef.current = setTimeout(() => {
        spawnBatch()
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    }
  }, [spawnBatch, reducedMotion])

  const handleAnimationEnd = useCallback((i: number) => {
    setSpawnState((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], active: false }
      return next
    })
  }, [])

  return (
    <>
      {spawnState.map((s, i) => (
        <div
          key={`beauty-sparkle-${i}`}
          ref={(el) => { sparkleRefs.current[i] = el }}
          className={cn(
            'beauty-sparkle absolute pointer-events-none',
            s.active && 'beauty-sparkle-active'
          )}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            visibility: s.active ? 'visible' : 'hidden',
            ['--p-dur' as string]: `${s.duration}ms`,
          }}
          onAnimationEnd={() => handleAnimationEnd(i)}
        >
          <BeautySparkleIcon size={s.size} />
        </div>
      ))}
    </>
  )
}

interface ThemeEffectsLayerProps {
  theme: SchoolShowProduction
  enabled: boolean
  reducedMotion: boolean
}

export function ThemeEffectsLayer({ theme, enabled, reducedMotion }: ThemeEffectsLayerProps) {
  const [displayTheme, setDisplayTheme] = useState(theme)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (theme !== displayTheme) {
      setOpacity(0)
      const t = setTimeout(() => {
        setDisplayTheme(theme)
        setOpacity(1)
      }, 220)
      return () => clearTimeout(t)
    }
  }, [theme, displayTheme])

  if (!enabled || reducedMotion) return null

  const count = DESKTOP_COUNT[displayTheme]
  const mobileCount = MOBILE_COUNT[displayTheme]

  return (
    <div
      className="theme-effects-layer fixed inset-0 pointer-events-none z-[10] overflow-hidden"
      aria-hidden
      style={{
        opacity,
        transition: 'opacity 280ms ease',
      }}
    >
      <div className="theme-effects-particles absolute inset-0" data-theme={displayTheme}>
        {displayTheme === 'frozen' &&
          Array.from({ length: count }, (_, i) => {
            const c = getParticleConfig(i, 'frozen')
            const size = i % 4 === 0 ? 20 : 10 + (i % 10)
            return (
              <div
                key={`frozen-${i}`}
                className={cn('theme-eff theme-eff-frozen absolute', i >= mobileCount && 'hidden md:block')}
                style={{
                  left: `${c.left}vw`,
                  top: 0,
                  ['--p-midOpacity' as string]: c.midOpacity,
                  ['--p-dur' as string]: `${c.duration}s`,
                  ['--p-offset' as string]: c.offset,
                }}
              >
                <SnowflakeIcon size={size} opacity={1} />
              </div>
            )
          })}
        {displayTheme === 'mermaid' &&
          Array.from({ length: count }, (_, i) => {
            const c = getMermaidBubbleConfig(i)
            const size = i % 6 === 0 ? 10 + (i % 3) : 3 + (i % 7)
            return (
              <div
                key={`mermaid-${i}`}
                className={cn('theme-eff theme-eff-mermaid absolute', i >= mobileCount && 'hidden md:block')}
                style={{
                  left: `${c.left}vw`,
                  top: 0,
                  width: size,
                  height: size,
                  ['--p-midOpacity' as string]: c.midOpacity,
                  ['--p-dur' as string]: `${c.duration}s`,
                  ['--p-offset' as string]: c.offset,
                }}
              >
                <div
                  className="mermaid-bubble rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: 'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.6), rgba(100,220,240,0.15))',
                    boxShadow: size >= 6 ? 'inset 1px 1px 0 rgba(255,255,255,0.4)' : undefined,
                  }}
                />
              </div>
            )
          })}
        {displayTheme === 'aladdin' && (
          <>
            {Array.from({ length: count }, (_, i) => {
              const c = getAladdinConfig(i, false, count)
              const size = 2 + (i % 3)
              const blur = 0.3 + (i % 4) * 0.15
              return (
                <div
                  key={`aladdin-speck-${i}`}
                  className={cn('theme-eff theme-eff-aladdin-speck absolute', i >= mobileCount && 'hidden md:block')}
                  style={{
                    left: `${c.leftPct}%`,
                    top: 0,
                    width: size,
                    height: size,
                    borderRadius: 9999,
                    background: 'rgba(250,215,140,0.5)',
                    filter: `blur(${blur}px)`,
                    ['--p-midOpacity' as string]: c.midOpacity,
                    ['--p-dur' as string]: `${c.duration}s`,
                    ['--p-offset' as string]: c.offset,
                  }}
                />
              )
            })}
            {Array.from({ length: ALADDIN_STREAK_COUNT }, (_, i) => {
              const c = getAladdinConfig(i, true, ALADDIN_STREAK_COUNT)
              const width = 18 + (i * 5) % 26
              return (
                <div
                  key={`aladdin-streak-${i}`}
                  className="theme-eff theme-eff-aladdin-streak absolute hidden md:block"
                  style={{
                    left: `${(i * 22) % 90}%`,
                    top: 0,
                    width,
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(250,220,150,0.55), transparent)',
                    filter: 'blur(0.5px)',
                    ['--p-midOpacity' as string]: c.midOpacity,
                    ['--p-dur' as string]: `${c.duration}s`,
                    ['--p-offset' as string]: c.offset,
                  }}
                />
              )
            })}
          </>
        )}
        {displayTheme === 'beauty' && <BeautySparkleSpawner reducedMotion={reducedMotion} />}
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(5,8,18,0.15) 0%, transparent 35%, transparent 100%)',
        }}
      />
    </div>
  )
}
