'use client'

import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, fullWidth, children, disabled, style, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold rounded-xl transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out',
      'hover:scale-[1.03] active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-brand-pink/50 focus:ring-offset-2 focus:ring-offset-brand-deep',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100',
      'min-h-[40px]',
      variant === 'primary' && [
        'bg-[linear-gradient(165deg,#e04ef5_0%,#c73dd9_30%,#8b5cf6_65%,#6d28d9_100%)] text-white',
        'shadow-[0_2px_12px_rgba(217,70,239,0.3),0_0_24px_rgba(124,58,237,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]',
        'border border-white/20',
        'hover:shadow-[0_6px_24px_rgba(217,70,239,0.4),0_0_32px_rgba(124,58,237,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] hover:border-white/25',
        'active:shadow-[0_2px_12px_rgba(124,58,237,0.25)] active:translate-y-0',
      ],
      variant === 'secondary' && [
        'bg-white/[0.04] text-white border border-white/10 backdrop-blur-md',
        'hover:bg-white/[0.08] hover:border-white/20',
        'active:translate-y-0',
      ],
      variant === 'outline' && [
        'bg-transparent text-white/95 border border-white/30 backdrop-blur-sm',
        'hover:bg-white/[0.06] hover:border-white/40 hover:text-white',
        'active:translate-y-0',
      ],
      variant === 'ghost' && [
        'bg-transparent text-white/70 border border-transparent',
        'hover:text-white hover:bg-white/5',
      ],
      size === 'sm' && 'px-3.5 py-2 text-sm min-h-[36px]',
      size === 'md' && 'px-5 py-2.5 text-[15px]',
      size === 'lg' && 'px-5 py-2.5 text-[15px] min-h-[44px]',
      fullWidth && 'w-full',
      className
    )

    if (href && !disabled) {
      return (
        <Link href={href} className={baseStyles} style={style}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={baseStyles} disabled={disabled} style={style} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
