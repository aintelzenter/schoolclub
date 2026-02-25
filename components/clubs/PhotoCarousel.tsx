'use client'

import {
  CAROUSEL_TRANSITIONS,
  CAROUSEL_VARIANTS,
  getCarouselPresetForClub,
  type CarouselTransitionPreset,
} from '@/lib/carouselTransitions'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'

interface PhotoCarouselProps {
  images: string[]
  alt?: string
  onImageClick?: (index: number) => void
  className?: string
  /** Accent color hex for dots/controls */
  accentHex?: string
  /** Optional border color (e.g. theme border for Duke page) */
  borderColor?: string
  /** Cinematic: vignette, crossfade, "Scene X / Y" counter, thin arrows */
  variant?: 'default' | 'cinematic'
  /** Compact: cap height (360–420px) for layout3 / above-the-fold */
  compact?: boolean
  /** Club id for club-specific transition animation */
  clubId?: string
}

export function PhotoCarousel({
  images,
  alt = '',
  onImageClick,
  className,
  accentHex = '#D946EF',
  borderColor,
  variant = 'default',
  compact = false,
  clubId,
}: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const count = images.length
  const cinematic = variant === 'cinematic'

  const preset: CarouselTransitionPreset = useMemo(
    () => (clubId ? getCarouselPresetForClub(clubId) : 'slide'),
    [clubId]
  )
  const slideVariants = useMemo(
    () => (cinematic ? CAROUSEL_VARIANTS.fade : CAROUSEL_VARIANTS[preset]),
    [cinematic, preset]
  )
  const transitionConfig = useMemo(
    () => (cinematic ? CAROUSEL_TRANSITIONS.fade : CAROUSEL_TRANSITIONS[preset]),
    [cinematic, preset]
  )

  const goTo = useCallback(
    (index: number, dir?: number) => {
      if (count === 0) return
      const newIndex = ((index % count) + count) % count
      setDirection(dir ?? (newIndex > current ? 1 : -1))
      setCurrent(newIndex)
    },
    [count, current]
  )

  const prev = useCallback(() => goTo(current - 1, -1), [goTo, current])
  const next = useCallback(() => goTo(current + 1, 1), [goTo, current])

  if (count === 0) return null

  const useDirection = typeof slideVariants.enter === 'function'

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl bg-brand-navy/40 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
        className
      )}
      style={borderColor ? { borderColor } : undefined}
      role="region"
      aria-label="Photo gallery"
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
      tabIndex={0}
    >
      {/* Media frame: aspect-video, fixed max-height for consistent centered layout */}
      <div
        className={cn(
          'relative aspect-video overflow-hidden bg-brand-navy/60 max-h-[320px] md:max-h-[420px] isolate mx-auto',
          compact && 'max-h-[280px] md:max-h-[360px]'
        )}
      >
        <AnimatePresence initial={false} custom={useDirection ? direction : undefined} mode="sync">
          <motion.img
            key={`carousel-${current}`}
            src={images[current]}
            alt={alt ? `${alt} - Photo ${current + 1}` : `Photo ${current + 1}`}
            custom={useDirection ? direction : undefined}
            variants={slideVariants as Variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: transitionConfig.duration, ease: transitionConfig.ease }}
            className="absolute inset-0 w-full h-full object-cover object-center cursor-pointer"
            onClick={() => onImageClick?.(current)}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            draggable={false}
          />
        </AnimatePresence>
        {/* Cinematic: dark vignette overlay */}
        {cinematic && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)',
            }}
            aria-hidden
          />
        )}

        {/* Prev/Next arrows — over image (old position); bottom bar is z-[100] so it stays on top when scrolling */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-white/90 hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                cinematic
                  ? 'left-2 w-8 h-8 rounded-full bg-black/20 border border-white/15 hover:bg-black/35'
                  : 'left-3 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 hover:border-white/20'
              )}
              aria-label="Previous photo"
            >
              <svg className={cinematic ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={cinematic ? 1.5 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-white/90 hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                cinematic
                  ? 'right-2 w-8 h-8 rounded-full bg-black/20 border border-white/15 hover:bg-black/35'
                  : 'right-3 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 hover:border-white/20'
              )}
              aria-label="Next photo"
            >
              <svg className={cinematic ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={cinematic ? 1.5 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter — over image, top-right */}
        {count > 1 && (
          <span
            className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg text-xs font-medium tabular-nums backdrop-blur-md border border-white/10"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'rgba(255,255,255,0.95)',
              borderLeftWidth: 2,
              borderLeftColor: accentHex,
            }}
          >
            {cinematic ? `Scene ${current + 1} / ${count}` : `${current + 1} / ${count}`}
          </span>
        )}
      </div>

      {/* Dots — below image */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 px-3">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'carousel-dot h-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                i === current ? 'active' : 'w-2'
              )}
              style={{
                backgroundColor: i === current ? accentHex : 'rgba(255,255,255,0.3)',
                width: i === current ? '1.5rem' : undefined,
              }}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
