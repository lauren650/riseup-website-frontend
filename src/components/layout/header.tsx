'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MobileNav } from './mobile-nav'
import { EditableImage } from '@/components/editable/editable-image'
import { useEditMode } from '@/contexts/edit-mode-context'
import { cn } from '@/lib/utils'
import { REGISTER_ENDZONE_URL, SHOP_URL } from '@/lib/site-config'

const navLinks = [
  { href: '/flag-football', label: "Girl's Flag Football" },
  { href: '/tackle-football', label: 'Tackle Football' },
  { href: '/academies-clinics', label: 'Academies & Clinics' },
  { href: '/ways-to-give', label: 'Ways to Give' },
  { href: '/partners', label: 'Partners' },
  { href: SHOP_URL, label: 'Shop', external: true },
]

interface HeaderProps {
  logoSrc?: string
  logoAlt?: string
}

export function Header({ logoSrc = '/images/logo.png', logoAlt = 'RiseUp Youth Football' }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isEditMode } = useEditMode()

  useEffect(() => {
    const handleScroll = () => {
      // Add blur when scrolled past hero section
      setIsScrolled(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logoElement = (
    <EditableImage
      contentKey="header.logo"
      src={logoSrc}
      alt={logoAlt}
      width={260}
      height={104}
      className="h-16 lg:h-20 xl:h-24 w-auto object-contain"
      page="all"
      section="header"
      priority
    />
  )

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-black/98 backdrop-blur-lg shadow-xl" 
        : "bg-gradient-to-b from-black/95 via-black/70 to-transparent"
    )}>
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-6 py-3">
        {/* Logo - no Link wrapper in edit mode to allow clicking upload */}
        {isEditMode ? (
          <div className="z-50 relative shrink-0">{logoElement}</div>
        ) : (
          <Link href="/" className="z-50 relative shrink-0">{logoElement}</Link>
        )}

        {/* Desktop Nav */}
        <ul className="hidden items-center lg:flex mx-4 shrink min-w-0 gap-[clamp(0.5rem,1.5vw,1.25rem)]">
          {navLinks.map((link) => (
            <li key={link.href + link.label}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[clamp(0.75rem,1vw,1rem)] font-medium text-white/90 transition-all duration-200 hover:text-white hover:scale-105 whitespace-nowrap inline-block"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-[clamp(0.75rem,1vw,1rem)] font-medium text-white/90 transition-all duration-200 hover:text-white hover:scale-105 whitespace-nowrap inline-block"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Register at Endzone - Desktop */}
        <Link
          href={REGISTER_ENDZONE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center rounded-full bg-accent px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.4rem,0.6vw,0.625rem)] text-[clamp(0.75rem,1vw,1rem)] font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black whitespace-nowrap shrink-0"
        >
          Register at Endzone
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              isOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              isOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <MobileNav isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  )
}
