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

  const lastSpace = slice.slice(0, maxChars).trimEnd().lastIndexOf(' ')
  const cutAt = lastSpace > 0 ? lastSpace : maxChars
  const out = trimmed.slice(0, cutAt).trim()
  return { text: out + (out.length < trimmed.length ? '…' : ''), wasTruncated: out.length < trimmed.length }
}
