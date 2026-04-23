'use client'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils/cn'
import { AlertCircle, ArrowRight, Check, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  club_id: string
  status: 'pending' | 'approved' | 'rejected'
  applied_at: string
  reviewed_at?: string
  notes?: string
}

const CLUB_DISPLAY_NAMES: Partial<Record<string, string>> = {
  mun: 'Model United Nations',
  'duke-of-edinburgh': 'Duke of Edinburgh International Award',
}

function getClubDisplayName(clubId: string): string {
  return CLUB_DISPLAY_NAMES[clubId] ?? clubId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function MyApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchApplications()
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/applications')
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (app: Application) => {
    const confirmed = window.confirm(
      `Unenroll from ${getClubDisplayName(app.club_id)}? This will remove your application.`
    )

    if (!confirmed) return

    setRemovingId(app.id)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/applications?id=${encodeURIComponent(app.id)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to unenroll from club')
      }

      setApplications((prev) => prev.filter((item) => item.id !== app.id))
      setSuccess(`You have unenrolled from ${getClubDisplayName(app.club_id)}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unenroll from club')
    } finally {
      setRemovingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-brand-deep pt-24 pb-12">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <header>
            <h1 className="text-3xl font-bold text-white">My Applications</h1>
            <p className="text-white/70 mt-2">Track your club application status</p>
          </header>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-300">
              {success}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/50 mb-4">
                <Check className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-white/60">Start by browsing clubs and submitting applications.</p>
              </div>
              <Link href="/clubs">
                <Button className="mt-4">
                  Browse Clubs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {getClubDisplayName(app.club_id)}
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        Applied on {formatSubmittedAt(app.applied_at)}
                      </p>
                      {app.notes && (
                        <p className="text-white/70 text-sm mt-2">{app.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {app.status === 'approved' && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">Approved</span>
                        </div>
                      )}
                      {app.status === 'rejected' && (
                        <div className="flex items-center gap-2 text-red-400">
                          <X className="w-5 h-5" />
                          <span className="text-sm font-medium">Rejected</span>
                        </div>
                      )}
                      {app.status === 'pending' && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      )}

                      {(app.status === 'pending' || app.status === 'approved') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={removingId === app.id}
                          onClick={() => handleUnenroll(app)}
                        >
                          {removingId === app.id ? 'Unenrolling...' : 'Unenroll'}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  )
}