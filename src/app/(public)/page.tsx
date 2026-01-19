import { Metadata } from 'next'
import { HeroSection } from '@/components/sections/hero-section'
import { ScrollRevealSection } from '@/components/sections/scroll-reveal-section'
import { ProgramTiles } from '@/components/sections/program-tiles'
import { DonationSection } from '@/components/sections/donation-section'
import { ImpactSection } from '@/components/sections/impact-section'
import { getImageContent, getContent } from '@/lib/content/queries'

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

export default async function HomePage() {
  // Fetch all content in parallel
  const [
    earthBackground,
    impactTitle,
    stat1Value,
    stat1Label,
    stat2Value,
    stat2Label,
    stat3Value,
    stat3Label,
    stat4Value,
    stat4Label,
    testimonialQuote,
    testimonialAuthor,
    testimonialRole,
  ] = await Promise.all([
    getImageContent('scroll_reveal.earth_background'),
    getContent('impact.title'),
    getContent('impact.stat_1_value'),
    getContent('impact.stat_1_label'),
    getContent('impact.stat_2_value'),
    getContent('impact.stat_2_label'),
    getContent('impact.stat_3_value'),
    getContent('impact.stat_3_label'),
    getContent('impact.stat_4_value'),
    getContent('impact.stat_4_label'),
    getContent('impact.testimonial_quote'),
    getContent('impact.testimonial_author'),
    getContent('impact.testimonial_role'),
  ])

  return (
    <>
      <HeroSection />
      <ScrollRevealSection
        title="BUILDING THE GREATEST GENERATION THAT HAS EVER EXISTED IN THE HISTORY OF THE WORLD."
        subtitle=""
        backgroundImage={earthBackground.url}
      />
      <ProgramTiles />
      <DonationSection />
      <ImpactSection
        title={impactTitle}
        stat1Value={stat1Value}
        stat1Label={stat1Label}
        stat2Value={stat2Value}
        stat2Label={stat2Label}
        stat3Value={stat3Value}
        stat3Label={stat3Label}
        stat4Value={stat4Value}
        stat4Label={stat4Label}
        testimonialQuote={testimonialQuote}
        testimonialAuthor={testimonialAuthor}
        testimonialRole={testimonialRole}
      />
    </>
  )
}
