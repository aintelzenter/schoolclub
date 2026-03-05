'use client'

import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface FeaturedMediaCardProps {
  images: string[]
  alt?: string
  className?: string
  enableTilt?: boolean
}

export function FeaturedMediaCard({
  images,
  alt = 'Club photo',
  className,
  enableTilt = false,
}: FeaturedMediaCardProps) {
  const list = images.length > 0 ? images : []
  const [index, setIndex] = useState(0)
  const clampedIndex = list.length > 0 ? Math.max(0, Math.min(index, list.length - 1)) : 0
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const rotateX = useTransform(mouseY, [0, 1], [4, -4])
  const rotateY = useTransform(mouseX, [0, 1], [-4, 4])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [enableTilt, mouseX, mouseY]
  )
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  const goPrev = useCallback(() => {
    if (list.length <= 1) return
    setIndex((i) => (i === 0 ? list.length - 1 : i - 1))
  }, [list.length])

  const goNext = useCallback(() => {
    if (list.length <= 1) return
    setIndex((i) => (i === list.length - 1 ? 0 : i + 1))
  }, [list.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goPrev, goNext])

  const [swipeStart, setSwipeStart] = useState<number | null>(null)
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

  if (list.length === 0) return null

  const tiltStyle =
    enableTilt ?
      {
        rotateX,
        rotateY,
        transformPerspective: 800,
      }
    : undefined

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/15 shadow-lg backdrop-blur-sm bg-brand-navy/30 touch-pan-y',
        'max-h-[200px] sm:max-h-[240px] md:max-h-[280px] lg:max-h-[320px]',
        enableTilt && 'will-change-transform',
        className
      )}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setSwipeStart(null)}
      aria-label="Club photos"
    >
      <div className="relative w-full aspect-video max-h-[180px] sm:max-h-[220px] md:max-h-[260px] lg:max-h-[300px] mx-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={clampedIndex}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <img
              src={list[clampedIndex]}
              alt={`${alt} ${clampedIndex + 1} of ${list.length}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 40%, rgba(11,16,32,0.2) 100%)',
              }}
              aria-hidden
            />
          </motion.div>
        </AnimatePresence>

        {list.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none sm:pointer-events-auto">
            <button
              type="button"
              onClick={goPrev}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/20 text-white transition-colors pointer-events-auto"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/20 text-white transition-colors pointer-events-auto"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-1.5 p-2.5 border-t border-white/10 bg-black/20 overflow-x-auto scrollbar-hide">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'flex-shrink-0 w-12 h-8 rounded-md overflow-hidden border-2 transition-all duration-200',
                i === clampedIndex
                  ? 'border-white/80 ring-1 ring-white/30'
                  : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
              )}
              aria-label={`Go to image ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
