import clubsData from '@/data/clubs.json'
import { Club } from './types/club'

const BLANK_PLACEHOLDER_ID = 'blank'

const PinnedOrder: string[] = [
  'duke-of-edinburgh',
  'school-show',
  'tedx',
  'mun',
  'operation-smile',
  'interact-club',
]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

export function getClubs(): Club[] {
  const clubs = (clubsData as Club[]).filter((c) => c.id !== BLANK_PLACEHOLDER_ID)
  const byId = new Map(clubs.map((c) => [c.id, c]))
  const pinned: Club[] = []
  for (const id of PinnedOrder) {
    const club = byId.get(id)
    if (club) pinned.push(club)
  }
  const pinnedIds = new Set(PinnedOrder)
  const rest = clubs
    .filter((c) => !pinnedIds.has(c.id))
    .sort((a, b) => hashId(a.id) - hashId(b.id))
  return [...pinned, ...rest]
}

export function getClubById(id: string): Club | undefined {
  return (clubsData as Club[]).find(club => club.id === id)
}

export function getFeaturedClubs(): Club[] {
  return getClubs().slice(0, 6)
}

