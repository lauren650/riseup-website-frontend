"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { EditableText } from "@/components/editable/editable-text";
import { useEditMode } from "@/contexts/edit-mode-context";

interface EditableButtonProps {
  /** Unique content key for the button text */
  textKey: string;
  /** Unique content key for the URL */
  urlKey: string;
  /** Default button text */
  defaultText: string;
  /** Default URL */
  defaultUrl: string;
  /** Additional CSS classes */
  className?: string;
  /** Page identifier for organization */
  page?: string;
  /** Section identifier for organization */
  section?: string;
}

/**
 * Editable button component with editable text and URL
 * In edit mode: shows editable text and a separate URL field
 * In normal mode: renders as a regular link button
 */
export function EditableButton({
  textKey,
  urlKey,
  defaultText,
  defaultUrl,
  className = "inline-block rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90",
  page,
  section,
}: EditableButtonProps) {
  const { isEditMode } = useEditMode();
  const [url, setUrl] = useState(defaultUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState(defaultUrl);
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Load saved URL from database
  useEffect(() => {
    const loadSavedUrl = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("site_content")
          .select("content")
          .eq("content_key", urlKey)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading URL:", error);
        }

        const savedUrl = data?.content?.text || defaultUrl;
        setUrl(savedUrl);
        setUrlInputValue(savedUrl);
      } catch (error) {
        console.error("Error loading URL:", error);
      }
    };

    loadSavedUrl();
  }, [urlKey, defaultUrl]);

  const handleUrlSave = async () => {
    setIsSavingUrl(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("site_content")
        .upsert(
          {
            content_key: urlKey,
            content: { text: urlInputValue },
            page: page || null,
            section: section || null,
          },
          {
            onConflict: "content_key",
          }
        );

      if (error) throw error;

      setUrl(urlInputValue);
      setIsEditingUrl(false);
    } catch (error) {
      console.error("Error saving URL:", error);
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleUrlCancel = () => {
    setUrlInputValue(url);
    setIsEditingUrl(false);
  };

  return (
    <div className="space-y-2">
      <a
        href={isEditMode ? undefined : url}
        onClick={(e) => {
          if (isEditMode) {
            e.preventDefault();
          }
        }}
        className={className}
        style={{ cursor: isEditMode ? "default" : "pointer" }}
      >
        <EditableText
          contentKey={textKey}
          as="span"
          page={page}
          section={section}
        >
          {defaultText}
        </EditableText>
      </a>

      {/* URL Editor (only visible in edit mode) */}
      {isEditMode && (
        <div className="mt-2 rounded-lg border border-white/20 bg-white/5 p-3">
          {!isEditingUrl ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <span className="text-xs text-muted-foreground">Link URL:</span>
                <p className="truncate text-sm text-white">{url}</p>
              </div>
              <button
                onClick={() => setIsEditingUrl(true)}
                className="rounded bg-accent px-3 py-1 text-xs text-white hover:opacity-90"
              >
                Edit URL
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs text-muted-foreground">
                Button Link URL:
              </label>
              <input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                className="w-full rounded border border-white/20 bg-background px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                placeholder="https://example.com/registration"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUrlSave}
                  disabled={isSavingUrl}
                  className="rounded bg-accent px-3 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingUrl ? "Saving..." : "Save URL"}
                </button>
                <button
                  onClick={handleUrlCancel}
                  className="rounded border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
