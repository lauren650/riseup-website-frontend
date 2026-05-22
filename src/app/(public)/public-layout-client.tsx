"use client";

import { usePathname } from "next/navigation";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { EditModeToggle } from "@/components/admin/edit-mode-toggle";
import { GivebutterFloatingButton } from "@/components/donations/givebutter-floating-button";
import { GivebutterWidgetsScript } from "@/components/donations/givebutter-widgets-script";
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
  const pathname = usePathname();
  // Embedded GiveButter widget page uses the Widgets library; skip Elements bubble to avoid conflicts
  const showFloatingDonate = pathname !== "/golf-tournament";

  return (
    <EditModeProvider isAdmin={isAdmin}>
      {/* Widgets library on all public pages — required for analytics account ID */}
      <GivebutterWidgetsScript />
      {children}

      {showFloatingDonate && <GivebutterFloatingButton />}
      
      {/* Edit Mode Toggle - only for admin users */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <EditModeToggle />
        </div>
      )}
    </EditModeProvider>
  );
}
