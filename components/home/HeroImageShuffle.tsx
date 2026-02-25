'use client'

import { useMemo, useEffect, useState } from 'react'

// Predefined hero images from /PHOTOS/Shuffle/
const HERO_IMAGES = [
  '/clubs/PHOTOS/Shuffle/1.JPG',
  '/clubs/PHOTOS/Shuffle/2.JPG',
  '/clubs/PHOTOS/Shuffle/3.JPG',
  '/clubs/PHOTOS/Shuffle/4.JPG',
  '/clubs/PHOTOS/Shuffle/5.JPG',
  '/clubs/PHOTOS/Shuffle/7.JPG',
  '/clubs/PHOTOS/Shuffle/9.JPG',
  '/clubs/PHOTOS/Shuffle/10.JPG',
  '/clubs/PHOTOS/Shuffle/11.jpeg',
  '/clubs/PHOTOS/Shuffle/12.JPG',
  '/clubs/PHOTOS/Shuffle/14.JPG',
  '/clubs/PHOTOS/Shuffle/15.JPG',
  '/clubs/PHOTOS/Shuffle/16.JPG',
  '/clubs/PHOTOS/Shuffle/18.JPG',
  '/clubs/PHOTOS/Shuffle/19.JPG',
  '/clubs/PHOTOS/Shuffle/20.JPG',
  '/clubs/PHOTOS/Shuffle/750_8105.PNG',
  '/clubs/PHOTOS/Shuffle/IMG_8469.JPG',
  '/clubs/PHOTOS/Shuffle/IMG_8471.JPG',
  '/clubs/PHOTOS/Shuffle/IMG_8478.JPG',
  '/clubs/PHOTOS/Shuffle/PTA_3377.PNG',
  '/clubs/PHOTOS/Shuffle/PTA_3669.PNG',
]

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const INTERVAL_MS = 4500
const FADE_DURATION_MS = 1200

export function HeroImageShuffle() {
  const images = useMemo(() => shuffleArray(HERO_IMAGES), [])
  const [step, setStep] = useState(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouchOnly = window.matchMedia('(hover: none)').matches
    // On touch devices (iPad, phones) always run shuffle so the main experience isn’t static.
    // Only skip when user has reduce motion AND a hover-capable device (desktop).
    if (prefersReduced && !isTouchOnly) return
    const interval = setInterval(() => {
      setStep((s) => s + 1)
    }, INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  const index = step % images.length
  const visibleSlot = step % 2
  const slotAImageIndex = step % 2 === 0 ? index : (index + 1) % images.length
  const slotBImageIndex = step % 2 === 0 ? (index + 1) % images.length : index

  const slotAImage = images[slotAImageIndex]
  const slotBImage = images[slotBImageIndex]

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base gradient - ensures dark fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-navy to-brand-deep" />

      {/* Slot A */}
      <div
        key={`a-${slotAImageIndex}`}
        className="absolute inset-0 transition-opacity ease-out"
        style={{
          opacity: visibleSlot === 0 ? 1 : 0,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
      >
        <img
          src={slotAImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[0.8] saturate-[0.85] contrast-[1.02] animate-hero-zoom"
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* Slot B */}
      <div
        key={`b-${slotBImageIndex}`}
        className="absolute inset-0 transition-opacity ease-out"
        style={{
          opacity: visibleSlot === 1 ? 1 : 0,
          transitionDuration: `${FADE_DURATION_MS}ms`,
        }}
      >
        <img
          src={slotBImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-[0.8] saturate-[0.85] contrast-[1.02] animate-hero-zoom"
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* Darker overlay for readability and cleaner look */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(11, 16, 32, 0.78) 0%, rgba(15, 23, 42, 0.45) 40%, rgba(15, 23, 42, 0.35) 100%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.25) 100%)
          `,
        }}
      />
    </div>
  )
}
