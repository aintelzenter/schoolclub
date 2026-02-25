'use client'

import { Club } from '@/lib/types/club'
import { getClubSummary } from '@/lib/clubSummary'
import { getClubTintRgb, getClubTintGradientCss, getClubTintHex } from '@/lib/clubHues'
import { getClubType } from '@/lib/clubTypes'
import { cn } from '@/lib/utils/cn'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ClubCardProps {
  club: Club
  compact?: boolean
}

export function ClubCard({ club, compact }: ClubCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [canHover, setCanHover] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const reducedMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 280, damping: 35 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 280, damping: 35 })

  useEffect(() => {
    setCanHover(typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!canHover || reducedMotion || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const x = (e.clientX - rect.left) / w - 0.5
      const y = (e.clientY - rect.top) / h - 0.5
      mouseX.set(x)
      mouseY.set(y)
    },
    [canHover, reducedMotion, mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  if (club.id === 'blank') {
    return (
      <div
        className="relative w-full rounded-2xl border border-dashed border-white/20 overflow-hidden flex flex-col bg-brand-navy/20"
        aria-hidden
      >
        <div className="relative w-full overflow-hidden aspect-[16/9] bg-brand-navy/30" />
        <div className="px-4 py-2.5 min-h-0 border-t border-dashed border-white/10 bg-brand-navy/40" />
      </div>
    )
  }

  const tintRgb = getClubTintRgb(club.id)
  const tintHex = getClubTintHex(club.id)
  const tintGradientCss = getClubTintGradientCss(tintRgb, { spotlight: false })
  const clubType = getClubType(club.id)

  const cardSummary = getClubSummary(club)

  const isSchoolShow = club.id === 'school-show'
  const photoSection = (
    <div className="relative w-full flex-shrink-0 overflow-hidden aspect-[16/9] bg-brand-navy/20">
      <img
        src={club.image}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full object-cover object-center',
          isSchoolShow && 'scale-125'
        )}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 50%, rgba(11, 16, 32, 0.92) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: tintGradientCss }}
        aria-hidden
      />
      {/* Very subtle noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
    </div>
  )

  const accentBarColor = `rgba(${tintRgb.r},${tintRgb.g},${tintRgb.b},0.35)`

  const infoPanel = (
    <div className="relative pl-4 pr-4 py-2.5 min-h-0 bg-brand-navy/90 border-t border-white/10 flex flex-col gap-2 flex-1 min-h-[5.5rem]">
      {/* Club-color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
        style={{ backgroundColor: accentBarColor }}
        aria-hidden
      />
      <h3 className="club-card-title font-extrabold text-white text-sm tracking-tight transition-colors duration-200 min-h-[1.25rem]">{club.displayName ?? club.name}</h3>

      {cardSummary && (
        <p className="text-white/80 text-xs leading-snug min-h-[2rem]">
          {cardSummary}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 min-h-[1.5rem]">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/90 border border-white/10">
          {club.yearGroup}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/90 border border-white/10">
          {clubType}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/90 border border-white/10">
          {club.meetingDay}
        </span>
      </div>
      <div className="flex items-center justify-end mt-auto pt-0.5">
        <span className="inline-flex items-center gap-0.5 text-brand-pink/85 group-hover:text-brand-pink text-[11px] font-medium transition-colors">
          View details
          <motion.span
            className="inline-block"
            animate={isHovered && canHover ? { x: 2 } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            →
          </motion.span>
        </span>
      </div>
    </div>
  )

  // No "Read more" — summary only; full description on club page
  const wrapperClass = cn(
    'group relative w-full rounded-2xl border border-white/10 overflow-hidden flex flex-col',
    'bg-brand-navy/40 backdrop-blur-sm shadow-card',
    canHover && 'club-card-hue-hover'
  )

  const hueRgbString = `${tintRgb.r},${tintRgb.g},${tintRgb.b}`

  return (
    <>
      <Link
        ref={cardRef}
        href={`/clubs/${club.id}`}
        className={cn(wrapperClass, 'h-full flex flex-col')}
        style={{ '--card-hue': hueRgbString } as React.CSSProperties}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        aria-label={`View ${club.displayName ?? club.name}`}
      >
        {/* Subtle depth: top highlight + bottom grounding fade */}
        <div
          className="absolute inset-0 pointer-events-none z-10 rounded-2xl overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.08) 0%, transparent 100%)',
            }}
          />
        </div>
        <motion.div
          className="flex flex-col h-full relative"
          animate={canHover && !reducedMotion ? { y: isHovered ? -6 : 0 } : { y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={
            canHover && !reducedMotion
              ? {
                  rotateX,
                  rotateY,
                  transformPerspective: 800,
                }
              : undefined
          }
        >
          {photoSection}
          {infoPanel}
        </motion.div>
      </Link>
    </>
  )
}
