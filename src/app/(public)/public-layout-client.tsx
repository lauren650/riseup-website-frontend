"use client";

import { EditModeProvider } from "@/contexts/edit-mode-context";
import { EditModeToggle } from "@/components/admin/edit-mode-toggle";
import { GivebutterFloatingButton } from "@/components/donations/givebutter-floating-button";
import type { ReactNode } from "react";

interface PublicLayoutClientProps {
  children: ReactNode;
  isAdmin: boolean;
}

/**
 * Client wrapper for public layout that provides edit mode context.
 * Only shows edit mode toggle for authenticated admin users viewing public pages.
 */
export function PublicLayoutClient({ children, isAdmin }: PublicLayoutClientProps) {
  return (
    <EditModeProvider isAdmin={isAdmin}>
      {children}
      
      {/* Givebutter Floating Donate Button - always visible */}
      <GivebutterFloatingButton />
      
      {/* Edit Mode Toggle - only for admin users */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <EditModeToggle />
        </div>
      )}
    </EditModeProvider>
  );
}
