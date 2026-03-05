export type ClubDetailLayout = 'layout1' | 'layout2' | 'layout3'

const CLUB_LAYOUT: Record<string, ClubDetailLayout> = {
  'operation-smile': 'layout2',
  'school-show': 'layout2',
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
