/**
 * Club category for theming: Charity, Academic, Performing Arts, Leadership, Other.
 * Used to apply unique layout/motif per category (rounded vs sharp, accent style, etc.).
 */

export type ClubCategory =
  | 'charity'
  | 'academic'
  | 'performing-arts'
  | 'leadership'
  | 'other'

const CATEGORY_BY_ID: Record<string, ClubCategory> = {
  'operation-smile': 'charity',
  'unicef-ambassador': 'charity',
  'spark-club': 'charity',
  'eco-committee': 'charity',
  mun: 'academic',
  tedx: 'academic',
  'school-show': 'performing-arts',
  'duke-of-edinburgh': 'leadership',
  'interact-club': 'leadership',
}

export function getClubCategory(clubId: string): ClubCategory {
  return CATEGORY_BY_ID[clubId] ?? 'other'
}

/** Personalization section title per club type (one unique section per club) */
export const PERSONALIZATION_TITLE_BY_CATEGORY: Record<ClubCategory, string> = {
  charity: 'Impact & Outreach',
  academic: "What You'll Learn",
  'performing-arts': 'Past Highlights',
  leadership: "Skills You'll Gain",
  other: 'About',
}

/** Layout/spacing variation by category (for Header Grid and sections) */
export type CategoryLayout = {
  headerGap: string
  titleSize: string
  sectionHeaderStyle: 'soft' | 'crisp' | 'dynamic' | 'bold'
  cardRounding: string
  dividerStyle: 'calm' | 'sharp' | 'none'
  /** Thin vertical accent next to title (academic) */
  verticalAccent: boolean
  /** Journey-style bullets Step 1/2/3 (leadership) */
  journeyBullets: boolean
  /** Media card tilt on hover (performing-arts) */
  mediaTilt: boolean
  /** Warm glow behind title (charity) */
  titleGlow: boolean
}

export function getCategoryLayout(category: ClubCategory): CategoryLayout {
  switch (category) {
    case 'charity':
      return {
        headerGap: 'gap-4 md:gap-5',
        titleSize: 'text-2xl md:text-3xl lg:text-4xl',
        sectionHeaderStyle: 'soft',
        cardRounding: 'rounded-2xl',
        dividerStyle: 'calm',
        verticalAccent: false,
        journeyBullets: false,
        mediaTilt: false,
        titleGlow: true,
      }
    case 'academic':
      return {
        headerGap: 'gap-4 md:gap-5',
        titleSize: 'text-2xl md:text-3xl lg:text-4xl',
        sectionHeaderStyle: 'crisp',
        cardRounding: 'rounded-xl',
        dividerStyle: 'sharp',
        verticalAccent: true,
        journeyBullets: false,
        mediaTilt: false,
        titleGlow: false,
      }
    case 'performing-arts':
      return {
        headerGap: 'gap-4 md:gap-6',
        titleSize: 'text-2xl md:text-3xl lg:text-4xl',
        sectionHeaderStyle: 'dynamic',
        cardRounding: 'rounded-2xl',
        dividerStyle: 'calm',
        verticalAccent: false,
        journeyBullets: false,
        mediaTilt: true,
        titleGlow: false,
      }
    case 'leadership':
      return {
        headerGap: 'gap-4 md:gap-5',
        titleSize: 'text-2xl md:text-3xl lg:text-4xl font-extrabold',
        sectionHeaderStyle: 'bold',
        cardRounding: 'rounded-xl',
        dividerStyle: 'sharp',
        verticalAccent: false,
        journeyBullets: true,
        mediaTilt: false,
        titleGlow: false,
      }
    default:
      return {
        headerGap: 'gap-4 md:gap-5',
        titleSize: 'text-2xl md:text-3xl lg:text-4xl',
        sectionHeaderStyle: 'soft',
        cardRounding: 'rounded-2xl',
        dividerStyle: 'calm',
        verticalAccent: false,
        journeyBullets: false,
        mediaTilt: false,
        titleGlow: false,
      }
  }
}
