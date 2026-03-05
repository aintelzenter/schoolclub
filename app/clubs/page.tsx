'use client'

import { ClubGrid } from '@/components/clubs/ClubGrid'
import { FilterBar, type YearGroupFilter } from '@/components/clubs/FilterBar'
import { Container } from '@/components/ui/Container'
import { getClubs } from '@/lib/data'
import { Club } from '@/lib/types/club'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

function clubMatchesYear(club: Club, year: number): boolean {
  const min = club.yearGroupMin ?? 7
  const max = club.yearGroupMax ?? 13
  return year >= min && year <= max
}

export default function ClubsPage() {
  const allClubs = getClubs()
  const [yearGroupFilter, setYearGroupFilter] = useState<YearGroupFilter>('all')

  const filteredClubs = useMemo(() => {
    if (yearGroupFilter === 'all') return allClubs
    return allClubs.filter((club) => clubMatchesYear(club, yearGroupFilter as number))
  }, [allClubs, yearGroupFilter])

  return (
    <div className="relative pt-8 pb-16 min-h-screen">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <Container className="relative z-10">
        {/* Header + Year filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-xl font-semibold text-white">
              Browse <span className="text-brand-pink font-semibold">clubs</span>
            </h1>
            <p className="text-white/50 text-sm mt-1 font-normal">
              Showing <span className="font-semibold">{filteredClubs.length}</span> of <span className="font-semibold">{allClubs.length}</span> clubs
            </p>
          </div>
          <div className="flex-shrink-0">
            <FilterBar
              yearGroupFilter={yearGroupFilter}
              onYearGroupFilterChange={setYearGroupFilter}
            />
          </div>
        </motion.div>

        {/* Club grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <ClubGrid clubs={filteredClubs} />
        </motion.div>
      </Container>
    </div>
  )
}
