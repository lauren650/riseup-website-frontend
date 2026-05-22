"use client";

import Script from "next/script";
import { markGivebutterWidgetsLoaded } from "@/lib/givebutter-load-widgets";

const SCRIPT_ID = "givebutter-widgets-global";

/**
 * Loads the GiveButter Widgets library site-wide so analytics always has an account ID.
 * @see https://docs.givebutter.com/widgets/getting-started
 */
export function GivebutterWidgetsScript() {
  const accountId = process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT;

  if (!accountId) {
    return null;
  }

  return (
    <Script
      id={SCRIPT_ID}
      src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(accountId)}`}
      strategy="afterInteractive"
      data-givebutter-widgets="true"
      onLoad={() => {
        const el = document.getElementById(SCRIPT_ID);
        if (el) {
          el.setAttribute("data-loaded", "true");
        }
        markGivebutterWidgetsLoaded();
      }}
      onError={() => {
        // Allow retry if the script fails (e.g. ad blocker)
        markGivebutterWidgetsFailed();
      }}
    />
  );
}
