
export type ClubTintRgb = { r: number; g: number; b: number }

const TINT_HEX: Record<string, string> = {
  'operation-smile': '#FFC107', // brighter saturated yellow (distinct from SPARK orange)
  tedx: '#ff3b30', // red
  'duke-of-edinburgh': '#34c759', // green / forest (DoE page uses bronze/silver/gold themes)
  'unicef-ambassador': '#0a84ff', // blue
  mun: '#64d2ff', // light blue (distinct from Interact)
  'school-show': '#ec4899', // magenta / pink
  'spark-club': '#F97316', // orange (distinct from Operation Smile yellow)
  'interact-club': '#d946ef', // fuchsia (distinct from SPARK orange)
  'eco-committee': '#14b8a6', // teal (distinct from Duke green, fits eco/water theme)
}

const FALLBACK_PALETTE: string[] = [
  '#f59e0b', // amber
  '#f97316', // orange
  '#ef4444', // rose-red
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#22c55e', // emerald
  '#eab308', // yellow-gold
  '#0ea5e9', // sky
  '#d946ef', // fuchsia
  '#a78bfa', // violet (distinct from magenta)
]

/** Deterministic hash: stable index per clubId for unique color assignment */
function hashClubId(clubId: string): number {
  let h = 0
  for (let i = 0; i < clubId.length; i++) {
    h = (h << 5) - h + clubId.charCodeAt(i)
    h = h & h // cast to 32-bit
  }
  return Math.abs(h)
}

function hexToRgb(hex: string): ClubTintRgb {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function getClubTintRgb(clubId: string): ClubTintRgb {
  if (TINT_HEX[clubId]) return hexToRgb(TINT_HEX[clubId])
  const idx = hashClubId(clubId) % FALLBACK_PALETTE.length
  return hexToRgb(FALLBACK_PALETTE[idx])
}

export function getClubTintGradientCss(
  rgb: ClubTintRgb,
  options: { spotlight?: boolean } = {}
): string {
  const { r, g, b } = rgb
  const strong = options.spotlight ? 0.35 : 0.24
  const weak = options.spotlight ? 0.12 : 0.08
  return `linear-gradient(135deg, rgba(${r},${g},${b},${strong}) 0%, rgba(${r},${g},${b},${weak}) 60%, rgba(0,0,0,0) 100%)`
}

export function getClubTintHex(clubId: string): string {
  if (TINT_HEX[clubId]) return TINT_HEX[clubId]
  const idx = hashClubId(clubId) % FALLBACK_PALETTE.length
  return FALLBACK_PALETTE[idx]
}
