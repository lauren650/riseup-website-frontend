"use client";

import { useEffect, useState } from "react";
import { loadGivebutterWidgetsScript } from "@/lib/givebutter-load-widgets";

interface GivebutterWidgetProps {
  widgetId?: string;
  align?: "left" | "center" | "right";
  accountId?: string;
  /** Shown while the widget script loads */
  loadingLabel?: string;
}

export function GivebutterWidget({
  widgetId,
  align = "center",
  accountId,
  loadingLabel = "Loading form…",
}: GivebutterWidgetProps) {
  const resolvedWidgetId =
    widgetId ||
    process.env.NEXT_PUBLIC_GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID ||
    process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID;
  const resolvedAccountId = accountId || process.env.NEXT_PUBLIC_GIVEBUTTER_ACCOUNT;

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!resolvedWidgetId || !resolvedAccountId) {
      return;
    }

    let cancelled = false;

    loadGivebutterWidgetsScript(resolvedAccountId)
      .then(() => {
        if (!cancelled) {
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedWidgetId, resolvedAccountId]);

  if (!resolvedWidgetId || !resolvedAccountId) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-background p-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Form not configured</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Set NEXT_PUBLIC_GIVEBUTTER_ACCOUNT and a widget ID (e.g.{" "}
            NEXT_PUBLIC_GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID)
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-background p-8">
        <p className="text-center text-muted-foreground">
          Unable to load the registration form. Please refresh the page or{" "}
          <a href="/contact" className="text-accent hover:opacity-90">
            contact us
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "500px", maxWidth: "560px", width: "100%" }}
      className="mx-auto"
    >
      {status === "loading" && (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-muted-foreground">{loadingLabel}</p>
        </div>
      )}
      {status === "ready" && (
        <givebutter-widget
          key={resolvedWidgetId}
          id={resolvedWidgetId}
          align={align}
          account={resolvedAccountId}
        />
      )}
    </div>
  );
}
