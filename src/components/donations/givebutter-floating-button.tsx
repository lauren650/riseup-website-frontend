"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

interface GivebutterFloatingButtonProps {
  /**
   * Your Givebutter account ID (or set NEXT_PUBLIC_GIVEBUTTER_ACCOUNT env var)
   */
  accountId?: string;
  /**
   * Your campaign code (or set NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID env var)
   */
  campaignId?: string;
  /**
   * Button label text
   * @default "Donate"
   */
  label?: string;
  /**
   * Button background color (hex)
   * @default "#b72031" (RiseUp brand accent)
   */
  backgroundColor?: string;
  /**
   * Button position on screen
   * @default "bottom-right"
   */
  location?:
    | "top-left"
    | "middle-left"
    | "bottom-left"
    | "top-right"
    | "middle-right"
    | "bottom-right";
  /**
   * Vertical offset from edge in pixels
   * @default 150
   */
  verticalOffset?: number;
  /**
   * Horizontal offset from edge in pixels
   * @default 120
   */
  horizontalOffset?: number;
}

declare global {
  interface Window {
    Givebutter: ((action: string, options: Record<string, unknown>) => void) & {
      q?: unknown[];
      l?: number;
    };
  }
}

/**
 * Floating Givebutter donation button that appears in the corner of the screen.
 *
 * This component uses Givebutter's Elements library to render a floating "bubble"
 * donate button. When clicked, it opens a modal with the donation form.
 *
 * Usage:
 * 1. Set your NEXT_PUBLIC_GIVEBUTTER_ACCOUNT and NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID
 *    environment variables, OR pass them as props
 * 2. Add this component to your layout
 *
 * @see https://docs.givebutter.com/docs/elements-bubble
 */
export function GivebutterFloatingButton({
  accountId,
  campaignId,
  label = "Donate",
  backgroundColor = "#b72031", // RiseUp brand accent color
  location = "bottom-right",
  verticalOffset = 150,
  horizontalOffset = 120,
}: GivebutterFloatingButtonProps) {
  const initialized = useRef(false);

  const resolvedAccountId =
    accountId || process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT;
  const resolvedCampaignId =
    campaignId || process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID;

  // Initialize Givebutter before script loads (required pattern)
  useEffect(() => {
    if (initialized.current || !resolvedAccountId) return;
    initialized.current = true;

    // Set up the Givebutter queue function before script loads
    window.Givebutter =
      window.Givebutter ||
      function (...args: unknown[]) {
        (window.Givebutter.q = window.Givebutter.q || []).push(args);
      };
    window.Givebutter.l = +new Date();

    // Configure the bubble
    window.Givebutter("setOptions", {
      accountId: resolvedAccountId,
      campaign: resolvedCampaignId,
      bubble: {
        visible: true,
        label: label,
        hideLabel: false,
        backgroundColor: backgroundColor,
        location: location,
        verticalOffset: verticalOffset,
        horizontalOffset: horizontalOffset,
        buttonTransformShow: "scale(1)",
        buttonTransformHide: "scale(0)",
        modal: {
          fullscreen: false,
          position: "right",
        },
      },
    });
  }, [
    resolvedAccountId,
    resolvedCampaignId,
    label,
    backgroundColor,
    location,
    verticalOffset,
    horizontalOffset,
  ]);

  // Don't render if not configured
  if (!resolvedAccountId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "GivebutterFloatingButton: Missing accountId. Set NEXT_PUBLIC_GIVEBUTTER_ACCOUNT env var."
      );
    }
    return null;
  }

  // Load the Givebutter Elements script
  return (
    <Script
      src="https://js.givebutter.com/elements/latest.js"
      strategy="afterInteractive"
    />
  );
}
