'use client'

import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LOGOS = [
  { src: '/clubs/PHOTOS/Logos/IMG_3165.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3166.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3167.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3175.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3176.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3177.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3183.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3184.PNG', name: 'Club' },
  { src: '/clubs/PHOTOS/Logos/IMG_3191.PNG', name: 'Club' },
]

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/clubs', label: 'Browse Clubs' },
  { href: '/my-applications', label: 'My Applications' },
  { href: '/about', label: 'About Us' },
]

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let raf = 0
    const handleScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
        raf = 0
      })
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const isHome = pathname === '/'
  const headerVisible = scrolled || !isHome

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[110] transition-[transform,opacity,background-color,border-color] duration-200 ease-out pt-[env(safe-area-inset-top)]',
        headerVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none',
        headerVisible && 'bg-brand-deep/90 backdrop-blur-xl border-b border-white/10'
      )}
    >
      <div className="max-w-7xl mx-auto pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <Link href="/" className="flex flex-shrink-0 items-center min-w-0">
              <Image
                src="/amnuaysilpa-logo.png"
                alt="Amnuaysilpa School"
                width={100}
                height={28}
                className="h-5 w-auto object-contain object-left opacity-90 sm:h-6"
              />
            </Link>
            <div className="hidden sm:block h-5 w-px bg-white/15 flex-shrink-0" />
            <div className="relative min-w-0 flex-1 overflow-hidden py-2">
              <div className="logo-marquee flex w-max shrink-0 items-center gap-5">
                {[...LOGOS, ...LOGOS].map((logo, i) => (
                  <div
                    key={i}
                    className="relative h-11 w-14 flex-shrink-0 sm:h-12 sm:w-16 md:h-14 md:w-20 flex items-center justify-center transition-transform duration-200 hover:scale-105"
                    title={logo.name}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={72}
                      height={52}
                      className="max-h-full max-w-full w-auto h-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out',
                    'border backdrop-blur-md',
                    isActive
                      ? 'text-white bg-brand-purple/25 border-brand-purple/50 shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                      : 'text-white/75 border-transparent hover:text-white hover:bg-white/[0.06] hover:border-white/5 hover:-translate-y-0.5'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <Link href="/about#logo" className="hidden md:flex flex-shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-90" aria-label="About the logo">
            <span className="relative flex h-12 w-12">
              <Image
                src="/ansxtra-logo.png"
                alt=""
                width={48}
                height={48}
                className="object-contain"
                style={{ width: '100%', height: '100%' }}
              />
            </span>
          </Link>

          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <Link href="/about#logo" className="flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-lg transition-opacity hover:opacity-90" aria-label="About the logo">
              <Image src="/ansxtra-logo.png" alt="" width={40} height={40} className="object-contain h-10 w-10" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] w-11 h-11 flex items-center justify-center text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-brand-deep/95 backdrop-blur-xl border-b border-white/10"
        >
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ease-out',
                    isActive
                      ? 'text-white bg-brand-purple/25 border border-brand-purple/40'
                      : 'text-white/75 hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </motion.div>
      )}
    </header>
  )
}
