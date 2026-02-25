'use client'

import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface DescriptionModalProps {
  open: boolean
  onClose: () => void
  clubName: string
  description: string
  tintHex?: string
}

/**
 * Accessible modal that shows the full club description.
 * Includes focus trap, keyboard dismiss, and backdrop click.
 */
export function DescriptionModal({
  open,
  onClose,
  clubName,
  description,
  tintHex = '#D946EF',
}: DescriptionModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Simple focus trap: Tab cycles to close button
      if (e.key === 'Tab') {
        e.preventDefault()
        closeRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // Auto-focus close button
    setTimeout(() => closeRef.current?.focus(), 50)

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label={`${clubName} – full description`}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg max-h-[80vh] rounded-2xl bg-brand-navy border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white pr-4 break-words">{clubName}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Accent bar */}
            <div className="h-0.5" style={{ backgroundColor: `${tintHex}50` }} />

            {/* Description body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
