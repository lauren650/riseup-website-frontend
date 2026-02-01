"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

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
   * Widget ID for the newer Widgets system (optional - if using Elements bubble instead)
   */
  widgetId?: string;
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
   * @default 25
   */
  verticalOffset?: number;
  /**
   * Horizontal offset from edge in pixels
   * @default 25
   */
  horizontalOffset?: number;
}

declare global {
  interface Window {
    Givebutter?: (action: string, options: Record<string, unknown>) => void;
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
  widgetId,
  label = "Donate",
  backgroundColor = "#b72031", // RiseUp brand accent color
  location = "bottom-right",
  verticalOffset = 25,
  horizontalOffset = 25,
}: GivebutterFloatingButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const resolvedAccountId =
    accountId || process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT;
  const resolvedCampaignId =
    campaignId || process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID;
  const resolvedWidgetId =
    widgetId || process.env.NEXT_PUBLIC_GIVEBUTTER_FLOATING_WIDGET_ID;

  // Initialize Givebutter bubble when script loads
  useEffect(() => {
    if (scriptLoaded && window.Givebutter && resolvedAccountId) {
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
    }
  }, [
    scriptLoaded,
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

  // If using newer Widgets system with a floating widget ID
  if (resolvedWidgetId) {
    return (
      <Script
        src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${resolvedAccountId}`}
        strategy="afterInteractive"
        onLoad={() => {
          // Widget system handles floating automatically if configured in dashboard
        }}
      />
    );
  }

  // Use Elements library with bubble configuration
  return (
    <Script
      src={`https://givebutter.com/js/widget.js`}
      strategy="afterInteractive"
      onLoad={() => setScriptLoaded(true)}
    />
  );
}
