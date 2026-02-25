'use client'

import { MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * On touch-only devices (iPad, phones) we use reducedMotion="never" so all
 * Framer Motion animations run. On hover-capable devices we respect the
 * system "Reduce motion" setting ("user").
 */
export function MotionConfigTouchAware({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState<'never' | 'user'>('never')

  useEffect(() => {
    const hasHover = window.matchMedia('(hover: hover)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReducedMotion(hasHover && prefersReduced ? 'user' : 'never')
  }, [])

  return (
    <MotionConfig reducedMotion={reducedMotion}>
      {children}
    </MotionConfig>
  )
}
