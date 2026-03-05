'use client'

import type { SchoolShowProduction } from '@/lib/schoolShowThemes'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

export interface StagePosterProps {
  imageSrc: string
  production: SchoolShowProduction
  className?: string
}

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
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%, transparent 100%)',
        }}
      />
    </div>
  )
}
