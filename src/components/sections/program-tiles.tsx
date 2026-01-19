import Link from 'next/link'
import { getContent, getImageContent } from '@/lib/content/queries'
import { EditableText } from '@/components/editable/editable-text'
import { ProgramTileEditable } from './program-tile-editable'
import type { ImageContentKey } from '@/types/content'

interface ProgramTile {
  href: string
  title: string
  ageRange: string
  imageKeys: [ImageContentKey, ImageContentKey, ImageContentKey]
}

const programs: ProgramTile[] = [
  {
    href: '/flag-football',
    title: "GIRL'S FLAG FOOTBALL",
    ageRange: 'Ages 5-8',
    imageKeys: [
      'programs.flag_football.image_1',
      'programs.flag_football.image_2',
      'programs.flag_football.image_3',
    ],
  },
  {
    href: '/tackle-football',
    title: 'TACKLE FOOTBALL',
    ageRange: 'Ages 9-14',
    imageKeys: [
      'programs.tackle_football.image_1',
      'programs.tackle_football.image_2',
      'programs.tackle_football.image_3',
    ],
  },
  {
    href: '/academies-clinics',
    title: 'ACADEMIES & CLINIC',
    ageRange: 'All Ages',
    imageKeys: [
      'programs.academies.image_1',
      'programs.academies.image_2',
      'programs.academies.image_3',
    ],
  },
]

export async function ProgramTiles() {
  // Fetch all program images in parallel (3 per program = 9 total)
  const allImagePromises = programs.flatMap((p) =>
    p.imageKeys.map((key) => getImageContent(key))
  )
  const allImages = await Promise.all(allImagePromises)

  return (
    <section id="programs" className="relative z-40 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program, programIndex) => {
            // Each program has 3 images, so get the slice for this program
            const startIndex = programIndex * 3
            const programImages = program.imageKeys.map((key, imgIndex) => {
              const imageData = allImages[startIndex + imgIndex]
              return {
                src: imageData.url,
                alt: imageData.alt,
                contentKey: key,
                position: imageData.position,
              }
            })

            return (
              <ProgramTileEditable
                key={program.href}
                href={program.href}
                title={program.title}
                ageRange={program.ageRange}
                images={programImages}
                // First tile: fade sequentially every 2 seconds
                rotationInterval={programIndex === 0 ? 2000 : undefined}
                rotationMode={programIndex === 0 ? 'sequential' : 'random'}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
