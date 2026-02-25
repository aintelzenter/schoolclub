import { FeaturedClubs } from '@/components/home/FeaturedClubs'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedClubs />
    </>
  )
}
