"use client";

import Script from "next/script";

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
  const resolvedAccountId =
    accountId || process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT;
  const resolvedCampaignId =
    campaignId || process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID;

  // Don't render if not configured
  if (!resolvedAccountId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "GivebutterFloatingButton: Missing accountId. Set NEXT_PUBLIC_GIVEBUTTER_ACCOUNT env var."
      );
    }
    return null;
  }

  // Build the initialization script that MUST run before the library loads
  const initScript = `
    window.Givebutter=window.Givebutter||function(){(Givebutter.q=Givebutter.q||[]).push(arguments)};Givebutter.l=+new Date;
    window.Givebutter('setOptions', {
      accountId: "${resolvedAccountId}",
      campaign: "${resolvedCampaignId || ""}",
      bubble: {
        visible: true,
        label: "${label}",
        hideLabel: false,
        backgroundColor: "${backgroundColor}",
        location: "${location}",
        verticalOffset: ${verticalOffset},
        horizontalOffset: ${horizontalOffset},
        buttonTransformShow: "scale(1)",
        buttonTransformHide: "scale(0)",
        modal: {
          fullscreen: false,
          position: "right"
        }
      }
    });
  `;

  return (
    <>
      {/* Initialization script - MUST run before the library */}
      <Script
        id="givebutter-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: initScript }}
      />
      {/* Load the Givebutter Elements library */}
      <Script
        id="givebutter-lib"
        src="https://js.givebutter.com/elements/latest.js"
        strategy="afterInteractive"
      />
    </>
  );
}
