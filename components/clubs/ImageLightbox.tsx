'use client'

import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface ImageLightboxProps {
  /** All images in gallery */
  images: string[]
  /** Currently displayed image index */
  currentIndex: number
  alt: string
  open: boolean
  onClose: () => void
  onIndexChange?: (index: number) => void
}

/** Legacy single-image interface for backwards compatibility */
export interface ImageLightboxLegacyProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}

export function ImageLightbox(
  props: ImageLightboxProps | ImageLightboxLegacyProps
) {
  // Normalize to gallery API
  const isLegacy = 'src' in props
  const images = isLegacy ? [props.src] : props.images
  const initialIndex = isLegacy ? 0 : props.currentIndex
  const onIndexChange = isLegacy ? undefined : props.onIndexChange

  const { alt, open, onClose } = props

  const [index, setIndex] = useState(initialIndex)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync external index
  useEffect(() => {
    if (!isLegacy) {
      setIndex((props as ImageLightboxProps).currentIndex)
    }
  }, [isLegacy, props])

  const count = images.length

  const goTo = useCallback(
    (i: number) => {
      const next = ((i % count) + count) % count
      setIndex(next)
      onIndexChange?.(next)
    },
    [count, onIndexChange]
  )

  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    // Focus trap
    containerRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, prev, next])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Image preview"
          tabIndex={-1}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center w-full h-full p-4 pt-[calc(var(--header-height,5rem)+0.5rem)] pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main image — full viewport height below header (bottom bar hidden when lightbox open) */}
            <div className="flex items-center justify-center w-full h-full max-w-[96vw] max-h-[calc(100vh-var(--header-height,5rem)-1rem)]">
              <img
                src={images[index]}
                alt={alt}
                className="max-w-full max-h-full w-auto h-auto object-cover object-center rounded-xl shadow-2xl"
                draggable={false}
              />
            </div>

            {/* Close button — below header so it's always visible and clickable */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ top: 'calc(var(--header-height, 5rem) + 0.5rem)' }}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev/Next navigation */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Previous photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Next photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter */}
            {count > 1 && (
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/80 text-sm font-medium">
                {index + 1} / {count}
              </span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
