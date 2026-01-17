import { Metadata } from 'next'
import { HeroSection } from '@/components/sections/hero-section'
import { ProgramTiles } from '@/components/sections/program-tiles'

export const metadata: Metadata = {
  title: 'RiseUp Youth Football League | Building Champions On and Off the Field',
  description:
    'Youth football programs for ages 5-14. Building character, discipline, and teamwork through flag football, tackle football, and specialized academies & clinics.',
  openGraph: {
    title: 'RiseUp Youth Football League',
    description:
      'Youth football programs for ages 5-14. Building character, discipline, and teamwork through the game we love.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProgramTiles />
    </>
  )
}
