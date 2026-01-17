'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoHeroProps {
  videoSrc: string
  posterSrc: string
  children: React.ReactNode
}

export function VideoHero({ videoSrc, posterSrc, children }: VideoHeroProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check if device is mobile or has slow connection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    // Navigator connection API (with type safety for browsers that support it)
    const connection = (navigator as Navigator & {
      connection?: {
        effectiveType?: string
        saveData?: boolean
      }
    }).connection

    const isSlowConnection =
      connection?.effectiveType === '2g' ||
      connection?.effectiveType === 'slow-2g' ||
      connection?.saveData === true

    // Only enable video on desktop with good connection
    if (!isMobile && !isSlowConnection) {
      setCanPlayVideo(true)
    }
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Poster Image (always rendered, video overlays when ready) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${posterSrc})` }}
        aria-hidden="true"
      />

      {/* Video (only on desktop with good connection) */}
      {canPlayVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        {children}
      </div>
    </section>
  )
}
