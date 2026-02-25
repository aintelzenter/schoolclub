'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { HeroImageShuffle } from './HeroImageShuffle'

// Typewriter effect for the tagline
function TypewriterText() {
  const phrases = [
    'Built different',
    'For students, by students',
    'Where students lead',
    'Connect beyond the classroom',
    'Beyond the classroom walls',
    'Student-powered community',
    'Create, connect, grow',
    'Your passions, your way',
    'Where ideas take flight',
    'More than a club',
  ]
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const phrase = phrases[currentPhrase]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < phrase.length) {
          setDisplayText(phrase.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentPhrase((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? 30 : 80)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentPhrase, phrases])

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-[100vh] min-h-[100dvh] flex items-center pt-[var(--header-height)] -mt-[var(--header-height)] overflow-hidden">
      {/* Background image slideshow - full bleed, fixed position */}
      <HeroImageShuffle />

      {/* Gradient orbs - subtle, GPU-friendly (reduced motion: static) */}
      <motion.div
        animate={{ scale: 1.05, opacity: 0.4 }}
        transition={{ duration: 0.1 }}
        className="absolute top-1/4 -right-1/4 w-[480px] h-[480px] rounded-full bg-brand-purple/20 blur-[100px] z-[1] will-change-auto"
      />
      <motion.div
        animate={{ scale: 1.05, opacity: 0.3 }}
        transition={{ duration: 0.1 }}
        className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-brand-pink/15 blur-[90px] z-[1] will-change-auto"
      />

      {/* Left-side scrim - dark gradient behind text area only */}
      <div
        className="absolute left-0 top-0 bottom-0 w-full max-w-[min(100%,42rem)] z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(11, 16, 32, 0.75) 0%, rgba(15, 23, 42, 0.5) 55%, rgba(15, 23, 42, 0) 100%)',
        }}
      />

      <Container className="relative z-10">
        <div className="max-w-2xl">
          {/* Hero content - single column over background */}
          <div className="pt-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-5 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
            >
              <span className="text-brand-pink" style={{ textShadow: '0 0 24px rgba(217,70,239,0.4), 0 0 48px rgba(217,70,239,0.3)' }}>ANS</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">Xtra</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base sm:text-lg text-white/90 font-normal leading-relaxed mb-5"
              style={{ textShadow: '0 0 12px rgba(255,255,255,0.35), 0 0 24px rgba(255,255,255,0.2)' }}
            >
              Extracurriculars Hub
            </motion.p>

            {/* Typewriter tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg mb-7 h-7"
            >
              <TypewriterText />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="hero-btn-breathe">
                  <Button href="/clubs" size="lg">
                    Browse Clubs
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="hero-btn-breathe">
                  <Button href="#how-it-works" variant="outline" size="lg">
                    How It Works
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
