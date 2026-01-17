'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MobileNav } from './mobile-nav'

const navLinks = [
  { href: '/flag-football', label: 'Flag Football' },
  { href: '/tackle-football', label: 'Tackle Football' },
  { href: '/academies-clinics', label: 'Academies & Clinics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/partners', label: 'Partners' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white z-50 relative">
          RiseUp
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
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

        {/* Desktop CTA Button */}
        <Link
          href="/ways-to-give"
          className="hidden rounded-full bg-accent px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 md:block"
        >
          Donate
        </Link>

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
