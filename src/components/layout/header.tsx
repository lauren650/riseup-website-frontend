'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MobileNav } from './mobile-nav'
import { EditableImage } from '@/components/editable/editable-image'
import { useEditMode } from '@/contexts/edit-mode-context'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/flag-football', label: 'Flag Football' },
  { href: '/tackle-football', label: 'Tackle Football' },
  { href: '/academies-clinics', label: 'Academies & Clinics' },
  { href: '/ways-to-give', label: 'Ways to Give' },
  { href: '/partners', label: 'Partners' },
  { href: '/about', label: 'About' },
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
      className="h-24 w-auto object-contain"
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
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo - no Link wrapper in edit mode to allow clicking upload */}
        {isEditMode ? (
          <div className="z-50 relative">{logoElement}</div>
        ) : (
          <Link href="/" className="z-50 relative">{logoElement}</Link>
        )}

        {/* Desktop Nav - centered on screen */}
        <ul className="hidden items-center gap-6 md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-base font-medium text-white/90 transition-all duration-200 hover:text-white hover:scale-110 whitespace-nowrap inline-block"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
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
