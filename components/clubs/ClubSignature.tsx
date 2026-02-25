'use client'

import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import type { ClubCategory } from '@/lib/clubCategory'

interface ClubSignatureProps {
  clubId: string
  category: ClubCategory
  tintHex: string
  className?: string
}

/**
 * Themed interactive "signature" element per club.
 * Each category gets a subtle, unique micro-interaction.
 * Respects prefers-reduced-motion.
 */
export function ClubSignature({ clubId, category, tintHex, className }: ClubSignatureProps) {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  switch (clubId) {
    case 'duke-of-edinburgh':
      return null
    case 'school-show':
      return null
    case 'mun':
      return null
    case 'tedx':
      return null
    case 'operation-smile':
    case 'unicef-ambassador':
    case 'spark-club':
    case 'interact-club':
      return <SparkleHover tintHex={tintHex} reduced={prefersReduced} className={className} />
    case 'eco-committee':
      return <LeafFloat tintHex={tintHex} reduced={prefersReduced} className={className} />
    default:
      return <SparkleHover tintHex={tintHex} reduced={prefersReduced} className={className} />
  }
}

/** Service clubs: gentle sparkle that appears on hover */
function SparkleHover({ tintHex, reduced, className }: { tintHex: string; reduced: boolean; className?: string }) {
  const [hovered, setHovered] = useState(false)

  const sparkles = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 80,
        delay: i * 0.15,
        size: 3 + Math.random() * 4,
      })),
    []
  )

  return (
    <div
      className={cn('relative h-8 w-full overflow-hidden', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered &&
        !reduced &&
        sparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              backgroundColor: tintHex,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
            transition={{
              duration: 0.8,
              delay: s.delay,
              ease: 'easeOut',
            }}
          />
        ))}
    </div>
  )
}



/** Eco Committee: floating leaf particles */
function LeafFloat({ tintHex, reduced, className }: { tintHex: string; reduced: boolean; className?: string }) {
  return (
    <div className={cn('relative h-8 w-full overflow-hidden', className)}>
      {!reduced && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute text-xs"
              style={{ color: tintHex, left: `${20 + i * 30}%` }}
              animate={{
                y: [-4, 4, -4],
                rotate: [-5, 5, -5],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            >
              ●
            </motion.div>
          ))}
        </>
      )}
    </div>
  )
}
