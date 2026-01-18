"use client";

import Script from "next/script";

interface GivebutterWidgetProps {
  widgetId?: string;
  align?: "left" | "center" | "right";
}

export function GivebutterWidget({
  widgetId,
  align = "center",
}: GivebutterWidgetProps) {
  // Use prop or environment variable, with fallback for unconfigured state
  const resolvedWidgetId =
    widgetId || process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID;

  // Show fallback if widget ID is not configured
  if (!resolvedWidgetId || resolvedWidgetId === "your-widget-id") {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-background p-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Donation form not configured
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Set NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID in your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* GiveButter library script - load once */}
      <Script
        src="https://widgets.givebutter.com/latest.umd.cjs"
        strategy="afterInteractive"
      />

      {/* Widget element - min-height prevents layout shift during checkout */}
      <div style={{ minHeight: "500px" }}>
        <givebutter-widget id={resolvedWidgetId} align={align}></givebutter-widget>
      </div>
    </>
  );
}
