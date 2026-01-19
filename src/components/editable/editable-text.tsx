"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { saveInlineText } from "@/lib/actions/inline-content";
import { createClient } from "@/lib/supabase/client";

interface EditableTextProps {
  /** Unique content key for database storage (e.g., 'hero.headline') */
  contentKey: string;
  /** The text content to display */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML element to render */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
  /** Page identifier for organization */
  page?: string;
  /** Section identifier for organization */
  section?: string;
}

/**
 * Editable text component that allows inline editing when edit mode is enabled.
 *
 * When edit mode is OFF: renders children normally
 * When edit mode is ON: shows dashed border on hover, allows click to edit
 *
 * The component automatically loads saved content from the database on mount,
 * falling back to the children prop if no saved content exists.
 */
export function EditableText({
  contentKey,
  children,
  className = "",
  as: Component = "span",
  page,
  section,
}: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentValue, setCurrentValue] = useState<string>("");
  const [originalValue, setOriginalValue] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [textareaSize, setTextareaSize] = useState({ width: '80%', height: 'auto' });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Extract text content from children (fallback)
  const getTextContent = useCallback((): string => {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    // For React elements, try to extract text
    if (children && typeof children === "object" && "props" in children) {
      const props = children.props as { children?: unknown };
      if (typeof props.children === "string") return props.children;
    }
    return "";
  }, [children]);

  // Load saved content from database on mount
  useEffect(() => {
    const loadSavedContent = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("site_content")
          .select("content")
          .eq("content_key", contentKey)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found", which is okay
          console.error("Error loading content:", error);
        }

        // Use saved content if available, otherwise use fallback from children
        const text = data?.content?.text || getTextContent();
        setCurrentValue(text);
        setOriginalValue(text);
      } catch (err) {
        console.error("Error in loadSavedContent:", err);
        // Fall back to children content
        const text = getTextContent();
        setCurrentValue(text);
        setOriginalValue(text);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedContent();
  }, [contentKey, getTextContent]);

  // Focus input when editing starts and track resize
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();

      // Track textarea resize events
      const textarea = inputRef.current as HTMLTextAreaElement;
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setTextareaSize({ 
            width: `${width}px`, 
            height: `${height}px` 
          });
        }
      });

      resizeObserver.observe(textarea);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isEditing]);

  // Handle click to start editing
  const handleClick = () => {
    if (isEditMode && !isEditing) {
      setIsEditing(true);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (currentValue === originalValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const result = await saveInlineText(contentKey, currentValue, page, section);

    if (result.success) {
      setOriginalValue(currentValue);
      setSaveError(null);
    } else {
      // Revert on error
      setCurrentValue(originalValue);
      setSaveError(result.error || "Failed to save");
      console.error("Failed to save:", result.error);
      
      // Show error briefly
      setTimeout(() => setSaveError(null), 3000);
    }

    setIsSaving(false);
    setIsEditing(false);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setCurrentValue(originalValue);
      setIsEditing(false);
    }
  };

  // Handle blur (clicking outside)
  const handleBlur = () => {
    handleSave();
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  // If not in edit mode, render normally with saved content
  if (!isEditMode) {
    return (
      <Component className={className}>
        {currentValue || children}
      </Component>
    );
  }

  // In edit mode but not currently editing - show hover styling
  if (!isEditing) {
    // Use span for inline elements, div for block elements to maintain valid HTML
    const WrapperElement = Component === "span" ? "span" : "div";
    const wrapperClass = Component === "span" 
      ? "relative inline-block group" 
      : "relative inline-block w-full group";

    return (
      <WrapperElement className={wrapperClass}>
        <Component
          className={`${className} cursor-pointer transition-all duration-150 hover:outline-dashed hover:outline-2 hover:outline-accent/50 hover:outline-offset-2`}
          onClick={handleClick}
          title="Click to edit (or clear to empty)"
        >
          {currentValue || children}
        </Component>
        {saveError && (
          <span className="absolute left-0 top-full mt-1 rounded bg-red-500 px-2 py-1 text-xs text-white z-50 whitespace-nowrap">
            {saveError}
          </span>
        )}
        <span className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setCurrentValue("");
            }}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs font-semibold whitespace-nowrap"
            title="Clear this text"
          >
            Clear
          </button>
        </span>
      </WrapperElement>
    );
  }

  // Currently editing - show input
  const isMultiline = Component === "p" || Component === "div" || Component === "h1" || Component === "h2" || Component === "h3" || Component === "h4" || currentValue.length > 80;

  // Calculate optimal textarea rows based on content
  const calculateRows = () => {
    const lines = currentValue.split("\n").length;
    const estimatedLines = Math.ceil(currentValue.length / 80);
    return Math.max(3, Math.min(15, Math.max(lines, estimatedLines)));
  };

  if (isMultiline) {
    // Use div wrapper for block-level editing
    // Preserve user's resize dimensions across edits
    return (
      <div className="relative w-full">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          className={`${className} block resize box-border rounded border-2 border-accent bg-black/80 px-2 py-1 outline-none`}
          rows={calculateRows()}
          style={{ 
            width: textareaSize.width, 
            height: textareaSize.height,
            minHeight: '80px',
            minWidth: '200px',
            maxWidth: '100%'
          }}
        />
        {isSaving && (
          <span className="absolute right-2 top-2 text-xs text-accent">
            Saving...
          </span>
        )}
        <div className="mt-1 text-xs text-muted-foreground">
          Drag corner to resize both directions • Enter to save • Esc to cancel
        </div>
      </div>
    );
  }

  // Use span wrapper for inline-level editing
  return (
    <span className="relative inline-block">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isSaving}
        className={`${className} rounded border-2 border-accent bg-black/80 px-2 py-1 outline-none`}
        style={{ minWidth: `${Math.max(currentValue.length * 0.6, 5)}em` }}
      />
      {isSaving && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent whitespace-nowrap">
          Saving...
        </span>
      )}
    </span>
  );
}
