import Link from 'next/link'

const quickLinks = [
  { href: '/flag-football', label: "Girl's Flag Football" },
  { href: '/tackle-football', label: 'Tackle Football' },
  { href: '/academies-clinics', label: 'Academies & Clinics' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/partners', label: 'Partners' },
]

const supportLinks = [
  { href: '/ways-to-give', label: 'Ways to Give' },
  { href: '/contact', label: 'Get in Touch' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white">
              RiseUp
            </Link>
            <p className="mt-4 text-sm text-white/60">
              Building champions on and off the field through youth football programs.
            </p>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Programs
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Organization
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.slice(3).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/40">
            &copy; {currentYear} RiseUp Youth Football League. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
