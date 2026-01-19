"use client"

import { useState, useRef, useCallback } from "react"
import { useEditMode } from "@/contexts/edit-mode-context"
import { saveInlineImage } from "@/lib/actions/inline-content"
import { createClient } from "@/lib/supabase/client"
import { GivebutterWidget } from "@/components/donations/givebutter-widget"

interface DonationSectionEditableProps {
  initialFlagUrl: string
  initialFlagAlt: string
}

export function DonationSectionEditable({
  initialFlagUrl,
  initialFlagAlt,
}: DonationSectionEditableProps) {
  const { isEditMode } = useEditMode()
  const [flagUrl, setFlagUrl] = useState(initialFlagUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file")
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError("Image must be less than 5MB")
        return
      }

      setError(null)
      setIsUploading(true)
      setUploadProgress(10)

      try {
        const supabase = createClient()

        // Generate unique filename
        const timestamp = Date.now()
        const extension = file.name.split(".").pop() || "jpg"
        const filename = `donation-flag-${timestamp}.${extension}`
        const path = `images/${filename}`

        setUploadProgress(30)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("site-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          if (uploadError.message.includes("Bucket not found")) {
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
        } = supabase.storage.from("site-images").getPublicUrl(path)

        setUploadProgress(85)

        // Save to database
        const result = await saveInlineImage(
          "donation.flag_background",
          publicUrl,
          initialFlagAlt,
          "homepage",
          "donation"
        )

        if (!result.success) {
          setError(result.error || "Failed to save image")
          setIsUploading(false)
          return
        }

        setUploadProgress(100)

        // Update local state with new URL
        setFlagUrl(publicUrl)

        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      } catch (err) {
        console.error("Upload error:", err)
        setError("Failed to upload image")
        setIsUploading(false)
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [initialFlagAlt]
  )

  // Handle click to trigger file input
  const handleClick = () => {
    if (isEditMode && !isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <section 
      className="relative overflow-hidden bg-black py-16 md:py-24"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 128px, black calc(100% - 128px), transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 128px, black calc(100% - 128px), transparent)',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Faded Flag Background - Angled, Black & White */}
      {flagUrl && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${flagUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "rotate(-5deg) scale(1.2)",
            transformOrigin: "center center",
            filter: "grayscale(100%)",
          }}
        />
      )}

      {/* Edit mode overlay for flag background */}
      {isEditMode && (
        <div
          onClick={handleClick}
          className={`
            absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center
            bg-black/50 transition-opacity
            ${isUploading ? "opacity-100" : "opacity-0 hover:opacity-100"}
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
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-sm font-medium text-white">
                Click to upload flag background
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded bg-red-500/90 px-4 py-2 text-center text-sm text-white">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Mission Content */}
        <div className="mb-12 space-y-6 text-center">
          <p className="text-xl md:text-2xl font-semibold text-white">
            To understand RiseUp, you have to understand our mission.
          </p>
          
          <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-5xl mx-auto">
            It's no secret that America is losing its way. Rising youth mental health crisis (anxiety, depression, self harm), broken systems and institutions (youth, education, political, financial, families), a hope deficit among young men (not joining the military, declining college admissions, marriage rates, birth rates). It's hard to avoid the divisiveness, destruction, and disinterest.
          </p>
          
          <p className="text-xl md:text-2xl font-semibold text-white">
            Americans are desperate for a positive vision of the future.
          </p>
          
          <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-5xl mx-auto">
            We believe that the steps to begin to change America begin with uniting our families and our local communities. This starts with providing opportunities to teach youth and their families the skills they need to achieve success in life as they prepare to lead the next generation. Developmental youth football is that opportunity.
          </p>
        </div>

        {/* Donation Widget */}
        <div className="mx-auto max-w-3xl mt-12">
          <GivebutterWidget align="center" />
        </div>

        {/* Tax-Deductible Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            RiseUp Moore is a 501(c)(3) nonprofit. All donations are tax-deductible.
          </p>
        </div>
      </div>
    </section>
  )
}
