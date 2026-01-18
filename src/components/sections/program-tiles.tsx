import Link from 'next/link'
import { getContent, getImageContent } from '@/lib/content/queries'
import { EditableText } from '@/components/editable/editable-text'
import { ProgramTileEditable } from './program-tile-editable'
import type { ImageContentKey } from '@/types/content'

interface ProgramTile {
  href: string
  title: string
  ageRange: string
  imageKey: ImageContentKey
}

const programs: ProgramTile[] = [
  {
    href: '/flag-football',
    title: 'FLAG FOOTBALL',
    ageRange: 'Ages 5-8',
    imageKey: 'programs.flag_football.image',
  },
  {
    href: '/tackle-football',
    title: 'TACKLE FOOTBALL',
    ageRange: 'Ages 9-14',
    imageKey: 'programs.tackle_football.image',
  },
  {
    href: '/academies-clinics',
    title: 'ACADEMIES & CLINICS',
    ageRange: 'All Ages',
    imageKey: 'programs.academies.image',
  },
]

export async function ProgramTiles() {
  // Fetch section title and all program images in parallel
  const [sectionTitle, ...programImages] = await Promise.all([
    getContent('programs.section_title'),
    ...programs.map((p) => getImageContent(p.imageKey)),
  ])

  return (
    <section id="programs" className="bg-black py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <EditableText
          contentKey="programs.section_title"
          as="h2"
          className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          page="homepage"
          section="programs"
        >
          {sectionTitle}
        </EditableText>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <ProgramTileEditable
              key={program.href}
              href={program.href}
              title={program.title}
              ageRange={program.ageRange}
              imageSrc={programImages[index].url}
              imageAlt={programImages[index].alt}
              imageContentKey={program.imageKey}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
