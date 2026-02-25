'use client'

import { useEffect, useRef, useState } from 'react'

const SPOTLIGHT_RADIUS = 420
const LERP = 0.12
const TRAIL_LENGTH = 6
const TRAIL_LERP = 0.22
const TRAIL_DOT_SIZE = 6

export function CursorTrail() {
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)

  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const trailPos = useRef<{ x: number; y: number }[]>(Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 })))
  const rafRef = useRef<number>()
  const elRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const isDesktop =
      window.matchMedia('(min-width: 768px)').matches &&
      window.matchMedia('(hover: none)').matches === false
    if (!isDesktop) return

    const handleMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
    }

    const handleLeave = () => {
      visibleRef.current = false
      setVisible(false)
    }

    const animate = () => {
      const dx = target.current.x - pos.current.x
      const dy = target.current.y - pos.current.y
      pos.current.x += dx * LERP
      pos.current.y += dy * LERP
      const el = elRef.current
      if (el) {
        el.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%,-50%)`
      }
      // Trail: lead dot follows cursor, each next dot follows the previous with lerp
      trailPos.current[0].x += (target.current.x - trailPos.current[0].x) * TRAIL_LERP
      trailPos.current[0].y += (target.current.y - trailPos.current[0].y) * TRAIL_LERP
      for (let i = 1; i < TRAIL_LENGTH; i++) {
        trailPos.current[i].x += (trailPos.current[i - 1].x - trailPos.current[i].x) * TRAIL_LERP
        trailPos.current[i].y += (trailPos.current[i - 1].y - trailPos.current[i].y) * TRAIL_LERP
      }
      trailRefs.current.forEach((dot, i) => {
        if (dot && trailPos.current[i]) {
          const p = trailPos.current[i]
          const opacity = 1 - (i / TRAIL_LENGTH) * 0.85
          const scale = 1 - (i / TRAIL_LENGTH) * 0.5
          dot.style.transform = `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) scale(${scale})`
          dot.style.opacity = String(opacity)
        }
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      {/* Subtle pink/cool trail dots — same RAF, minimal DOM */}
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <div
          key={i}
          ref={(r) => { trailRefs.current[i] = r }}
          className="absolute left-0 top-0 w-0 h-0 rounded-full"
          style={{
            width: TRAIL_DOT_SIZE,
            height: TRAIL_DOT_SIZE,
            marginLeft: -TRAIL_DOT_SIZE / 2,
            marginTop: -TRAIL_DOT_SIZE / 2,
            background: `radial-gradient(circle, rgba(var(--cursor-accent),0.5) 0%, rgba(var(--cursor-accent-secondary),0.25) 70%, transparent 100%)`,
            boxShadow: '0 0 8px rgba(var(--cursor-accent),0.35)',
            willChange: 'transform, opacity',
          }}
        />
      ))}
      <div
        ref={elRef}
        className="absolute left-0 top-0 w-0 h-0 rounded-full transition-[background] duration-500 ease-out"
        style={{
          width: SPOTLIGHT_RADIUS * 2,
          height: SPOTLIGHT_RADIUS * 2,
          marginLeft: -SPOTLIGHT_RADIUS,
          marginTop: -SPOTLIGHT_RADIUS,
          background: `radial-gradient(circle, rgba(var(--cursor-accent),var(--cursor-spotlight-opacity)) 0%, rgba(var(--cursor-accent-secondary),calc(var(--cursor-spotlight-opacity) * 0.5)) 40%, transparent 70%)`,
          willChange: 'transform',
        }}
      />
    </div>
  )
}
