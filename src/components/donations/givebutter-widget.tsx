"use client";

import Script from "next/script";

interface GivebutterWidgetProps {
  widgetId?: string;
  align?: "left" | "center" | "right";
  campaignId?: string;
  accountId?: string;
}

export function GivebutterWidget({
  widgetId,
  align = "center",
  campaignId,
  accountId,
}: GivebutterWidgetProps) {
  // Use props or environment variables
  const resolvedWidgetId = widgetId || process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID;
  const resolvedAccountId = accountId || process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT;
  const resolvedCampaignId = campaignId || process.env.NEXT_PUBLIC_GIVEBUTTER_CAMPAIGN_ID;

  // Show fallback if not configured
  if (!resolvedWidgetId || !resolvedAccountId) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-background p-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Donation form not configured
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Set NEXT_PUBLIC_GIVEBUTTER_ACCOUNT and NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* GiveButter library script */}
      <Script
        src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${resolvedAccountId}`}
        strategy="afterInteractive"
      />

      {/* GiveButter form element - using the giving-form component that matches your old site */}
      <div style={{ minHeight: "500px" }} className="mx-auto" style={{ maxWidth: "440px" }}>
        <givebutter-giving-form
          id={resolvedWidgetId}
          account={resolvedAccountId}
          campaign={resolvedCampaignId}
          theme-color="#121126"
          max-width="440px"
          show-goal-bar="false"
        ></givebutter-giving-form>
      </div>
    </>
  );
}
