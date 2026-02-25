'use client'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { clearApplications, getApplicationsByStudentId } from '@/lib/applications'
import type { ClubApplicationPayload } from '@/lib/applications'
import { cn } from '@/lib/utils/cn'
import { AlertCircle, ArrowRight, Check, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const HEADER_OFFSET = 'calc(var(--header-height, 5rem) + 0.5rem)'

type ScanState = 'idle' | 'armed' | 'scanning'

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

function usePrefersReducedMotion() {
  const reduced = useReducedMotion()
  return reduced ?? false
}

const slideY = 8

/** Sort applications newest first */
function sortByNewest(apps: ClubApplicationPayload[]): ClubApplicationPayload[] {
  return [...apps].sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  )
}

export default function MyApplicationsPage() {
  const [studentId, setStudentId] = useState('')
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const rawApps = submittedId ? getApplicationsByStudentId(submittedId) : []
  const applications = sortByNewest(rawApps)
  const hasSearched = submittedId !== null
  const isValidId = /^\d{5}$/.test(studentId)
  const hasTyped = studentId.length > 0
  const isInvalid = hasTyped && !isValidId

  const handleResetStored = useCallback(() => {
    clearApplications()
    setSubmittedId(null)
    setStudentId('')
  }, [])

  const handleCheck = useCallback(() => {
    const digits = studentId.replace(/\D/g, '').slice(0, 5)
    setStudentId(digits)
    if (digits.length !== 5) return
    setScanState('scanning')
    setIsLoading(true)
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
    checkTimeoutRef.current = setTimeout(() => {
      setSubmittedId(digits)
      setScanState('idle')
      setIsLoading(false)
      checkTimeoutRef.current = null
    }, 800 + Math.random() * 400)
  }, [studentId])

  const handleIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
    setStudentId(digits)
    setSubmittedId(null)
    setScanState(digits.length === 5 ? 'armed' : 'idle')
  }, [])

  const transition = reducedMotion ? { duration: 0.01 } : { duration: 0.25, ease: 'easeOut' as const }

  return (
    <div
      className="relative min-h-screen pb-16 overflow-hidden"
      style={{ paddingTop: HEADER_OFFSET }}
    >
      {/* Subtle background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 50% 30% at 30% 10%, rgba(124,58,237,0.1), transparent 50%),
            radial-gradient(ellipse 40% 25% at 70% 90%, rgba(217,70,239,0.06), transparent 50%)
          `,
        }}
        aria-hidden
      />
      <Container size="narrow" className="relative min-w-0 max-w-full">
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: slideY }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="min-w-0"
        >
          {/* A) Compact header */}
          <header className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Applications
            </h1>
            <p className="mt-0.5 text-white/50 text-xs">
              Enter your 5-digit student ID to view submitted applications
            </p>
            <button
              type="button"
              onClick={handleResetStored}
              className="mt-2 text-xs text-white/40 hover:text-white/70 underline transition-colors"
            >
              Reset stored applications (for testing)
            </button>
          </header>

          {/* B) Compact search bar row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:items-stretch">
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <label htmlFor="my-apps-student-id" className="sr-only">
                  Student ID (5 digits)
                </label>
                <div className="relative flex items-center">
                  <span
                    className={cn(
                      'absolute left-3 flex h-4 w-4 items-center justify-center pointer-events-none transition-colors duration-200',
                      isValidId ? 'text-emerald-400/80' : 'text-white/40'
                    )}
                    aria-hidden
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                  </span>
                  <input
                    id="my-apps-student-id"
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={5}
                    placeholder="e.g. 79528"
                    value={studentId}
                    onChange={handleIdChange}
                    aria-label="Student ID (5 digits, numbers only)"
                    aria-invalid={isInvalid}
                    className={cn(
                      'w-full h-10 pl-9 pr-10 rounded-lg text-sm',
                      'bg-brand-deep/80 border border-white/10 text-white placeholder:text-white/35',
                      'focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple/50',
                      'transition-all duration-200',
                      isInvalid && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
                    )}
                  />
                  <ValidationIndicator
                    valid={isValidId}
                    invalid={isInvalid}
                    reducedMotion={reducedMotion}
                  />
                </div>
                <p className="sr-only">5 digits, numbers only</p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCheck}
                disabled={!isValidId || isLoading}
                aria-label={isLoading ? 'Checking applications' : 'View applications'}
                className="min-h-10 h-10 px-4 sm:flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <>
                    View applications
                    <ArrowRight className="ml-2 h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </>
                )}
              </Button>
            </div>

            {/* C) Radar scan area */}
            <RadarScan
              state={scanState}
              isScanning={isLoading}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* D) Results */}
          <div className="mt-6">
            <ResultsSection
              hasSearched={hasSearched}
              applications={applications}
              submittedId={submittedId}
              isLoading={isLoading}
              reducedMotion={reducedMotion}
            />
          </div>
        </motion.div>
      </Container>
    </div>
  )
}

function ValidationIndicator({
  valid,
  invalid,
  reducedMotion,
}: {
  valid: boolean
  invalid: boolean
  reducedMotion: boolean
}) {
  const t = reducedMotion ? 0.01 : 0.2
  return (
    <span
      className="absolute right-3 flex h-5 w-5 items-center justify-center pointer-events-none"
      aria-hidden
    >
      {valid && (
        <motion.span
          initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: t }}
          className="text-emerald-500"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </motion.span>
      )}
      {invalid && (
        <motion.span
          initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: t }}
          className="text-red-500"
        >
          <AlertCircle className="h-4 w-4" strokeWidth={2} />
        </motion.span>
      )}
      {!valid && !invalid && (
        <motion.span
          initial={false}
          animate={{ scale: reducedMotion ? 1 : 0.9, opacity: 0.5 }}
          transition={{ duration: t }}
          className="h-1.5 w-1.5 rounded-full bg-white/30"
        />
      )}
    </span>
  )
}

function RadarScan({
  state,
  isScanning,
  reducedMotion,
}: {
  state: ScanState
  isScanning: boolean
  reducedMotion: boolean
}) {
  const shouldAnimate = !reducedMotion && (state === 'armed' || state === 'scanning')
  const isBurst = isScanning
  const sweepDuration = isBurst ? '0.5s' : '4s'

  return (
    <div
      className="flex items-center justify-center w-full sm:w-32 sm:min-w-[8rem] h-24 sm:h-auto sm:min-h-[7rem] rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden"
      aria-hidden
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        {/* Concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/[0.06]"
              style={{ width: `${i * 33}%`, height: `${i * 33}%` }}
            />
          ))}
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
          <div className="absolute w-full h-px bg-white" />
          <div className="absolute h-full w-px bg-white" />
          <div className="absolute w-full h-px bg-white rotate-45" />
          <div className="absolute w-full h-px bg-white -rotate-45" />
        </div>
        {/* Sweep beam + glow dot (same rotation) */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            shouldAnimate && 'radar-sweep'
          )}
          style={
            shouldAnimate
              ? { animationDuration: sweepDuration, animationTimingFunction: 'linear' }
              : {}
          }
        >
          <div
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(124,58,237,0.1)_50deg,transparent_80deg)]"
            style={{ opacity: state === 'armed' && !isBurst ? 0.6 : 1 }}
          />
          <div
            className="absolute top-0 left-1/2 w-1.5 h-1.5 -mt-0.5 -ml-0.5 rounded-full bg-brand-purple/60 shadow-[0_0_6px_rgba(124,58,237,0.5)]"
            style={{ opacity: state === 'armed' ? 1 : 0.7 }}
          />
        </div>
        {/* Pulse ring on scan burst */}
        {isBurst && !reducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full border border-brand-purple/50"
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}
      </div>
    </div>
  )
}

function ResultsSection({
  hasSearched,
  applications,
  submittedId,
  isLoading,
  reducedMotion,
}: {
  hasSearched: boolean
  applications: ClubApplicationPayload[]
  submittedId: string | null
  isLoading: boolean
  reducedMotion: boolean
}) {
  const [selectedApp, setSelectedApp] = useState<ClubApplicationPayload | null>(null)
  const transition = reducedMotion ? { duration: 0.01 } : { duration: 0.25, ease: 'easeOut' }
  const stagger = reducedMotion ? 0 : 0.05

  if (!hasSearched && !isLoading) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: slideY }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] py-12 text-center"
      >
        <p className="text-white/50 text-sm">
          Enter your student ID and click View applications to see your submissions
        </p>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: slideY }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="rounded-lg border border-white/10 bg-brand-navy/40 py-8 px-5"
      >
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" aria-hidden />
          <span>Scanning applications…</span>
        </div>
      </motion.div>
    )
  }

  if (applications.length === 0) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: slideY }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="rounded-lg border border-white/10 bg-brand-navy/40 py-8 px-5"
      >
        <p className="text-white/80 text-sm mb-4">
          No applications found for this ID yet.
        </p>
        <Button href="/clubs" variant="outline" size="sm" className="inline-flex items-center gap-2">
          Browse clubs
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: slideY }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-white/50 mb-3">
        {applications.length} application{applications.length !== 1 ? 's' : ''} found
      </p>
      <div className="grid gap-2">
        {applications.map((app, i) => (
          <ApplicationCard
            key={`${app.club_id}-${app.submitted_at}-${i}`}
            app={app}
            index={i}
            stagger={stagger}
            reducedMotion={reducedMotion}
            onSelect={() => setSelectedApp(app)}
          />
        ))}
      </div>
      <div className="mt-3">
        <Link
          href="/clubs"
          className="text-xs font-medium text-white/50 hover:text-brand-purple transition-colors"
        >
          Browse all clubs
        </Link>
      </div>

      <ApplicationDetailDialog
        app={selectedApp}
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </motion.div>
  )
}

function ApplicationCard({
  app,
  index,
  stagger,
  reducedMotion,
  onSelect,
}: {
  app: ClubApplicationPayload
  index: number
  stagger: number
  reducedMotion: boolean
  onSelect: () => void
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: slideY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * stagger, ease: 'easeOut' }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-brand-navy/40 px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-brand-navy/50 group"
      >
        <span className="flex-1 min-w-0 font-medium text-white text-sm truncate">
          {app.club_name}
        </span>
        <span className="text-xs text-white/45 flex-shrink-0">
          {formatSubmittedAt(app.submitted_at)}
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-medium flex-shrink-0">
          Submitted
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-brand-purple transition-colors flex-shrink-0" strokeWidth={2} />
      </button>
    </motion.div>
  )
}

function ApplicationDetailDialog({
  app,
  open,
  onClose,
}: {
  app: ClubApplicationPayload | null
  open: boolean
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!app) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby="application-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-xl bg-brand-navy border border-white/10 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 id="application-dialog-title" className="text-lg font-bold text-white pr-4 truncate">
                {app.club_name}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                  Submitted
                </span>
                <span className="text-sm text-white/50">
                  {formatSubmittedAt(app.submitted_at)}
                </span>
              </div>

              <Button href={`/clubs/${app.club_id}`} size="sm" className="w-full justify-center gap-2">
                View club
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
