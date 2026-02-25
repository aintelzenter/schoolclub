'use client'

import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

/** TEDx red: premium, not neon */
const TEDX_RED = '#c92a2a'

const ARCHIVE_ITEMS = [
  {
    year: 2026,
    videoId: 'zKHNISnOFrU',
    url: 'https://www.youtube.com/live/zKHNISnOFrU?si=k1Iki2cmOw4II_dB',
    mostRecent: true,
  },
  {
    year: 2025,
    videoId: 'Zr9k0QWJl-U',
    url: 'https://www.youtube.com/live/Zr9k0QWJl-U?si=Y2ht0xe4Kxn6RaEw',
    mostRecent: false,
  },
  {
    year: 2024,
    videoId: 'RTgHyGn61GY',
    url: 'https://www.youtube.com/live/RTgHyGn61GY?si=DIGYl1uVNJTy7iZf',
    mostRecent: false,
  },
] as const

function getThumbnailUrl(videoId: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

interface LivestreamModalProps {
  open: boolean
  onClose: () => void
  year: number
  videoId: string
  watchUrl: string
}

function LivestreamModal({ open, onClose, year, videoId, watchUrl }: LivestreamModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const el = containerRef.current
      if (!el) return

      const focusable = el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const list = Array.from(focusable).filter((n) => !n.hasAttribute('disabled'))
      if (list.length === 0) return

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const firstFocusable = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    )
    setTimeout(() => firstFocusable?.focus(), 80)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label={`TEDx ${year} livestream`}
        >
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl rounded-xl bg-brand-navy/95 border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">TEDx Amnuay Silpa School Youth — {year}</span>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy focus-visible:ring-white/60"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                title={`TEDx ${year} livestream`}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            <div className="px-4 py-3 border-t border-white/10 flex justify-end">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy focus-visible:ring-white/60 rounded px-2 py-1"
                style={{ color: TEDX_RED }}
              >
                Open on YouTube ↗
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function TEDxLivestreamArchive() {
  const [modalYear, setModalYear] = useState<number | null>(null)
  const [thumbnailFallback, setThumbnailFallback] = useState<Record<string, boolean>>({})

  const openModal = useCallback((year: number) => {
    setModalYear(year)
  }, [])

  const closeModal = useCallback(() => {
    setModalYear(null)
  }, [])

  const current = ARCHIVE_ITEMS.find((a) => a.year === modalYear)

  return (
    <>
      <section className="mb-5" aria-label="Past speakers and livestream archive">
        <h2
          className="text-sm font-bold text-white mb-3 tracking-tight"
          style={{ borderLeft: `3px solid ${TEDX_RED}`, paddingLeft: 8 }}
        >
          Past Speakers / Livestream Archive
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {ARCHIVE_ITEMS.map((item) => (
            <ArchiveCard
              key={item.year}
              year={item.year}
              videoId={item.videoId}
              mostRecent={item.mostRecent}
              onSelect={() => openModal(item.year)}
              useHqThumbnail={thumbnailFallback[item.videoId] ?? false}
              onThumbnailError={() =>
                setThumbnailFallback((prev) => ({ ...prev, [item.videoId]: true }))
              }
            />
          ))}
        </div>
      </section>

      <LivestreamModal
        open={current != null}
        onClose={closeModal}
        year={current?.year ?? 0}
        videoId={current?.videoId ?? ''}
        watchUrl={current?.url ?? ''}
      />
    </>
  )
}

interface ArchiveCardProps {
  year: number
  videoId: string
  mostRecent: boolean
  onSelect: () => void
  useHqThumbnail: boolean
  onThumbnailError: () => void
}

function ArchiveCard({ year, videoId, mostRecent, onSelect, useHqThumbnail, onThumbnailError }: ArchiveCardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const thumbUrl =
    useHqThumbnail || imgFailed
      ? getThumbnailUrl(videoId, 'hqdefault')
      : getThumbnailUrl(videoId, 'maxresdefault')

  const handleImgError = () => {
    if (!imgFailed) {
      setImgFailed(true)
      onThumbnailError()
    }
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-lg overflow-hidden text-left',
        'border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep',
        'hover:translate-y-[-2px] hover:shadow-lg',
        'focus-visible:ring-white/50'
      )}
      style={{
        borderColor: `${TEDX_RED}30`,
        aspectRatio: '4/3',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      }}
      whileHover={{
        boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px ${TEDX_RED}20`,
      }}
      whileTap={{ scale: 0.99 }}
      aria-label={`Watch TEDx ${year} livestream`}
    >
      {/* Thumbnail background */}
      <span className="absolute inset-0 block bg-black">
        <img
          src={thumbUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={handleImgError}
          loading="lazy"
        />
      </span>
      {/* Dark gradient overlay */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.2) 100%)',
        }}
      />
      {/* Content */}
      <span className="absolute inset-0 flex flex-col justify-end p-4">
        {mostRecent && (
          <span
            className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded"
            style={{ backgroundColor: `${TEDX_RED}90`, color: '#fff' }}
          >
            Most recent
          </span>
        )}
        <span
          className="text-[11px] font-medium uppercase tracking-wider mb-0.5"
          style={{ color: TEDX_RED }}
        >
          Livestream
        </span>
        <span className="text-2xl font-bold text-white tracking-tight">{year}</span>
      </span>
    </motion.button>
  )
}
