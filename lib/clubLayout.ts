/**
 * Per-club layout configuration for detail pages.
 * Layout 1: Hero (left text + right visual) → About + Quick Details row → Gallery → Contact
 * Layout 2: Hero → About (compact) + Gallery side-by-side on desktop → Contact
 * Layout 3: Hero → Gallery immediately (small) → About below → Contact
 */

export type ClubDetailLayout = 'layout1' | 'layout2' | 'layout3'

const CLUB_LAYOUT: Record<string, ClubDetailLayout> = {
  'operation-smile': 'layout2',
  'school-show': 'layout2', // has compact Overview row
  mun: 'layout1',
  'spark-club': 'layout2',
  'interact-club': 'layout2',
  'eco-committee': 'layout2',
  'duke-of-edinburgh': 'layout1',
  'unicef-ambassador': 'layout2',
  tedx: 'layout3',
}

export function getClubDetailLayout(clubId: string): ClubDetailLayout {
  return CLUB_LAYOUT[clubId] ?? 'layout2'
}
