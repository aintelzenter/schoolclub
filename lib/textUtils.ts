/**
 * Truncate text at a sentence boundary before maxChars.
 * Never cuts mid-sentence. If no sentence boundary exists before maxChars,
 * cuts at last space and appends "…".
 */

const SENTENCE_END = /[.!?]/

export function truncateAtSentence(
  text: string,
  maxChars: number
): { text: string; wasTruncated: boolean } {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length <= maxChars) {
    return { text: trimmed, wasTruncated: false }
  }

  const slice = trimmed.slice(0, maxChars + 1)
  // Find last sentence-ending character (. ! ?) in the slice
  let lastSentenceEnd = -1
  for (let i = slice.length - 1; i >= 0; i--) {
    if (SENTENCE_END.test(slice[i])) {
      lastSentenceEnd = i
      break
    }
  }

  if (lastSentenceEnd >= 0) {
    const out = trimmed.slice(0, lastSentenceEnd + 1).trim()
    return { text: out, wasTruncated: true }
  }

  // No sentence boundary: cut at last space before maxChars
  const lastSpace = slice.slice(0, maxChars).trimEnd().lastIndexOf(' ')
  const cutAt = lastSpace > 0 ? lastSpace : maxChars
  const out = trimmed.slice(0, cutAt).trim()
  return { text: out + (out.length < trimmed.length ? '…' : ''), wasTruncated: out.length < trimmed.length }
}
