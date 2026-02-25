'use client'

import type { SchoolShowProduction } from '@/lib/schoolShowThemes'
import { cn } from '@/lib/utils/cn'

export interface StagePosterProps {
  /** School Show hero photo as background */
  imageSrc: string
  production: SchoolShowProduction
  className?: string
}


/**
 * Single right-column “Stage Poster” block: photo + bottom gradient, no theme tint.
 * Stays inside hero; no floating or absolute escape.
 */
export function StagePoster({
  imageSrc,
  production,
  className,
}: StagePosterProps) {
  return (
    <div
      className={cn(
        'relative w-full aspect-[4/5] max-h-[520px] rounded-[24px] overflow-hidden flex-shrink-0',
        'border border-white/[0.08]',
        'shadow-[0_24px_48px_rgba(0,0,0,0.35),0_12px_24px_rgba(0,0,0,0.25)]',
        className
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%, transparent 100%)',
        }}
      />
    </div>
  )
}
