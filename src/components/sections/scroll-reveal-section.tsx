'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealSectionProps {
  title?: string
  subtitle?: string
  backgroundImage?: string
  children?: React.ReactNode
}

export function ScrollRevealSection({
  title = "Building Future Leaders",
  subtitle = "Through dedication, teamwork, and the love of the game, we're shaping the next generation of champions.",
  backgroundImage,
}: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [fadeOutProgress, setFadeOutProgress] = useState(0)

  // Split title into words
  const words = title.split(' ')

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate progress: 0 when section top hits bottom of viewport, 1 when section top hits top of viewport
      const progress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)))

      // Calculate fade out progress based on how far past the section we've scrolled
      // Fade out faster - fully faded when section bottom is at middle of screen
      const fadeOutProgress = Math.max(0, Math.min(1, (1 - (rect.bottom / windowHeight)) * 1.8))

      // Hide when section bottom is above viewport (scrolled past)
      const sectionBottom = rect.bottom
      const shouldBeVisible = progress > 0.1 && sectionBottom > -100

      setScrollProgress(progress)
      setIsVisible(shouldBeVisible)
      setFadeOutProgress(fadeOutProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate opacity and transform based on scroll progress
  const bgOpacity = Math.min(1, scrollProgress * 1.5) * (1 - fadeOutProgress)
  const containerOpacity = (1 - fadeOutProgress)
  const textTranslateY = Math.max(0, (1 - scrollProgress) * 50)

  // Calculate when each word should appear (stagger across scroll progress 0.4 to 0.75)
  const getWordProgress = (wordIndex: number) => {
    const startProgress = 0.4 // When first word starts appearing
    const endProgress = 0.75 // When last word should be fully visible
    const wordStartTime = startProgress + (wordIndex / words.length) * (endProgress - startProgress)
    const wordDuration = 0.08 // How long each word takes to fully appear

    const wordProgress = Math.max(0, Math.min(1, (scrollProgress - wordStartTime) / wordDuration))
    return wordProgress
  }

  return (
    <>
      {/* Fixed overlay that appears as you scroll */}
      <div
        className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease-out',
        }}
      >
        {/* Earth background image */}
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              opacity: bgOpacity,
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/75"
          style={{ opacity: bgOpacity }}
        />

        {/* Text content */}
        <div
          className="relative z-10 text-center max-w-7xl mx-auto px-8"
          style={{
            opacity: containerOpacity,
            transform: `translateY(${textTranslateY}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight flex flex-wrap justify-center gap-x-[0.3em]">
            {words.map((word, index) => {
              const wordProgress = getWordProgress(index)
              // Pop effect: scale from 0.3 to 1.1 to 1
              const scale = wordProgress < 1
                ? 0.3 + (wordProgress * 0.8) + (wordProgress > 0.7 ? Math.sin((wordProgress - 0.7) / 0.3 * Math.PI) * 0.1 : 0)
                : 1
              const opacity = Math.min(1, wordProgress * 1.5)

              return (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    opacity,
                    transform: `scale(${scale})`,
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  {word}
                </span>
              )
            })}
          </h2>
          {subtitle && (
            <p
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollProgress - 0.5) * 3)),
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Spacer section that triggers the scroll effect */}
      <section
        ref={sectionRef}
        className="relative h-screen bg-transparent"
        aria-hidden="true"
      />
    </>
  )
}
