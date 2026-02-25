import type { Club } from './types/club'

/**
 * Build a short summary for club cards: 1–2 sentences, no leading "<Club> is a...".
 * Uses club.summary if set; otherwise derives from description deterministically.
 * Never truncates mid-sentence; no ellipsis.
 */
export function getClubSummary(club: Club): string {
  if (club.summary && club.summary.trim()) return club.summary.trim()

  const raw = (club.tagline || club.description || '').trim()
  if (!raw) return ''

  let text = raw
  const name = club.name.trim()
  if (name) {
    const prefix = new RegExp(`^${escapeRegex(name)}\\s+is\\s+`, 'i')
    text = text.replace(prefix, '').trim()
  }
  const prefix2 = /^[A-Za-z][^.]*\s+is\s+/i
  if (prefix2.test(text)) text = text.replace(prefix2, '').trim()

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length === 0) return text

  const maxChars = 140
  let out = ''
  for (const s of sentences) {
    if (out.length + s.length > maxChars && out.length > 0) break
    out += (out ? ' ' : '') + s
  }
  return out.trim() || sentences[0].trim()
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
