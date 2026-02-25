import type { SchoolShowProduction } from '@/lib/schoolShowThemes'

/**
 * Theme-specific School Show galleries.
 * Folder structure (public): /clubs/PHOTOS/School Show/<Theme Folder>/...
 */
export const SCHOOL_SHOW_PHOTOS: Record<SchoolShowProduction, string[]> = {
  mermaid: [
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3256.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3251.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3252.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3253.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3254.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3255.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3257.PNG',
    '/clubs/PHOTOS/School Show/Little Mermaid/IMG_3258.PNG',
  ],
  aladdin: [
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3259.PNG',
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3260.PNG',
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3261.PNG',
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3262.PNG',
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3263.PNG',
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3264.PNG',
    '/clubs/PHOTOS/School Show/Aladdin/IMG_3265.PNG',
  ],
  beauty: [
    '/clubs/PHOTOS/School Show/BATB/IMG_3001.JPG', // main photo
    '/clubs/PHOTOS/School Show/BATB/IMG_2997.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_2999.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_3002.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_3003.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_3004.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_3005.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_8257.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_8258.JPG',
    '/clubs/PHOTOS/School Show/BATB/IMG_8259.JPG',
    '/clubs/PHOTOS/School Show/BATB/MainSchoolshow.JPG',
  ],
  frozen: [
    '/clubs/PHOTOS/School Show/Frozen/IMG_3242.JPG', // main photo (first)
    '/clubs/PHOTOS/School Show/Frozen/IMG_3240.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3241.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3244.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3245.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3246.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3247.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3248.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3249.JPG',
    '/clubs/PHOTOS/School Show/Frozen/IMG_3250.JPG',
  ],
}

export function getSchoolShowPhotos(production: SchoolShowProduction): string[] {
  return SCHOOL_SHOW_PHOTOS[production] ?? []
}

