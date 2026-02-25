'use client'

import type { DoeAwardLevel } from '@/lib/doeThemes'
import { cn } from '@/lib/utils/cn'
import { useEffect, useRef, useState } from 'react'

interface DukeHeroSilhouetteProps {
  level: DoeAwardLevel
  /** Accent comes from CSS var(--doe-accent) when parent sets it */
  reducedMotion: boolean
  className?: string
}

/**
 * Adventure silhouette: varies by award level.
 * Bronze = minimal, Silver = medium, Gold = most grand.
 * Uses CSS variable --doe-accent for theming.
 */
export function DukeHeroSilhouette({ level, reducedMotion, className }: DukeHeroSilhouetteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion) return
    const el = containerRef.current
    if (!el) return
    const parent = el.closest('section')
    if (!parent) return

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      setParallax({ x: dx * 4, y: dy * 3 })
    }
    parent.addEventListener('mousemove', onMove, { passive: true })
    return () => parent.removeEventListener('mousemove', onMove)
  }, [reducedMotion])

  const isBronze = level === 'bronze'
  const isSilver = level === 'silver'
  const isGold = level === 'gold'

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 hidden md:flex w-full items-center justify-end pr-0',
        'transition-all duration-300 ease-out',
        isBronze && 'max-w-[48%] md:max-w-[44%] opacity-[0.11] md:opacity-[0.14]',
        isSilver && 'max-w-[55%] md:max-w-[50%] opacity-[0.14] md:opacity-[0.18]',
        isGold && 'max-w-[62%] md:max-w-[56%] opacity-[0.17] md:opacity-[0.22]',
        className
      )}
      style={{
        transform: reducedMotion ? undefined : `translate(${parallax.x}px, ${parallax.y}px)`,
        transitionDuration: reducedMotion ? '0.01ms' : '400ms',
      }}
      aria-hidden
    >
      <svg
        className={cn(
          'w-auto object-contain object-right drop-shadow-[0_0_30px_rgba(0,0,0,0.15)]',
        isBronze && 'max-h-[200px] md:max-h-[240px]',
        isSilver && 'max-h-[240px] md:max-h-[280px]',
        isGold && 'max-h-[280px] md:max-h-[320px]'
        )}
        viewBox="0 0 260 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bronze: 2 layers only. Silver/Gold: back ridge */}
        {(isSilver || isGold) && (
          <path
            d="M0 150 L0 110 L40 85 L85 105 L120 75 L160 95 L200 65 L260 90 L260 150 Z"
            fill="var(--doe-accent)"
            fillOpacity="0.35"
          />
        )}

        {/* All: mid layer */}
        <path
          d="M0 150 L0 98 L38 68 L72 88 L108 58 L142 78 L178 48 L218 72 L260 52 L260 150 Z"
          fill="var(--doe-accent)"
          fillOpacity={isBronze ? 0.5 : 0.6}
        />

        {/* All: front ridge */}
        <path
          d="M0 150 L0 92 L32 62 L68 82 L102 52 L138 72 L172 42 L208 66 L260 48 L260 150 Z"
          fill="var(--doe-accent)"
          fillOpacity={isBronze ? 0.78 : 0.88}
        />

        {/* Gold only: extra front detail (closer peak) */}
        {isGold && (
          <path
            d="M180 150 L180 72 L210 52 L260 68 L260 150 Z"
            fill="var(--doe-accent)"
            fillOpacity="0.5"
          />
        )}

        {/* Trail: Bronze = shorter/simpler, Silver = current, Gold = longer with extra segment */}
        <path
          d={
            isBronze
              ? 'M200 108 Q170 88 130 98 T70 88'
              : isSilver
                ? 'M195 102 Q172 84 148 92 T98 78 T58 98'
                : 'M205 98 Q178 78 148 88 T95 72 T50 92'
          }
          stroke="var(--doe-accent)"
          strokeOpacity={isBronze ? 0.5 : 0.7}
          strokeWidth={isGold ? 2.8 : 2.5}
          strokeLinecap="round"
          fill="none"
        />
        {!isBronze && (
          <path
            d={isGold ? 'M50 92 L30 68' : 'M58 98 L42 78'}
            stroke="var(--doe-accent)"
            strokeOpacity={isGold ? 0.6 : 0.5}
            strokeWidth={isGold ? 2 : 1.5}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Flag: Bronze = smaller */}
        <path
          d={
            isBronze
              ? 'M70 88 L70 72 L80 80 Z'
              : isGold
                ? 'M30 68 L30 44 L46 56 Z'
                : 'M42 78 L42 52 L56 65 Z'
          }
          fill="var(--doe-accent)"
          fillOpacity="0.95"
        />

        {/* Silver/Gold: compass. Gold = larger with inner ring */}
        {(isSilver || isGold) && (
          <>
            <circle
              cx="220"
              cy="38"
              r={isGold ? 22 : 18}
              fill="none"
              stroke="var(--doe-accent)"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <circle
              cx="220"
              cy="38"
              r={isGold ? 15 : 12}
              fill="none"
              stroke="var(--doe-accent)"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
            {isGold && (
              <>
                <circle cx="220" cy="38" r="6" fill="none" stroke="var(--doe-accent)" strokeOpacity="0.2" strokeWidth="0.8" />
                <line x1="220" y1="20" x2="220" y2="26" stroke="var(--doe-accent)" strokeOpacity="0.35" strokeWidth="1" />
                <line x1="220" y1="50" x2="220" y2="56" stroke="var(--doe-accent)" strokeOpacity="0.35" strokeWidth="1" />
                <line x1="204" y1="38" x2="210" y2="38" stroke="var(--doe-accent)" strokeOpacity="0.35" strokeWidth="1" />
                <line x1="230" y1="38" x2="236" y2="38" stroke="var(--doe-accent)" strokeOpacity="0.35" strokeWidth="1" />
              </>
            )}
          </>
        )}
      </svg>
    </div>
  )
}
