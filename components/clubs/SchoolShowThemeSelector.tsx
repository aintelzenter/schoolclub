'use client'

import {
  SCHOOL_SHOW_PRODUCTIONS,
  SCHOOL_SHOW_PRODUCTION_LABELS,
  SCHOOL_SHOW_THEMES,
  setStoredSchoolShowTheme,
  type SchoolShowProduction,
} from '@/lib/schoolShowThemes'
import { cn } from '@/lib/utils/cn'

interface SchoolShowThemeSelectorProps {
  value: SchoolShowProduction
  onChange: (production: SchoolShowProduction) => void
  reducedMotion: boolean
  className?: string
}

export function SchoolShowThemeSelector({
  value,
  onChange,
  reducedMotion,
  className,
}: SchoolShowThemeSelectorProps) {
  const theme = SCHOOL_SHOW_THEMES[value]

  const handleSelect = (production: SchoolShowProduction) => {
    onChange(production)
    setStoredSchoolShowTheme(production)
  }

  return (
    <div className={cn('w-full md:w-auto md:mt-0', className)}>
      <p className="text-white/70 text-[11px] font-medium mb-1">Production Theme</p>
      <div
        className="inline-flex flex-wrap gap-1 p-1 rounded-lg max-w-full backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid ${theme.accent}99`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          transition: reducedMotion ? 'none' : 'border-color 0.35s ease, box-shadow 0.35s ease',
        }}
        role="tablist"
        aria-label="Production theme"
      >
        {SCHOOL_SHOW_PRODUCTIONS.map((production) => {
          const isActive = value === production
          const pal = SCHOOL_SHOW_THEMES[production]
          return (
            <button
              key={production}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(production)}
              className={cn(
                'inline-flex items-center justify-center min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-deep)] md:min-h-0 md:px-2.5 md:py-1.5'
              )}
              style={{
                backgroundColor: isActive ? pal.accentSoft : 'rgba(255,255,255,0.04)',
                color: isActive ? pal.accent : 'rgba(255,255,255,0.75)',
                border: isActive ? `1px solid ${pal.accent}99` : '1px solid transparent',
                transitionDuration: reducedMotion ? '0.01ms' : '350ms',
                transitionProperty: 'background-color, color, border-color',
              }}
            >
              {SCHOOL_SHOW_PRODUCTION_LABELS[production]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
