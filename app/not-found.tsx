'use client'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | ANSXtra'
  }, [])

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center overflow-x-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto"
        >
          {/* 404 graphic */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <span className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-pink/20 to-brand-purple/20 leading-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-brand-navy/80 border border-white/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 mb-8"
          >
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button href="/" size="lg">
              Go Home
            </Button>
            <Button href="/clubs" variant="secondary" size="lg">
              Browse Clubs
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  )
}
