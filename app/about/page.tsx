'use client'

import { Container } from '@/components/ui/Container'
import { LogoMeaning } from '@/components/about/LogoMeaning'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

const CREATOR_PHOTOS: Record<string, string> = {
  nanon: '/clubs/PHOTOS/creator/Nanon.PNG',
  eve: '/clubs/PHOTOS/creator/Eve.PNG',
  teeoff: '/clubs/PHOTOS/creator/Teeoff.PNG',
}

const TEAM = [
  { id: 'eve', name: 'Anya Towashiraporn', role: 'Operations & Data Lead', email: '79592@student.amnuaysilpa.ac.th', photo: CREATOR_PHOTOS.eve },
  { id: 'nanon', name: 'Nanon Jirapongsuwan', role: 'Founder & Lead Developer', email: '79528@student.amnuaysilpa.ac.th', photo: CREATOR_PHOTOS.nanon },
  { id: 'teeoff', name: 'Jittipon Tanpoonkiat', role: 'Communications and Outreach Lead', email: '79599@student.amnuaysilpa.ac.th', photo: CREATOR_PHOTOS.teeoff },
]

const METRICS = [
  { value: '9+', label: 'Clubs' },
  { value: '500+', label: 'Students' },
  { value: 'Y7–Y13', label: 'Year range' },
  { value: 'Student-led', label: 'Team' },
]

const transitionShort = (reduceMotion: boolean | null) =>
  reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
const initialUp = (reduceMotion: boolean | null) => reduceMotion ? false : { opacity: 0, y: 10 }

function TeamRow({
  member,
  index,
  reduceMotion,
  transition,
}: {
  member: (typeof TEAM)[number]
  index: number
  reduceMotion: boolean | null
  transition: object
}) {
  const [imgError, setImgError] = useState(false)
  return (
    <motion.div
      initial={initialUp(reduceMotion)}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.06 }}
      className="flex flex-col items-center text-center group py-3 px-4 rounded-xl transition-colors duration-200 hover:bg-white/[0.03]"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-2 ring-white/20 ring-offset-2 ring-offset-[var(--brand-deep)] group-hover:ring-brand-pink/50 transition-colors duration-200 shrink-0">
        {!imgError ? (
          <Image src={member.photo} alt={member.name} fill className="object-cover object-top" sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px" onError={() => setImgError(true)} />
        ) : (
          <div className="absolute inset-0 bg-white/10 flex items-center justify-center text-white/40 text-xs">Photo</div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <span className="font-semibold text-white text-base sm:text-lg group-hover:underline underline-offset-2 decoration-brand-pink/60 transition-all duration-200">{member.name}</span>
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/40 shrink-0">Y12</span>
        <span className="text-white/50 text-xs shrink-0">·</span>
        <span className="text-white/60 text-sm">{member.role}</span>
      </div>
      <a
        href={`mailto:${member.email}`}
        className="mt-1.5 text-xs sm:text-sm text-white/50 hover:text-brand-pink hover:underline underline-offset-2 transition-colors duration-200 inline-flex items-center gap-1.5 opacity-70 group-hover:opacity-100"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {member.email}
      </a>
    </motion.div>
  )
}

export default function AboutPage() {
  const reduceMotion = useReducedMotion()
  const transition = transitionShort(reduceMotion)

  return (
    <div className="min-h-screen pb-12 pt-6">
      <Container size="narrow" className="max-w-3xl">
        {/* Animated header */}
        <header className="pb-6 border-b border-white/10 scroll-mt-header">
          <motion.span
            initial={initialUp(reduceMotion)}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="inline-block text-xs font-medium uppercase tracking-widest text-white/40 mb-3"
          >
            {(() => {
              const text = "Amnuaysilpa's Extracurricular Hub";
              const seen = new Set<string>();
              let seenXTR = false;
              return text.split('').map((char, i) => {
                const lower = char.toLowerCase();
                if (lower === 'x' || lower === 't' || lower === 'r') seenXTR = true;
                const isFirstOf = /[nsxtr]/.test(lower) && !seen.has(lower);
                const isFirstA = lower === 'a' && !seen.has('a');
                const isSecondA = lower === 'a' && seen.has('a') && seenXTR && !seen.has('a2');
                const isTarget = isFirstOf || isFirstA || isSecondA;
                if (isFirstOf) seen.add(lower);
                if (isFirstA) seen.add('a');
                if (isSecondA) seen.add('a2');
                return isTarget ? (
                  <span key={i} className="about-section-heading">{char}</span>
                ) : (
                  <span key={i}>{char}</span>
                );
              });
            })()}
          </motion.span>
          <motion.h1
            initial={initialUp(reduceMotion)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.05 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-white"
          >
            About <span className="about-section-heading">ANSXtra</span>
          </motion.h1>
          <motion.div
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="mt-3 h-0.5 w-20 origin-left bg-gradient-to-r from-brand-pink via-brand-pink/80 to-transparent rounded-full shadow-[0_0_12px_rgba(217,70,239,0.4)]"
            aria-hidden
          />
        </header>

        {/* Our mission */}
        <section className="py-6 border-b border-white/10 scroll-mt-header">
          <motion.div
            initial={initialUp(reduceMotion)}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className="max-w-prose"
          >
            <p className="about-section-heading text-xs font-medium uppercase tracking-widest mb-3">Our mission</p>
            <p className="text-sm text-white/70 leading-relaxed mb-4 max-w-xl">
              ANSXtra brings club discovery and applications into one clear place. Students can compare clubs, understand what’s required, and apply with confidence. We’re building a more transparent, student-friendly system for Y7–Y13.
            </p>
            <ul className="space-y-2.5">
              {[
                'One place to browse every club and key details at a glance.',
                'Clear expectations — so joining isn’t confusing.',
                'Faster applications with consistent questions and requirements.',
                'More students involved through better visibility and access.',
              ].map((bullet, i) => (
                <motion.li
                  key={i}
                  initial={initialUp(reduceMotion)}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...transition, delay: reduceMotion ? 0 : i * 0.05 }}
                  className="text-sm text-white/70 leading-relaxed flex gap-2.5 items-start"
                >
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-brand-pink/80" aria-hidden />
                  <span>{bullet}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* What we stand for */}
        <section className="py-4 border-b border-white/10 scroll-mt-header">
          <motion.p
            initial={initialUp(reduceMotion)}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className="about-section-heading text-xs font-medium uppercase tracking-widest mb-4"
          >
            What we stand for
          </motion.p>
          <motion.div
            initial={initialUp(reduceMotion)}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { title: 'Clarity', desc: 'Clear expectations, requirements and details.' },
              { title: 'Equal Access', desc: 'All secondary clubs are visible in one place.' },
              { title: 'Growth', desc: 'Shaping leadership, portfolios, and skills.' },
              { title: 'Student-led', desc: 'Designed by students, for students.' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={initialUp(reduceMotion)}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...transition, delay: reduceMotion ? 0 : 0.06 + i * 0.04 }}
                whileHover={reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden pl-5 pr-4 py-4 transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-pink/60 to-brand-purple/50 opacity-80 group-hover:opacity-100 transition-opacity rounded-l-xl"
                  aria-hidden
                />
                <span className="text-[10px] font-bold text-white/30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-0.5 text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Core Team */}
        <section className="py-10 md:py-12 border-b border-white/10 scroll-mt-header text-center">
          <p className="about-section-heading text-xs font-medium uppercase tracking-widest mb-6">Core Team</p>
          <motion.div
            initial={initialUp(reduceMotion)}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-10 md:gap-14"
          >
            {TEAM.map((member, i) => (
              <TeamRow key={member.id} member={member} index={i} reduceMotion={reduceMotion} transition={transition} />
            ))}
          </motion.div>
        </section>

        {/* Logo meaning — A, +, 4 with glow */}
        <LogoMeaning />

        {/* Stats */}
        <section className="py-6 border-b border-white/10 scroll-mt-header">
          <motion.div
            initial={initialUp(reduceMotion)}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={transition}
            className="flex flex-wrap justify-center gap-8 md:gap-12"
          >
            {METRICS.map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-lg md:text-xl font-semibold text-white">{m.value}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">{m.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Report issues — compact pill */}
        <motion.footer
          initial={initialUp(reduceMotion)}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={transition}
          className="pt-6"
        >
          <div className="flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2.5">
            <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-white/70">
              Found an error or bug? Email{' '}
              <a href="mailto:79599@student.amnuaysilpa.ac.th" className="text-white/90 hover:text-brand-pink underline underline-offset-2 decoration-white/30 hover:decoration-brand-pink/70 transition-colors">
                79599@student.amnuaysilpa.ac.th
              </a>
              {' '}or{' '}
              <a href="mailto:79592@student.amnuaysilpa.ac.th" className="text-white/90 hover:text-brand-pink underline underline-offset-2 decoration-white/30 hover:decoration-brand-pink/70 transition-colors">
                79592@student.amnuaysilpa.ac.th
              </a>
            </p>
          </div>
        </motion.footer>
      </Container>
    </div>
  )
}
