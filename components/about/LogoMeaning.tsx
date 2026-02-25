'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

const PARTS = [
  {
    id: 'a',
    symbol: 'A',
    label: 'Our club',
    text: 'The A stands for Amnuaysilpa—our school and our community. This is where we build it.',
  },
  {
    id: 'plus',
    symbol: '+',
    label: 'Extracurricular',
    text: 'The + is the “extra” in ANSXtra: everything beyond the classroom. Clubs, events, and real experience.',
  },
  {
    id: 'four',
    symbol: '4',
    label: 'Beyond the 4.0',
    text: "There's more than getting a GPA of 4. Life isn't measured only by the transcript—passion, growth, and connection happen outside the report card.",
  },
] as const

export function LogoMeaning() {
  const [active, setActive] = useState<typeof PARTS[number]['id'] | null>(null)

  return (
    <section id="logo" className="py-8 border-b border-white/10 scroll-mt-header">
      <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-4">
        The logo
      </p>
      <div className="flex flex-col items-center">
        {/* Logo image + interactive A / + / 4 */}
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <Image
              src="/ansxtra-logo.png"
              alt="ANSXtra logo"
              width={120}
              height={120}
              className="h-24 w-24 md:h-28 md:w-28 object-contain drop-shadow-[0_0_24px_rgba(217,70,239,0.15)]"
            />
            {/* Glow ring when a part is selected */}
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 pointer-events-none rounded-full"
                  style={{
                    boxShadow: '0 0 32px rgba(217,70,239,0.35), 0 0 64px rgba(124,58,237,0.2)',
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            {PARTS.map((part) => {
              const isActive = active === part.id
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setActive(isActive ? null : part.id)}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl px-4 py-3 min-h-[44px] min-w-[72px] md:min-w-[88px]
                    transition-all duration-300 ease-out
                    ${isActive
                      ? 'text-white scale-105'
                      : 'text-white/70 hover:text-white/90'
                    }
                  `}
                >
                  {/* Glow behind symbol when selected */}
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      boxShadow: isActive
                        ? '0 0 24px rgba(217,70,239,0.4), 0 0 48px rgba(124,58,237,0.25), inset 0 0 20px rgba(217,70,239,0.08)'
                        : '0 0 0 transparent',
                    }}
                    transition={{ duration: 0.25 }}
                    style={{ background: isActive ? 'rgba(217,70,239,0.08)' : 'transparent' }}
                  />
                  <span
                    className={`
                      relative z-10 text-2xl md:text-3xl font-bold tabular-nums
                      ${part.id === 'plus' ? 'text-brand-pink' : ''}
                      ${isActive ? 'drop-shadow-[0_0_12px_rgba(217,70,239,0.6)]' : ''}
                    `}
                  >
                    {part.symbol}
                  </span>
                  <span className="relative z-10 text-xs font-medium uppercase tracking-wider mt-1 text-white/50">
                    {part.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Meaning text */}
        <div className="mt-4 min-h-[4.5rem] w-full max-w-md text-center">
          <AnimatePresence mode="wait">
            {active ? (
              PARTS.filter((p) => p.id === active).map((part) => (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-white/80 leading-relaxed"
                >
                  {part.text}
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-white/45"
              >
                Click a symbol to see what it means.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
