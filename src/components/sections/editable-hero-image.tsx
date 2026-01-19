'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useEditMode } from '@/contexts/edit-mode-context'
import { saveInlineImage } from '@/lib/actions/inline-content'
import { createClient } from '@/lib/supabase/client'

interface EditableHeroImageProps {
  contentKey: string
  src: string
  alt: string
  page?: string
  section?: string
}

export function EditableHeroImage({
  contentKey,
  src,
  alt,
  page,
  section,
}: EditableHeroImageProps) {
  const { isEditMode } = useEditMode()
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Image positioning state (percentages for object-position)
  const [scale, setScale] = useState(1.5) // Start more zoomed to allow more panning
  const [posX, setPosX] = useState(50) // 0-100%
  const [posY, setPosY] = useState(50) // 0-100%
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 50, y: 50 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved image and settings from Supabase
  useEffect(() => {
    const loadImage = async () => {
      try {
        const supabase = createClient()
        
        // Try to load saved image from database (site_content table)
        const { data, error: queryError } = await supabase
          .from('site_content')
          .select('content')
          .eq('content_key', contentKey)
          .eq('content_type', 'image')
          .single()
        
        if (!queryError && data?.content) {
          const content = data.content as { 
            url?: string; 
            alt?: string;
            scale?: number;
            posX?: number;
            posY?: number;
          }
          if (content.url) {
            setCurrentSrc(content.url)
          }
          // Load positioning from database (falls back to defaults if not set)
          if (content.scale !== undefined) setScale(content.scale)
          if (content.posX !== undefined) setPosX(content.posX)
          if (content.posY !== undefined) setPosY(content.posY)
        }
      } catch (err) {
        console.error('Error loading image:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadImage()
  }, [contentKey])

  // Save settings to Supabase
  const saveSettings = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Get current image data
      const { data: currentData } = await supabase
        .from('site_content')
        .select('content')
        .eq('content_key', contentKey)
        .eq('content_type', 'image')
        .single()
      
      if (currentData?.content) {
        const content = currentData.content as { url?: string; alt?: string }
        
        // Update with positioning data
        const { error: updateError } = await supabase
          .from('site_content')
          .update({
            content: {
              ...content,
              scale,
              posX,
              posY,
            }
          })
          .eq('content_key', contentKey)
          .eq('content_type', 'image')
        
        if (updateError) {
          console.error('Error saving position:', updateError)
        }
      }
    } catch (err) {
      console.error('Error saving settings:', err)
    }
  }, [contentKey, scale, posX, posY])

  // Handle file upload
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
        return
      }

      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        setError('Image must be less than 10MB')
        return
      }

      setError(null)
      setIsUploading(true)
      setUploadProgress(10)

      try {
        const supabase = createClient()
        const timestamp = Date.now()
        const extension = file.name.split('.').pop() || 'jpg'
        const filename = `${contentKey.replace(/\./g, '-')}-${timestamp}.${extension}`
        const path = `images/${filename}`

        setUploadProgress(30)

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

        const {
          data: { publicUrl },
        } = supabase.storage.from('site-images').getPublicUrl(path)

        setUploadProgress(85)

        const result = await saveInlineImage(contentKey, publicUrl, alt, page, section)

        if (!result.success) {
          setError(result.error || 'Failed to save image')
          setIsUploading(false)
          return
        }

        setUploadProgress(100)
        setCurrentSrc(publicUrl)
        
        // Reset positioning for new image
        setScale(1.5)
        setPosX(50)
        setPosY(50)

        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      } catch (err) {
        console.error('Upload error:', err)
        setError('Failed to upload image')
        setIsUploading(false)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [contentKey, alt, page, section]
  )

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isRepositioning || !containerRef.current) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragStartPos({ x: posX, y: posY })
  }, [isRepositioning, posX, posY])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    
    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    // Convert pixel movement to percentage
    // Multiply by scale to maintain consistent drag speed regardless of zoom
    const percentX = (deltaX / rect.width) * 100 * scale
    const percentY = (deltaY / rect.height) * 100 * scale
    
    // Update position (invert direction so dragging feels natural)
    // When you drag right, the image moves right (which means showing more of the left side)
    const newX = dragStartPos.x - percentX
    const newY = dragStartPos.y - percentY
    
    setPosX(newX)
    setPosY(newY)
  }, [isDragging, dragStart, dragStartPos, scale])

  const handleMouseUp = useCallback(async () => {
    if (isDragging) {
      setIsDragging(false)
      await saveSettings()
    }
  }, [isDragging, saveSettings])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(4, scale + 0.1)
    setScale(newScale)
  }, [scale])

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(1, scale - 0.1)
    setScale(newScale)
  }, [scale])

  const handleReset = useCallback(async () => {
    setScale(1.5)
    setPosX(50)
    setPosY(50)
    
    // Save reset values to database
    try {
      const supabase = createClient()
      const { data: currentData } = await supabase
        .from('site_content')
        .select('content')
        .eq('content_key', contentKey)
        .eq('content_type', 'image')
        .single()
      
      if (currentData?.content) {
        const content = currentData.content as { url?: string; alt?: string }
        await supabase
          .from('site_content')
          .update({
            content: {
              ...content,
              scale: 1.5,
              posX: 50,
              posY: 50,
            }
          })
          .eq('content_key', contentKey)
          .eq('content_type', 'image')
      }
    } catch (err) {
      console.error('Error resetting position:', err)
    }
  }, [contentKey])

  const hasValidImage = currentSrc && (currentSrc.startsWith('http') || currentSrc.startsWith('/'))

  // Shared image style
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    objectPosition: `${posX}% ${posY}%`,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
  }

  // Regular view (not edit mode)
  if (!isEditMode) {
    if (!hasValidImage) {
      return <div className="absolute inset-0 bg-gradient-to-br from-[#121126] to-black" />
    }
    
    return (
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={currentSrc}
          alt={alt}
          style={imageStyle}
        />
      </div>
    )
  }

  // Edit mode view
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image */}
      {hasValidImage ? (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={currentSrc}
            alt={alt}
            style={{
              ...imageStyle,
              opacity: isUploading ? 0.5 : 1,
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#121126] to-black" />
      )}

      {/* Interactive overlay for repositioning */}
      {isRepositioning && (
        <div
          ref={containerRef}
          className={`absolute inset-0 z-[60] bg-black/50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Instructions */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="bg-black/80 text-white px-6 py-3 rounded-lg">
              <p className="font-medium">
                {isDragging ? 'Dragging...' : 'Click and drag to reposition • Use zoom controls to scale'}
              </p>
            </div>
          </div>

          {/* Zoom controls (right side) */}
          <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
              disabled={scale >= 4}
              className="w-12 h-12 rounded-full bg-white/90 text-black text-xl font-bold hover:bg-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In (Max 400%)"
            >
              +
            </button>
            <div className="bg-black/90 text-white text-sm px-3 py-2 rounded text-center font-semibold">
              {Math.round(scale * 100)}%
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
              disabled={scale <= 1}
              className="w-12 h-12 rounded-full bg-white/90 text-black text-xl font-bold hover:bg-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out (Min 100%)"
            >
              −
            </button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleReset()
              }}
              className="px-6 py-3 rounded-full bg-white/90 text-black font-semibold hover:bg-white transition-all shadow-lg"
            >
              Reset
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await saveSettings()
                setIsRepositioning(false)
              }}
              className="px-8 py-3 rounded-full bg-accent text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Edit mode controls (when not repositioning) */}
      {!isRepositioning && !isUploading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent hover:bg-black/50 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center gap-4">
            <div className="rounded-full bg-black/80 p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
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
            </div>
            <span className="text-white font-semibold bg-black/80 px-6 py-3 rounded-lg text-lg">
              Click to upload hero image
            </span>
            {hasValidImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsRepositioning(true)
                }}
                className="px-6 py-3 rounded-full bg-white/90 text-black font-semibold hover:bg-white transition-all"
              >
                Reposition & Scale Image
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="mb-4 h-2 w-64 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xl text-white font-semibold">Uploading... {uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Edit mode indicator */}
      {!isRepositioning && (
        <div className="absolute top-4 right-4 z-20 bg-accent/90 text-white text-sm px-4 py-2 rounded-full font-semibold">
          Edit Mode
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-red-500/95 text-white px-6 py-3 rounded-lg text-sm shadow-lg max-w-md">
          {error}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setError(null)
            }}
            className="ml-3 underline hover:no-underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  )
}
