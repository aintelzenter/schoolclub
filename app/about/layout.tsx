import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About ANSXtra | Amnuaysilpa Extracurriculars',
  description: 'Learn about ANSXtra—our purpose, mission, and the team behind making club discovery and applications easy for Amnuaysilpa students (Y7–Y13).',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
