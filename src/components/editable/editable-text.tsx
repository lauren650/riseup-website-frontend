"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { saveInlineText } from "@/lib/actions/inline-content";

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
  const [currentValue, setCurrentValue] = useState<string>("");
  const [originalValue, setOriginalValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Extract text content from children
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

  // Initialize current value from children
  useEffect(() => {
    const text = getTextContent();
    setCurrentValue(text);
    setOriginalValue(text);
  }, [getTextContent]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    const result = await saveInlineText(contentKey, currentValue, page, section);

    if (result.success) {
      setOriginalValue(currentValue);
    } else {
      // Revert on error
      setCurrentValue(originalValue);
      console.error("Failed to save:", result.error);
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

  // If not in edit mode, render normally
  if (!isEditMode) {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  // In edit mode but not currently editing - show hover styling
  if (!isEditing) {
    return (
      <Component
        className={`${className} cursor-pointer transition-all duration-150 hover:outline-dashed hover:outline-2 hover:outline-accent/50 hover:outline-offset-2`}
        onClick={handleClick}
        title="Click to edit"
      >
        {currentValue || children}
      </Component>
    );
  }

  // Currently editing - show input
  const isMultiline = Component === "p" || Component === "div" || currentValue.length > 80;

  if (isMultiline) {
    return (
      <div className="relative inline-block w-full">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          className={`${className} w-full resize-none rounded border-2 border-accent bg-black/80 px-2 py-1 outline-none`}
          rows={3}
        />
        {isSaving && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent">
            Saving...
          </span>
        )}
      </div>
    );
  }

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
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent">
          Saving...
        </span>
      )}
    </span>
  );
}
