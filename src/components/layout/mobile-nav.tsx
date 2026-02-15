'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { REGISTER_ENDZONE_URL, SHOP_URL } from '@/lib/site-config'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

const navLinks = [
  { href: '/flag-football', label: "Girl's Flag Football" },
  { href: '/tackle-football', label: 'Tackle Football' },
  { href: '/academies-clinics', label: 'Academies & Clinics' },
  { href: '/ways-to-give', label: 'Ways to Give' },
  { href: '/become-a-partner', label: 'Partners' },
  { href: SHOP_URL, label: 'Shop', external: true },
]

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black"
        >
          <motion.nav
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex h-full flex-col items-center justify-center"
          >
            <ul className="flex flex-col items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.href + link.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                >
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="text-3xl font-medium text-white transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="text-3xl font-medium text-white transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.li>
              ))}
              <motion.li
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + navLinks.length * 0.05, duration: 0.3 }}
              >
                <Link
                  href={REGISTER_ENDZONE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="inline-flex items-center rounded-full bg-accent px-8 py-4 text-xl font-semibold text-white transition-all duration-200 hover:opacity-90"
                >
                  Register at Endzone
                </Link>
              </motion.li>
            </ul>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
