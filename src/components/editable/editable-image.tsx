"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useEditMode } from "@/contexts/edit-mode-context";
import { saveInlineImage } from "@/lib/actions/inline-content";
import { createClient } from "@/lib/supabase/client";

interface EditableImageProps {
  /** Unique content key for database storage (e.g., 'hero.poster') */
  contentKey: string;
  /** Current image source URL */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Image width for Next.js Image */
  width?: number;
  /** Image height for Next.js Image */
  height?: number;
  /** Use fill mode instead of fixed dimensions */
  fill?: boolean;
  /** Object fit style when using fill */
  objectFit?: "cover" | "contain" | "fill" | "none";
  /** Page identifier for organization */
  page?: string;
  /** Section identifier for organization */
  section?: string;
  /** Priority loading */
  priority?: boolean;
}

/**
 * Editable image component that allows image replacement when edit mode is enabled.
 *
 * When edit mode is OFF: renders Next.js Image normally
 * When edit mode is ON: shows upload overlay on hover, click to select new image
 */
export function EditableImage({
  contentKey,
  src,
  alt,
  className = "",
  width,
  height,
  fill = false,
  objectFit = "cover",
  page,
  section,
  priority = false,
}: EditableImageProps) {
  const { isEditMode } = useEditMode();
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("Image must be less than 5MB");
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(10);

      try {
        const supabase = createClient();

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split(".").pop() || "jpg";
        const filename = `${contentKey.replace(/\./g, "-")}-${timestamp}.${extension}`;
        const path = `images/${filename}`;

        setUploadProgress(30);

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from("site-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          // If bucket doesn't exist, provide helpful message
          if (uploadError.message.includes("Bucket not found")) {
            setError(
              "Storage bucket not set up. Please create 'site-images' bucket in Supabase Dashboard."
            );
          } else {
            setError(uploadError.message);
          }
          setIsUploading(false);
          return;
        }

        setUploadProgress(70);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("site-images").getPublicUrl(path);

        setUploadProgress(85);

        // Save to database
        const result = await saveInlineImage(contentKey, publicUrl, alt, page, section);

        if (!result.success) {
          setError(result.error || "Failed to save image");
          setIsUploading(false);
          return;
        }

        setUploadProgress(100);

        // Update local state with new URL
        setCurrentSrc(publicUrl);

        // Reset state after brief delay to show 100%
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image");
        setIsUploading(false);
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [contentKey, alt, page, section]
  );

  // Handle click to trigger file input
  const handleClick = () => {
    if (isEditMode && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Common image props
  const imageProps = fill
    ? { fill: true, style: { objectFit } }
    : { width: width || 400, height: height || 300 };

  // If not in edit mode, render normally
  if (!isEditMode) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        className={className}
        priority={priority}
        {...imageProps}
      />
    );
  }

  // In edit mode - show with overlay
  return (
    <div className="relative inline-block">
      <Image
        src={currentSrc}
        alt={alt}
        className={`${className} ${isUploading ? "opacity-50" : ""}`}
        priority={priority}
        {...imageProps}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload overlay */}
      <div
        onClick={handleClick}
        className={`
          absolute inset-0 flex cursor-pointer flex-col items-center justify-center
          bg-black/50 transition-opacity
          ${isUploading ? "opacity-100" : "opacity-0 hover:opacity-100"}
        `}
      >
        {isUploading ? (
          <div className="text-center">
            {/* Upload progress */}
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
            {/* Camera icon */}
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
        <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 p-2 text-center text-xs text-white">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
