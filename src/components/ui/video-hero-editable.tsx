'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditMode } from '@/contexts/edit-mode-context'
import { saveInlineImage } from '@/lib/actions/inline-content'
import { createClient } from '@/lib/supabase/client'

interface VideoHeroEditableProps {
  videoSrc: string
  posterSrc: string
  posterAlt: string
  posterContentKey: string
  children: React.ReactNode
}

export function VideoHeroEditable({
  videoSrc,
  posterSrc,
  posterAlt,
  posterContentKey,
  children,
}: VideoHeroEditableProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPosterSrc, setCurrentPosterSrc] = useState(posterSrc)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isEditMode } = useEditMode()

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

  // Handle file selection for poster image
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(10)

    try {
      const supabase = createClient()

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'jpg'
      const filename = `${posterContentKey.replace(/\./g, '-')}-${timestamp}.${extension}`
      const path = `images/${filename}`

      setUploadProgress(30)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          setError(
            "Storage bucket not set up. Please create 'site-images' bucket in Supabase Dashboard."
          )
        } else {
          setError(uploadError.message)
        }
        setIsUploading(false)
        return
      }

      setUploadProgress(70)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('site-images').getPublicUrl(path)

      setUploadProgress(85)

      // Save to database
      const result = await saveInlineImage(posterContentKey, publicUrl, posterAlt, 'homepage', 'hero')

      if (!result.success) {
        setError(result.error || 'Failed to save image')
        setIsUploading(false)
        return
      }

      setUploadProgress(100)

      // Update local state with new URL
      setCurrentPosterSrc(publicUrl)

      // Reset state after brief delay to show 100%
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image')
      setIsUploading(false)
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle click on poster to trigger file input
  const handlePosterClick = () => {
    if (isEditMode && !isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Poster Image (always rendered, video overlays when ready) */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
          isEditMode ? 'cursor-pointer' : ''
        }`}
        style={{ backgroundImage: `url(${currentPosterSrc})` }}
        aria-hidden="true"
        onClick={handlePosterClick}
      />

      {/* Edit overlay for poster (only in edit mode) */}
      {isEditMode && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={handlePosterClick}
            className={`
              absolute left-4 top-4 z-20 flex cursor-pointer items-center gap-2
              rounded-lg bg-black/70 px-4 py-2 transition-opacity
              ${isUploading ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
            `}
          >
            {isUploading ? (
              <>
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm text-white">Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-sm font-medium text-white">Change Background</span>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="absolute left-4 top-16 z-20 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </>
      )}

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
