"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];
const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.svg,.webp";

interface LogoUploadProps {
  onUploadComplete: (url: string) => void;
  error?: string;
}

export function LogoUpload({ onUploadComplete, error: externalError }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous state
    setError(null);

    // Client-side validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPG, SVG, or WebP image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be under 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const supabase = createClient();

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const fileName = `${timestamp}-${safeName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("sponsor-logos")
        .upload(`pending/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(uploadError.message);
        setPreview(null);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("sponsor-logos").getPublicUrl(data.path);

      setUploadedUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadComplete("");
  };

  const inputClassName =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  const displayError = error || externalError;

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {!preview && !uploadedUrl ? (
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-colors",
            displayError
              ? "border-red-400"
              : "border-white/10 hover:border-white/20"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Upload company logo"
          />
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
            {uploading ? (
              <>
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <svg
                  className="mb-3 h-10 w-10 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-white">
                  Click to upload your logo
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, SVG, or WebP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Preview area */
        <div className="relative rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview || uploadedUrl || ""}
                alt="Logo preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {uploadedUrl ? "Logo uploaded" : "Uploading..."}
              </p>
              {uploadedUrl && (
                <p className="mt-1 text-xs text-green-400">Ready to submit</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Remove logo"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-red-400">{displayError}</p>
      )}
    </div>
  );
}
