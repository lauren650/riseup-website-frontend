'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useEditMode } from '@/contexts/edit-mode-context'
import { saveInlineImage, saveImagePosition } from '@/lib/actions/inline-content'
import { createClient } from '@/lib/supabase/client'
import type { ImageContentKey } from '@/types/content'

interface ProgramImage {
  src: string
  alt: string
  contentKey: ImageContentKey
  position?: { x: number; y: number }
}

interface ProgramTileEditableProps {
  href: string
  title: string
  ageRange: string
  images: ProgramImage[]
  initialPosition?: { x: number; y: number }
  rotationInterval?: number // milliseconds between transitions (default: 4000-6000 random)
  rotationMode?: 'random' | 'sequential' // how to pick next image (default: 'random')
}

export function ProgramTileEditable({
  href,
  title,
  ageRange,
  images,
  initialPosition = { x: 50, y: 50 },
  rotationInterval,
  rotationMode = 'random',
}: ProgramTileEditableProps) {
  const { isEditMode } = useEditMode()
  const [currentImages, setCurrentImages] = useState(images)
  const [activeIndex, setActiveIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Only enable rotation after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [imagePosition, setImagePosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [isSavingPosition, setIsSavingPosition] = useState(false)
  const [imagePositions, setImagePositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(images.map((img) => [img.contentKey, img.position || initialPosition]))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get valid images (those with actual URLs)
  const validImages = currentImages.filter(img => img.src && !img.src.includes('placeholder'))

  // Rotate images based on mode and interval using refs to avoid re-creating timers
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  useEffect(() => {
    if (!isMounted || isEditMode || validImages.length <= 1) return

    let timeoutId: NodeJS.Timeout
    let isActive = true

    const getWaitTime = () => {
      if (rotationInterval) return rotationInterval
      return 4000 + Math.random() * 2000 // 4-6 seconds default
    }

    const scheduleNextRotation = () => {
      if (!isActive) return

      timeoutId = setTimeout(() => {
        if (!isActive) return

        const currentIndex = activeIndexRef.current
        let next: number

        if (rotationMode === 'sequential') {
          next = (currentIndex + 1) % validImages.length
        } else {
          next = currentIndex
          if (validImages.length > 1) {
            while (next === currentIndex) {
              next = Math.floor(Math.random() * validImages.length)
            }
          }
        }

        setNextIndex(next)
        setIsTransitioning(true)

        // After fade completes, update active index and schedule next
        setTimeout(() => {
          if (!isActive) return
          setActiveIndex(next)
          setNextIndex(null)
          setIsTransitioning(false)
          scheduleNextRotation()
        }, 1000)
      }, getWaitTime())
    }

    scheduleNextRotation()

    return () => {
      isActive = false
      clearTimeout(timeoutId)
    }
  }, [isMounted, isEditMode, validImages.length, rotationInterval, rotationMode])

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || editingImageIndex === null) return

    const targetImage = currentImages[editingImageIndex]
    if (!targetImage) return

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
      const filename = `${targetImage.contentKey.replace(/\./g, '-')}-${timestamp}.${extension}`
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
      const result = await saveInlineImage(targetImage.contentKey, publicUrl, targetImage.alt, 'homepage', 'programs')

      if (!result.success) {
        setError(result.error || 'Failed to save image')
        setIsUploading(false)
        return
      }

      setUploadProgress(100)

      // Update local state with new URL
      setCurrentImages(prev => prev.map((img, idx) =>
        idx === editingImageIndex ? { ...img, src: publicUrl } : img
      ))
      setImagePosition({ x: 50, y: 50 })

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setEditingImageIndex(null)
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

  // Handle click to trigger file input for specific image slot
  const handleImageSlotClick = (index: number) => {
    if (isEditMode && !isUploading && !isRepositioning && fileInputRef.current) {
      setEditingImageIndex(index)
      fileInputRef.current.click()
    }
  }

  // Drag to reposition handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isRepositioning) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isRepositioning])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isRepositioning || editingImageIndex === null) return

    const editingImage = currentImages[editingImageIndex]
    if (!editingImage) return

    const contentKey = editingImage.contentKey
    const deltaX = (e.clientX - dragStart.x) * 0.2
    const deltaY = (e.clientY - dragStart.y) * 0.2

    setImagePositions(prev => ({
      ...prev,
      [contentKey]: {
        x: Math.max(0, Math.min(100, (prev[contentKey]?.x ?? 50) - deltaX)),
        y: Math.max(0, Math.min(100, (prev[contentKey]?.y ?? 50) - deltaY)),
      }
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, isRepositioning, dragStart, editingImageIndex, currentImages])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Save position to database
  const handleSavePosition = async () => {
    if (editingImageIndex === null) {
      setIsRepositioning(false)
      return
    }

    const editingImage = currentImages[editingImageIndex]
    if (!editingImage) {
      setIsRepositioning(false)
      setEditingImageIndex(null)
      return
    }

    const position = imagePositions[editingImage.contentKey]
    if (!position) {
      setIsRepositioning(false)
      setEditingImageIndex(null)
      return
    }

    setIsSavingPosition(true)
    setError(null)

    try {
      const result = await saveImagePosition(editingImage.contentKey, position)

      if (!result.success) {
        setError(result.error || 'Failed to save position')
      }
    } catch (err) {
      console.error('Error saving position:', err)
      setError('Failed to save position')
    } finally {
      setIsSavingPosition(false)
      setIsRepositioning(false)
      setEditingImageIndex(null)
      setSelectedSlot(null)
    }
  }

  // Handle slot click - show options for existing images
  const handleSlotClick = (index: number, hasImage: boolean) => {
    if (hasImage) {
      // Toggle selection for existing image
      setSelectedSlot(selectedSlot === index ? null : index)
    } else {
      // Empty slot - go straight to upload
      handleImageSlotClick(index)
    }
  }

  // Start repositioning for selected slot
  const handleStartReposition = (index: number) => {
    setEditingImageIndex(index)
    setIsRepositioning(true)
    setSelectedSlot(null)
  }

  // Get position for a specific image by content key
  const getImagePosition = (contentKey: string) => {
    return imagePositions[contentKey] || initialPosition
  }

  // Get the current display image
  const currentDisplayImage = validImages.length > 0 ? validImages[activeIndex % validImages.length] : currentImages[0]
  const nextDisplayImage = nextIndex !== null && validImages.length > 0 ? validImages[nextIndex % validImages.length] : null

  // In non-edit mode, render with rotating images
  if (!isEditMode) {
    return (
      <Link
        href={href}
        className="group relative aspect-[3/4] overflow-hidden"
      >
        {/* Render all valid images as stacked layers - only active one is visible */}
        {validImages.map((img, idx) => {
          const position = getImagePosition(img.contentKey)

          // Before mount, only show first image to match server render
          if (!isMounted) {
            return (
              <div
                key={img.contentKey}
                className="absolute inset-0 bg-cover bg-no-repeat group-hover:scale-105"
                style={{
                  backgroundImage: `url(${img.src})`,
                  backgroundPosition: `${position.x}% ${position.y}%`,
                  opacity: idx === 0 ? 1 : 0,
                }}
              />
            )
          }

          const isActive = idx === activeIndex % validImages.length
          const isNext = nextIndex !== null && idx === nextIndex % validImages.length

          // Show if: currently active (and not transitioning out), or is the next image (fading in)
          const shouldShow = isActive ? !isTransitioning : isNext && isTransitioning

          return (
            <div
              key={img.contentKey}
              className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000 ease-in-out group-hover:scale-105"
              style={{
                backgroundImage: `url(${img.src})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                opacity: shouldShow ? 1 : 0,
              }}
            />
          )
        })}

        {/* Fallback background for when no images exist */}
        {validImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
        )}

        {/* Gradient Overlay - bottom only for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h3>
        </div>

      </Link>
    )
  }

  // In edit mode, render with image slot selection
  return (
    <div
      ref={containerRef}
      className="group relative aspect-[3/4] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Current Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-no-repeat transition-transform duration-500 ${
          isUploading ? 'opacity-50' : ''
        } ${isRepositioning ? 'cursor-move' : ''}`}
        style={{
          backgroundImage: isRepositioning && editingImageIndex !== null
            ? `url(${currentImages[editingImageIndex]?.src || ''})`
            : `url(${currentDisplayImage?.src || ''})`,
          backgroundPosition: (() => {
            if (isRepositioning && editingImageIndex !== null) {
              const pos = getImagePosition(currentImages[editingImageIndex]?.contentKey || '')
              return `${pos.x}% ${pos.y}%`
            }
            const pos = getImagePosition(currentDisplayImage?.contentKey || '')
            return `${pos.x}% ${pos.y}%`
          })()
        }}
        onMouseDown={handleMouseDown}
      />

      {/* Fallback background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none" />

      {/* Gradient Overlay - bottom only for text readability, hidden during repositioning */}
      {!isRepositioning && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Repositioning Mode UI */}
      {isRepositioning && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Crosshair guides */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-white/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px bg-white/30" />
          </div>

          {/* Instructions */}
          <div className="absolute top-4 left-0 right-0 text-center">
            <span className="bg-black/70 text-white text-sm px-3 py-1 rounded">
              Drag to reposition image {editingImageIndex !== null ? editingImageIndex + 1 : ''}
            </span>
          </div>

          {/* Done button */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-auto">
            <button
              onClick={handleSavePosition}
              disabled={isSavingPosition}
              className="bg-accent text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSavingPosition ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode Overlay - shows image slots */}
      {!isRepositioning && (
        <div
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
            <div className="flex flex-col items-center gap-4 w-full px-4">
              {/* Image slots */}
              <div className="text-white text-sm font-medium mb-2">Click to edit images</div>
              <div className="flex gap-2 w-full justify-center">
                {currentImages.map((img, idx) => {
                  const hasImage = !!(img.src && !img.src.includes('placeholder'))
                  const isSelected = selectedSlot === idx

                  return (
                    <div key={img.contentKey} className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSlotClick(idx, hasImage)
                        }}
                        className={`
                          w-16 h-16 rounded border-2 overflow-hidden transition-all
                          ${isSelected
                            ? 'border-accent ring-2 ring-accent/50'
                            : hasImage
                              ? 'border-white/50 hover:border-accent'
                              : 'border-dashed border-white/30 hover:border-white/60 bg-black/30'
                          }
                        `}
                      >
                        {hasImage ? (
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${img.src})` }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 text-xl">
                            +
                          </div>
                        )}
                      </button>

                      {/* Options dropdown for selected slot */}
                      {isSelected && hasImage && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/90 rounded-lg overflow-hidden shadow-lg z-30 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleStartReposition(idx)
                            }}
                            className="w-full px-3 py-2 text-sm text-white hover:bg-white/20 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="5 9 2 12 5 15" />
                              <polyline points="9 5 12 2 15 5" />
                              <polyline points="15 19 12 22 9 19" />
                              <polyline points="19 9 22 12 19 15" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <line x1="12" y1="2" x2="12" y2="22" />
                            </svg>
                            Reposition
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedSlot(null)
                              handleImageSlotClick(idx)
                            }}
                            className="w-full px-3 py-2 text-sm text-white hover:bg-white/20 flex items-center gap-2 border-t border-white/10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Replace
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Help text */}
              <p className="text-white/50 text-xs mt-1">
                Click image to reposition or replace
              </p>
            </div>
          )}
        </div>
      )}

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

      {/* Content - hidden during repositioning */}
      {!isRepositioning && (
        <div className="absolute inset-0 z-0 flex flex-col justify-end p-6 pointer-events-none">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h3>
        </div>
      )}

      {/* Link overlay for navigating (visible but allows click-through for image edit) */}
      {!isRepositioning && (
        <Link
          href={href}
          className="absolute bottom-0 left-0 right-0 z-0 h-20"
          title={`Go to ${title}`}
        />
      )}

      {/* Border */}
      <div className={`absolute inset-0 border-2 pointer-events-none ${
        isRepositioning ? 'border-accent' : 'border-dashed border-accent/50'
      }`} />
    </div>
  )
}
