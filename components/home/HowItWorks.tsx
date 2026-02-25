'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { cn } from '@/lib/utils/cn'

const SEARCH_WORDS = ['TEDx', 'MUN', 'SPARK', 'Interact']
const CAROUSEL_INTERVAL_MS = 2500

const steps = [
  {
    number: 1,
    title: 'Browse Clubs',
    bullets: [
      'Explore Secondary clubs and filter by year.',
      'Find activities that match your interests.',
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Learn About Clubs',
    bullets: [
      'Read descriptions, schedules, and leaders.',
      'Check requirements before you join.',
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Join Instantly',
    bullets: [
      'Submit your student ID and answer a few questions.',
      'Quick registration—no extra forms.',
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

function usePrefersReducedMotion() {
  const reduced = useReducedMotion()
  return reduced ?? false
}

const PREVIEW_PANEL_CLASS =
  'min-h-[180px] md:min-h-[200px] max-h-[min(38vh,240px)] rounded-xl border border-white/10 bg-brand-navy/40 overflow-hidden flex flex-col'

export function HowItWorks() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <Section id="how-it-works" className="relative overflow-hidden py-8 md:py-10">
      {/* Very subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <Container className="relative">
        <header className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
            How it works
          </h2>
          <p className="mt-1.5 text-white/60 text-sm md:text-base max-w-xl">
            Three quick steps to join a club—no confusion, no extra forms.
          </p>
        </header>

        {/* Alternating: step → animation → step → animation → step → animation */}
        <div className="flex flex-col gap-6 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              {/* Step block */}
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-purple text-xs font-semibold text-white">
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white">{step.title}</h3>
                  <ul className="mt-1 space-y-0.5 text-sm text-white/60 list-none">
                    {step.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
                <span className="shrink-0 text-white/40">{step.icon}</span>
              </div>

              {/* Animation for this step */}
              <div className={cn(PREVIEW_PANEL_CLASS)} aria-label={`Preview: ${step.title}`}>
                <div className="flex-1 min-h-0 p-4 md:p-5 flex flex-col">
                  {step.number === 1 && <PreviewBrowse reducedMotion={reducedMotion} />}
                  {step.number === 2 && <PreviewLearn reducedMotion={reducedMotion} />}
                  {step.number === 3 && <PreviewJoin reducedMotion={reducedMotion} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function PreviewBrowse({ reducedMotion }: { reducedMotion: boolean }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const word = SEARCH_WORDS[wordIndex]

  useEffect(() => {
    if (reducedMotion) {
      setTyped(word)
      return
    }
    let i = 0
    const full = word
    const write = () => {
      if (i <= full.length) {
        setTyped(full.slice(0, i))
        i++
        setTimeout(write, 120)
      } else {
        setTimeout(() => {
          setWordIndex((idx) => (idx + 1) % SEARCH_WORDS.length)
          setTyped('')
        }, 1500)
      }
    }
    const t = setTimeout(write, 400)
    return () => clearTimeout(t)
  }, [wordIndex, word, reducedMotion])

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 shrink-0">
        <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-white/90 text-xs font-mono min-w-[72px]">
          {typed}
          {!reducedMotion && <span className="animate-pulse text-brand-purple">|</span>}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 flex-1 min-h-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            whileHover={reducedMotion ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
            className="rounded bg-white/5 border border-white/10 p-1.5 flex flex-col gap-1 min-h-0"
          >
            <div className="h-5 rounded bg-white/10 w-full shrink-0" />
            <div className="h-1.5 rounded bg-white/5 w-3/4 shrink-0" />
            <div className="h-1.5 rounded bg-white/5 w-1/2 shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const MOCK_CHIPS = ['Tue 4pm', 'Room 12', 'Y10–13']
const MOCK_IMAGES = 4

function PreviewLearn({ reducedMotion }: { reducedMotion: boolean }) {
  const [chipIndex, setChipIndex] = useState(0)
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const t = setInterval(() => setChipIndex((i) => (i + 1) % MOCK_CHIPS.length), 1800)
    return () => clearInterval(t)
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return
    const t = setInterval(() => setCarouselIndex((i) => (i + 1) % MOCK_IMAGES), CAROUSEL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [reducedMotion])

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0">
      <div className="h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0" />
      <div className="flex gap-1.5 flex-wrap shrink-0">
        {MOCK_CHIPS.map((label, i) => (
          <span
            key={label}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] border transition-colors duration-200',
              i === chipIndex
                ? 'bg-brand-purple/20 border-brand-purple/40 text-white'
                : 'bg-white/5 border-white/10 text-white/60'
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="h-2 rounded bg-white/5 w-full shrink-0" />
      <div className="h-2 rounded bg-white/5 w-4/5 shrink-0" />
      <div className="flex gap-1 mt-auto shrink-0">
        {Array.from({ length: MOCK_IMAGES }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-8 flex-1 rounded bg-white/10 border transition-opacity duration-200',
              i === carouselIndex ? 'border-brand-purple/50 opacity-100' : 'border-white/10 opacity-50'
            )}
          />
        ))}
      </div>
    </div>
  )
}

const SAMPLE_ID = '79528'

function PreviewJoin({ reducedMotion }: { reducedMotion: boolean }) {
  const [digits, setDigits] = useState(0)
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setDigits(SAMPLE_ID.length)
      setShowCheck(true)
      return
    }
    if (digits >= SAMPLE_ID.length) {
      const t = setTimeout(() => setShowCheck(true), 300)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setDigits((d) => d + 1), 180)
    return () => clearTimeout(t)
  }, [digits, reducedMotion])

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0">
      <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 shrink-0">
        <label className="text-[10px] text-white/50 block mb-0.5">Student ID</label>
        <div className="flex items-center gap-1.5">
          <span className="text-white/90 font-mono text-xs">
            {SAMPLE_ID.slice(0, digits)}
            {!reducedMotion && digits < SAMPLE_ID.length && (
              <span className="animate-pulse text-brand-purple">|</span>
            )}
          </span>
          {showCheck && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="text-brand-purple shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.span>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="h-6 rounded bg-white/5 border border-white/10 w-full shrink-0" />
        <div className="h-6 rounded bg-white/5 border border-white/10 w-full shrink-0" />
        <div className="h-6 rounded bg-brand-purple/30 border border-brand-purple/50 w-2/3 mt-auto shrink-0" />
      </div>
    </div>
  )
}
