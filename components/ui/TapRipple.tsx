'use client'

import { useEffect, useRef, useCallback } from 'react'

const RIPPLE_SIZE = 120
const RIPPLE_DURATION_MS = 600

export function TapRipple() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rippleIdRef = useRef(0)

  const showRipple = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return
    const id = ++rippleIdRef.current
    const el = document.createElement('div')
    el.setAttribute('data-tap-ripple', String(id))
    el.className = 'tap-ripple'
    el.style.cssText = `
      position: fixed;
      left: ${clientX}px;
      top: ${clientY}px;
      width: ${RIPPLE_SIZE}px;
      height: ${RIPPLE_SIZE}px;
      margin-left: -${RIPPLE_SIZE / 2}px;
      margin-top: -${RIPPLE_SIZE / 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--cursor-accent, 217, 70, 239), 0.45) 0%, rgba(var(--cursor-accent-secondary, 124, 58, 237), 0.2) 50%, transparent 70%);
      pointer-events: none;
      transform: scale(0);
      opacity: 1;
      animation: tap-ripple-out ${RIPPLE_DURATION_MS}ms ease-out forwards;
      z-index: 9998;
    `
    container.appendChild(el)
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el)
    }, RIPPLE_DURATION_MS)
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const isTouchDevice = window.matchMedia('(hover: none)').matches
    if (!isTouchDevice) return

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches?.[0]
      if (touch) showRipple(touch.clientX, touch.clientY)
    }

    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => document.removeEventListener('touchend', handleTouchEnd)
  }, [showRipple])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden />
}
