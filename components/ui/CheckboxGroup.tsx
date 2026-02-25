'use client'

import { cn } from '@/lib/utils/cn'

interface CheckboxGroupOption {
  value: string
  label: string
}

interface CheckboxGroupProps {
  label: string
  name: string
  options: CheckboxGroupOption[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  required?: boolean
  helperText?: string
}

export function CheckboxGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  helperText,
}: CheckboxGroupProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/90 mb-3">
        {label}
        {required && <span className="text-brand-pink ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => {
          const checked = value.includes(option.value)
          return (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-4 min-h-[44px] px-4 py-3 rounded-xl cursor-pointer',
                'bg-brand-navy/60 border border-white/10',
                'transition-all duration-200',
                'hover:border-white/20 hover:bg-brand-navy/80',
                checked && 'border-brand-pink/50 bg-brand-pink/10',
                error && 'border-red-500/50'
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) onChange([...value, option.value])
                  else onChange(value.filter((v) => v !== option.value))
                }}
                className="sr-only"
              />
              <span
                className={cn(
                  'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  'transition-all duration-200',
                  checked
                    ? 'border-brand-pink bg-brand-pink'
                    : 'border-white/30 bg-transparent'
                )}
                aria-hidden
              >
                {checked && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-white/90 text-sm leading-relaxed">
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-white/50">{helperText}</p>}
    </div>
  )
}

