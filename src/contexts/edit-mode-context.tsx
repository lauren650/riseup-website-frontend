"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface EditModeContextValue {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

interface EditModeProviderProps {
  children: ReactNode;
  isAdmin?: boolean;
}

/**
 * Provider for edit mode state.
 * Edit mode allows admins to click directly on content to edit it inline.
 */
export function EditModeProvider({
  children,
  isAdmin = false,
}: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = useCallback(() => {
    if (isAdmin) {
      setIsEditMode((prev) => !prev);
    }
  }, [isAdmin]);

  const setEditMode = useCallback(
    (value: boolean) => {
      if (isAdmin) {
        setIsEditMode(value);
      }
    },
    [isAdmin]
  );

  // Keyboard shortcut: Cmd/Ctrl + E to toggle edit mode
  useEffect(() => {
    if (!isAdmin) return;

    function handleKeyDown(event: KeyboardEvent) {
      // Check for Cmd+E (Mac) or Ctrl+E (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "e") {
        event.preventDefault();
        toggleEditMode();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdmin, toggleEditMode]);

  // Disable edit mode if user is not admin
  useEffect(() => {
    if (!isAdmin && isEditMode) {
      setIsEditMode(false);
    }
  }, [isAdmin, isEditMode]);

  return (
    <EditModeContext.Provider
      value={{ isEditMode: isAdmin && isEditMode, toggleEditMode, setEditMode }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

/**
 * Hook to access edit mode state and controls.
 * Must be used within an EditModeProvider.
 */
export function useEditMode(): EditModeContextValue {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}
