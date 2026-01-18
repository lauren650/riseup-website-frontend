"use client";

import { EditModeProvider } from "@/contexts/edit-mode-context";
import { EditModeToggle } from "@/components/admin/edit-mode-toggle";
import type { ReactNode } from "react";

interface AdminLayoutClientProps {
  children: ReactNode;
  isAdmin: boolean;
}

/**
 * Client wrapper for admin layout that provides edit mode context.
 * The toggle is rendered as a fixed element for easy access.
 */
export function AdminLayoutClient({ children, isAdmin }: AdminLayoutClientProps) {
  return (
    <EditModeProvider isAdmin={isAdmin}>
      {children}
      {/* Edit Mode Toggle - fixed position for visibility */}
      {isAdmin && (
        <div className="fixed bottom-20 right-6 z-40">
          <EditModeToggle />
        </div>
      )}
    </EditModeProvider>
  );
}
