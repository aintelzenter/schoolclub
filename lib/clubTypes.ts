const CLUB_TYPE_BY_ID: Record<string, string> = {
  'operation-smile': 'Charity',
  'school-show': 'Performing Arts',
  mun: 'Academic',
  'spark-club': 'Charity',
  'interact-club': 'Leadership',
  'eco-committee': 'Charity',
  'duke-of-edinburgh': 'Leadership',
  'unicef-ambassador': 'Charity',
  tedx: 'Academic',
}

const FALLBACK_TYPES = ['Other']

export function getClubType(clubId: string): string {
  return CLUB_TYPE_BY_ID[clubId] ?? FALLBACK_TYPES[clubId.length % FALLBACK_TYPES.length]
}
