'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SubNavItem {
  id: string;
  label: string;
}

interface SubNavigationProps {
  items: SubNavItem[];
  className?: string;
  showRegisterButton?: boolean;
  registerLink?: string;
}

export function SubNavigation({ 
  items, 
  className,
  showRegisterButton = false,
  registerLink = '#',
}: SubNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || '');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Make nav sticky after scrolling past hero
      setIsSticky(window.scrollY > 400);

      // Update active section based on scroll position
      const sections = items.map(item => document.getElementById(item.id));
      const currentSection = sections.find(section => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={cn(
        'border-b border-white/10 transition-all duration-300',
        isSticky 
          ? 'fixed left-0 right-0 top-[112px] z-40 shadow-xl bg-black/98 backdrop-blur-lg' 
          : 'bg-transparent',
        className
      )}
    >
      <div className="mx-auto max-w-7xl overflow-x-auto">
        <div className="flex items-center justify-center gap-3 px-6 py-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-muted-foreground hover:text-accent'
              )}
            >
              {item.label}
            </button>
          ))}
          
          {showRegisterButton && (
            <Link
              href={registerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
