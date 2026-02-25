'use client'

import type { SchoolShowProduction } from '@/lib/schoolShowThemes'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export interface SchoolShowHeroStageProps {
  /** Main stage image (School Show hero photo) */
  imageSrc: string
  production: SchoolShowProduction
  className?: string
}

/** Theme-based color overlay for the stage image (teal / gold / rose / icy blue). */
const THEME_OVERLAYS: Record<SchoolShowProduction, string> = {
  mermaid: 'linear-gradient(180deg, rgba(13,148,136,0.22) 0%, rgba(13,148,136,0.1) 50%, transparent 100%)',
  aladdin: 'linear-gradient(180deg, rgba(201,162,39,0.24) 0%, rgba(201,162,39,0.08) 50%, transparent 100%)',
  beauty: 'linear-gradient(180deg, rgba(185,28,28,0.2) 0%, rgba(201,162,39,0.08) 50%, transparent 100%)',
  frozen: 'linear-gradient(180deg, rgba(56,189,248,0.22) 0%, rgba(56,189,248,0.1) 50%, transparent 100%)',
}

/**
 * Right-side stage frame: photo with theme overlay. Castle for Beauty is in hero background, not here.
 */
export function SchoolShowHeroStage({
  imageSrc,
  production,
  className,
}: SchoolShowHeroStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [parallaxY, setParallaxY] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const viewportCenter = typeof window !== 'undefined' ? window.innerHeight / 2 : 400
      const delta = (viewportCenter - center) * 0.03
      setParallaxY(Math.max(-12, Math.min(12, delta)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('relative flex items-center justify-center', className)}
      aria-hidden
    >
      <div
        className="relative w-full min-w-[200px] max-w-[280px] md:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            transform: `translateY(${parallaxY}px)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, 320px"
            priority
          />
          <div
            className="absolute inset-0 rounded-2xl transition-opacity duration-[400ms] ease-out"
            style={{ background: THEME_OVERLAYS[production] }}
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 85% 90% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
