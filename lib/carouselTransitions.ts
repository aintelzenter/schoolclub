/**
 * Club-specific carousel transition presets.
 * Each club gets a distinct animation that fits its theme.
 */

export type CarouselTransitionPreset =
  | 'slide'       // default: horizontal slide
  | 'fade'        // crossfade
  | 'warm'        // gentle scale + fade (Operation Smile)
  | 'stage'       // vertical slide, stage curtain (School Show)
  | 'journey'     // slide + slight scale (Duke of Edinburgh)
  | 'crisp'       // snappy horizontal slide (MUN)
  | 'idea'        // scale up from center (TEDx)
  | 'spark'       // quick slide with bounce (SPARK)
  | 'community'   // soft fade + slide (Interact)
  | 'growth'      // fade + upward drift (Eco Committee)
  | 'hope'        // fade + scale up (UNICEF)

export type SlideVariants = {
  enter: object | ((d: number) => object)
  center: object
  exit: object | ((d: number) => object)
}

export type TransitionConfig = {
  duration: number
  ease: readonly number[] | number[] | string
}

/** Snappy ease: quick out, smooth end */
const EASE_OUT = [0.22, 0.61, 0.36, 1] as const

const slide: SlideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 28 : -28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -28 : 28, opacity: 0 }),
}

const fade: SlideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

const warm: SlideVariants = {
  enter: (d: number) => ({ scale: 0.98, opacity: 0, x: d > 0 ? 16 : -16 }),
  center: { scale: 1, opacity: 1, x: 0 },
  exit: (d: number) => ({ scale: 0.98, opacity: 0, x: d > 0 ? -16 : 16 }),
}

const stage: SlideVariants = {
  enter: (d: number) => ({ y: d > 0 ? 24 : -24, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d: number) => ({ y: d > 0 ? -24 : 24, opacity: 0 }),
}

const journey: SlideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 32 : -32, scale: 0.98, opacity: 0 }),
  center: { x: 0, scale: 1, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -32 : 32, scale: 0.98, opacity: 0 }),
}

const crisp: SlideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -36 : 36, opacity: 0 }),
}

const idea: SlideVariants = {
  enter: { scale: 0.97, opacity: 0 },
  center: { scale: 1, opacity: 1 },
  exit: { scale: 0.97, opacity: 0 },
}

const spark: SlideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0, scale: 0.99 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0, scale: 0.99 }),
}

const community: SlideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 20 : -20, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -20 : 20, opacity: 0 }),
}

const growth: SlideVariants = {
  enter: { y: 16, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: -16, opacity: 0 },
}

const hope: SlideVariants = {
  enter: { scale: 0.98, opacity: 0, y: 10 },
  center: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.98, opacity: 0, y: -10 },
}

export const CAROUSEL_VARIANTS: Record<CarouselTransitionPreset, SlideVariants> = {
  slide,
  fade,
  warm,
  stage,
  journey,
  crisp,
  idea,
  spark,
  community,
  growth,
  hope,
}

export const CAROUSEL_TRANSITIONS: Record<CarouselTransitionPreset, TransitionConfig> = {
  slide: { duration: 0.24, ease: EASE_OUT },
  fade: { duration: 0.22, ease: 'easeOut' },
  warm: { duration: 0.24, ease: EASE_OUT },
  stage: { duration: 0.24, ease: EASE_OUT },
  journey: { duration: 0.24, ease: EASE_OUT },
  crisp: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
  idea: { duration: 0.22, ease: EASE_OUT },
  spark: { duration: 0.22, ease: EASE_OUT },
  community: { duration: 0.24, ease: EASE_OUT },
  growth: { duration: 0.24, ease: EASE_OUT },
  hope: { duration: 0.24, ease: EASE_OUT },
}

const PRESET_BY_CLUB_ID: Record<string, CarouselTransitionPreset> = {
  'operation-smile': 'warm',
  'school-show': 'stage',
  'duke-of-edinburgh': 'journey',
  mun: 'crisp',
  tedx: 'idea',
  'spark-club': 'spark',
  'interact-club': 'community',
  'eco-committee': 'growth',
  'unicef-ambassador': 'hope',
}

export function getCarouselPresetForClub(clubId: string): CarouselTransitionPreset {
  return PRESET_BY_CLUB_ID[clubId] ?? 'slide'
}
