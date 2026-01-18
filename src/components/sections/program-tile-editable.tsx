'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useEditMode } from '@/contexts/edit-mode-context'
import { saveInlineImage } from '@/lib/actions/inline-content'
import { createClient } from '@/lib/supabase/client'

interface ProgramTileEditableProps {
  href: string
  title: string
  ageRange: string
  imageSrc: string
  imageAlt: string
  imageContentKey: string
}

export function ProgramTileEditable({
  href,
  title,
  ageRange,
  imageSrc,
  imageAlt,
  imageContentKey,
}: ProgramTileEditableProps) {
  const { isEditMode } = useEditMode()
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file')
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
      const filename = `${imageContentKey.replace(/\./g, '-')}-${timestamp}.${extension}`
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
          setError("Storage bucket not set up. Create 'site-images' bucket in Supabase.")
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
      const result = await saveInlineImage(imageContentKey, publicUrl, imageAlt, 'homepage', 'programs')

      if (!result.success) {
        setError(result.error || 'Failed to save image')
        setIsUploading(false)
        return
      }

      setUploadProgress(100)

      // Update local state with new URL
      setCurrentImageSrc(publicUrl)

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

  // Handle click to trigger file input
  const handleImageClick = (e: React.MouseEvent) => {
    if (isEditMode && !isUploading && fileInputRef.current) {
      e.preventDefault()
      e.stopPropagation()
      fileInputRef.current.click()
    }
  }

  // In non-edit mode, render as a simple link
  if (!isEditMode) {
    return (
      <Link
        href={href}
        className="group relative aspect-[4/3] overflow-hidden rounded-lg"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${currentImageSrc})` }}
        />

        {/* Fallback background for when image doesn't exist */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h3>
          <p className="text-sm text-white/60 mt-1">{ageRange}</p>
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 border-2 border-transparent rounded-lg transition-colors duration-300 group-hover:border-accent" />
      </Link>
    )
  }

  // In edit mode, render with editable overlay
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-lg">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ${
          isUploading ? 'opacity-50' : ''
        }`}
        style={{ backgroundImage: `url(${currentImageSrc})` }}
      />

      {/* Fallback background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Edit Image Overlay */}
      <div
        onClick={handleImageClick}
        className={`
          absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center
          bg-black/50 transition-opacity
          ${isUploading ? 'opacity-100' : 'opacity-0 hover:opacity-100'}
        `}
      >
        {isUploading ? (
          <div className="text-center">
            <div className="mb-2 h-1 w-24 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-sm text-white">Uploading... {uploadProgress}%</span>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-sm font-medium text-white">Click to change image</span>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-red-500/90 p-2 text-center text-xs text-white">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 z-0 flex flex-col justify-end p-6 pointer-events-none">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-white/60 mt-1">{ageRange}</p>
      </div>

      {/* Link overlay for navigating (visible but allows click-through for image edit) */}
      <Link
        href={href}
        className="absolute bottom-0 left-0 right-0 z-0 h-20"
        title={`Go to ${title}`}
      />

      {/* Border */}
      <div className="absolute inset-0 border-2 border-dashed border-accent/50 rounded-lg pointer-events-none" />
    </div>
  )
}
