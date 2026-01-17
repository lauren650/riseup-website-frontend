import Link from 'next/link'

interface ProgramTile {
  href: string
  title: string
  ageRange: string
  imageSrc: string
}

const programs: ProgramTile[] = [
  {
    href: '/flag-football',
    title: 'FLAG FOOTBALL',
    ageRange: 'Ages 5-8',
    imageSrc: '/images/flag-football.jpg',
  },
  {
    href: '/tackle-football',
    title: 'TACKLE FOOTBALL',
    ageRange: 'Ages 9-14',
    imageSrc: '/images/tackle-football.jpg',
  },
  {
    href: '/academies-clinics',
    title: 'ACADEMIES & CLINICS',
    ageRange: 'All Ages',
    imageSrc: '/images/academies-clinics.jpg',
  },
]

export function ProgramTiles() {
  return (
    <section id="programs" className="bg-black py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
          Our Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link
              key={program.href}
              href={program.href}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${program.imageSrc})` }}
              />

              {/* Fallback background for when image doesn't exist */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                  {program.title}
                </h3>
                <p className="text-sm text-white/60 mt-1">{program.ageRange}</p>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent rounded-lg transition-colors duration-300 group-hover:border-accent" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
