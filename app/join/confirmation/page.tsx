'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const clubName = searchParams.get('club') || 'the club'
  const studentId = searchParams.get('studentId') || ''

  return (
    <div className="pt-24 pb-16 min-h-screen overflow-x-hidden">
      <Container size="narrow" className="min-w-0 max-w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Application submitted
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/70 mb-8"
          >
            Your application for <span className="text-white font-semibold">{clubName}</span> has been submitted successfully.
          </motion.p>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card padding="lg" className="text-left mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Application Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/60">Club</span>
                  <span className="text-white font-medium">{clubName}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/60">Student ID</span>
                  <span className="text-white font-medium">{studentId}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-white/60">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                    Submitted
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* What's next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card padding="lg" className="text-left mb-8 border-brand-blue/30 bg-brand-blue/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-blue/20 flex items-center justify-center text-brand-blue flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">What's Next?</h3>
                  <p className="text-white/70 text-sm">
                    Club leaders will review applications and contact you with next steps or meeting details.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button href="/clubs" size="lg">
              Browse More Clubs
            </Button>
            <Button href="/" variant="secondary" size="lg">
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16 min-h-screen">
        <Container size="narrow">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-brand-navy/60 animate-pulse" />
            <div className="h-10 w-48 mx-auto bg-brand-navy/60 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-64 mx-auto bg-brand-navy/60 rounded-lg animate-pulse" />
          </div>
        </Container>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}

