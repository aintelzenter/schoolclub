/**
 * Derive short bullet highlights from club description/tagline.
 * getWhatWeDoBullets: 3 bullets, ~6–10 words each (scannable).
 * getDescriptionHighlights: longer bullets for "What you'll do" fallback.
 */

const MAX_WORDS_PER_BULLET = 10
const MAX_BULLET_LENGTH = 55

function trimToWords(s: string, maxWords: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return words.join(' ')
  return words.slice(0, maxWords).join(' ')
}

function trimToLength(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max + 1).search(/\s+\S*$/)
  return cut > 0 ? t.slice(0, cut).trim() : t.slice(0, max).trim()
}

/** 3 short bullets for "What we do" — ~6–10 words each */
export function getWhatWeDoBullets(description: string, tagline?: string): string[] {
  const text = (description || '').trim()
  if (!text) return []

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const bullets: string[] = []
  if (tagline && tagline.split(/\s+/).length <= MAX_WORDS_PER_BULLET) {
    bullets.push(trimToWords(tagline, MAX_WORDS_PER_BULLET))
  }
  for (const s of sentences) {
    if (bullets.length >= 3) break
    const trimmed = trimToWords(s, MAX_WORDS_PER_BULLET)
    if (trimmed && !bullets.some((b) => b === trimmed)) bullets.push(trimmed)
  }
  return bullets.slice(0, 3)
}

export function getDescriptionHighlights(description: string, tagline?: string): string[] {
  const text = (description || '').trim()
  if (!text) return []

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const bullets: string[] = []
  if (tagline && tagline.length < 80) {
    bullets.push(trimToLength(tagline, MAX_BULLET_LENGTH))
  }
  for (const s of sentences) {
    if (bullets.length >= 3) break
    const trimmed = trimToLength(s, MAX_BULLET_LENGTH)
    if (trimmed && !bullets.includes(trimmed)) bullets.push(trimmed)
  }
  return bullets.slice(0, 3)
}

/** First complete sentence(s) up to maxChars (word boundary, no ellipsis). */
export function getShortDescription(description: string, maxChars = 220): string {
  const t = description.trim()
  if (t.length <= maxChars) return t
  const cut = t.slice(0, maxChars + 1).search(/\s+\S*$/)
  const end = cut > 0 ? cut : maxChars
  return t.slice(0, end).trim()
}

/** Short summary for display (word boundary, no ellipsis). */
export function getShortSummaryTwoLines(description: string, maxChars = 120): string {
  const t = description.trim()
  if (!t) return ''
  if (t.length <= maxChars) return t
  const cut = t.slice(0, maxChars + 1).search(/\s+\S*$/)
  const end = cut > 0 ? cut : maxChars
  return t.slice(0, end).trim()
}
