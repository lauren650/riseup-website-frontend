'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditMode } from '@/contexts/edit-mode-context'
import { saveInlineImage } from '@/lib/actions/inline-content'
import { createClient } from '@/lib/supabase/client'

interface VideoHeroEditableProps {
  videoSrc: string
  posterSrc: string
  videoContentKey?: string
  children: React.ReactNode
}

export function VideoHeroEditable({
  videoSrc,
  posterSrc,
  videoContentKey = 'hero.video',
  children,
}: VideoHeroEditableProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPosterSrc] = useState(posterSrc)
  const [currentVideoSrc, setCurrentVideoSrc] = useState(videoSrc)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
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

  // Handle video file selection
  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, MOV, WebM, or OGG)')
      return
    }

    // Validate file size (100MB max for videos)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Video must be less than 100MB')
      return
    }

    setError(null)
    setIsUploadingVideo(true)
    setUploadProgress(10)

    try {
      const supabase = createClient()

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'mp4'
      const filename = `hero-video-${timestamp}.${extension}`
      const path = `videos/${filename}`

      setUploadProgress(20)
      console.log('Starting video upload:', { filename, size: file.size, type: file.type })

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        })

      console.log('Upload result:', { uploadData, uploadError })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        if (uploadError.message.includes('Bucket not found')) {
          setError(
            "Storage bucket not set up. Please create 'site-images' bucket in Supabase Dashboard."
          )
        } else {
          setError(`Upload failed: ${uploadError.message}`)
        }
        setIsUploadingVideo(false)
        return
      }

      setUploadProgress(70)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('site-images').getPublicUrl(path)

      setUploadProgress(85)

      // Save to database
      const result = await saveInlineImage(videoContentKey, publicUrl, 'Hero background video', 'homepage', 'hero')

      if (!result.success) {
        setError(result.error || 'Failed to save video')
        setIsUploadingVideo(false)
        return
      }

      setUploadProgress(100)

      // Update local state with new URL
      setCurrentVideoSrc(publicUrl)
      setIsLoaded(false) // Reset to trigger reload

      // Reset state after brief delay to show 100%
      setTimeout(() => {
        setIsUploadingVideo(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload video')
      setIsUploadingVideo(false)
    }

    // Clear file input
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const isUploading = isUploadingVideo

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Poster Image (always rendered, video overlays when ready) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${currentPosterSrc})` }}
        aria-hidden="true"
      />

      {/* Edit controls (only in edit mode) */}
      {isEditMode && (
        <>
          {/* Hidden file input */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov"
            onChange={handleVideoSelect}
            className="hidden"
          />

          {/* Edit button */}
          <div className="absolute left-4 top-24 z-20">
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploading}
              className={`
                flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 transition-opacity
                ${isUploadingVideo ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                disabled:cursor-not-allowed
              `}
            >
              {isUploadingVideo ? (
                <>
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-white">Uploading video... {uploadProgress}%</span>
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
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span className="text-sm font-medium text-white">Change Background Video</span>
                </>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="absolute left-4 top-36 z-20 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white">
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
      {canPlayVideo && currentVideoSrc && (
        <video
          ref={videoRef}
          key={currentVideoSrc}
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
          <source src={currentVideoSrc} type="video/mp4" />
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
