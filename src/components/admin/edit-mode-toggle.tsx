"use client";

import { useEditMode } from "@/contexts/edit-mode-context";

/**
 * Toggle button for edit mode.
 * Shows "Edit Mode: ON/OFF" status with visual feedback.
 * Keyboard shortcut hint: Cmd/Ctrl + E
 */
export function EditModeToggle() {
  const { isEditMode, toggleEditMode } = useEditMode();

  return (
    <button
      type="button"
      onClick={toggleEditMode}
      className={`
        flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium
        transition-all duration-200
        ${
          isEditMode
            ? "bg-accent text-black"
            : "border border-white/20 text-white hover:bg-white/5"
        }
      `}
      title="Toggle Edit Mode (Ctrl+E / Cmd+E)"
    >
      {/* Edit icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
      <span>Edit Mode: {isEditMode ? "ON" : "OFF"}</span>
    </button>
  );
}
