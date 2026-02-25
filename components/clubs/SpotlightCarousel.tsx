'use client'

import { Club } from '@/lib/types/club'
import { getClubTintRgb, getClubTintGradientCss } from '@/lib/clubHues'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface SpotlightCarouselProps {
  clubs: Club[]
  currentIndex: number
  onIndexChange: (index: number) => void
  sectionRef?: React.RefObject<HTMLElement | null>
}

export function SpotlightCarousel({
  clubs,
  currentIndex,
  onIndexChange,
  sectionRef,
}: SpotlightCarouselProps) {
  const total = clubs.length
  const clampedIndex = total > 0 ? Math.max(0, Math.min(currentIndex, total - 1)) : 0
  const club = clubs[clampedIndex]
  const [swipeStart, setSwipeStart] = useState<number | null>(null)

  const goPrev = useCallback(() => {
    if (total <= 1) return
    onIndexChange(clampedIndex === 0 ? total - 1 : clampedIndex - 1)
  }, [clampedIndex, total, onIndexChange])

  const goNext = useCallback(() => {
    if (total <= 1) return
    onIndexChange(clampedIndex === total - 1 ? 0 : clampedIndex + 1)
  }, [clampedIndex, total, onIndexChange])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goPrev, goNext])

  const handlePointerDown = useCallback((e: React.PointerEvent) => setSwipeStart(e.clientX), [])
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (swipeStart == null) return
      const delta = e.clientX - swipeStart
      if (delta > 50) goPrev()
      if (delta < -50) goNext()
      setSwipeStart(null)
    },
    [goPrev, goNext, swipeStart]
  )

  if (total === 0) return null

  const tintRgb = getClubTintRgb(club.id)
  const tintGradientCss = getClubTintGradientCss(tintRgb, { spotlight: true })

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative rounded-2xl overflow-hidden border border-white/10 shadow-card touch-pan-y"
      aria-label="Club spotlight"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setSwipeStart(null)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={club.image}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover object-center',
            club.id === 'school-show' && 'scale-125'
          )}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 30%, rgba(11, 16, 32, 0.92) 100%),
              linear-gradient(90deg, rgba(11, 16, 32, 0.5) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: tintGradientCss }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 min-h-[320px] md:min-h-[380px] flex flex-col justify-end p-6 md:p-10">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 md:p-10">
          <Link
            href="/clubs"
            className="inline-flex items-center text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clubs
          </Link>
          <span
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold',
              club.accepting
                ? 'bg-emerald-500/95 text-white border border-emerald-400/50'
                : 'bg-white/15 text-white/90 border border-white/20'
            )}
          >
            {club.accepting ? 'Now Accepting Members' : 'Not accepting'}
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={club.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              {club.name}
            </h1>
            <p className="text-lg md:text-xl text-white/95 mb-3">{club.tagline}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/15 text-white/90 text-sm font-medium border border-white/20">
              {club.yearGroup}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm font-medium tabular-nums">
              {clampedIndex + 1} / {total}
            </span>
            <div className="flex gap-1.5" aria-hidden>
              {clubs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    i === clampedIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                  )}
                  aria-label={`Go to club ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={total <= 1}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous club"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={total <= 1}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next club"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
