import { headers } from "next/headers";
import { FORM_STARTED_AT_FIELD, HONEYPOT_FIELD } from "@/lib/spam-fields";

export { FORM_STARTED_AT_FIELD, HONEYPOT_FIELD };

const MIN_SUBMIT_MS = 2500;
const MAX_SUBMIT_MS = 12 * 60 * 60 * 1000;
const MIN_SCORE = 0.5;

export type SpamSignalResult =
  | { action: "allow" }
  | { action: "silent_drop"; reason: "honeypot" }
  | { action: "reject"; reason: "too_fast" | "invalid_timer" | "stale"; message: string };

type SiteVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

/**
 * Honeypot and minimum fill-time. These run even when reCAPTCHA keys are absent.
 * A tripped honeypot should look successful so the bot does not retry.
 */
export function checkFormSpamSignals(formData: FormData): SpamSignalResult {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { action: "silent_drop", reason: "honeypot" };
  }

  const rawStarted = formData.get(FORM_STARTED_AT_FIELD);
  if (typeof rawStarted !== "string" || rawStarted.trim() === "") {
    return {
      action: "reject",
      reason: "invalid_timer",
      message: "Please refresh the page and try again.",
    };
  }

  const started = Number(rawStarted);
  if (!Number.isFinite(started) || started <= 0) {
    return {
      action: "reject",
      reason: "invalid_timer",
      message: "Please refresh the page and try again.",
    };
  }

  const elapsed = Date.now() - started;

  // Client clock slightly ahead of the server is normal. A large gap is not.
  if (elapsed < -2 * 60 * 1000) {
    return {
      action: "reject",
      reason: "invalid_timer",
      message: "Please refresh the page and try again.",
    };
  }

  if (elapsed > MAX_SUBMIT_MS) {
    return {
      action: "reject",
      reason: "stale",
      message: "This form expired. Please refresh the page and try again.",
    };
  }

  if (elapsed >= 0 && elapsed < MIN_SUBMIT_MS) {
    return {
      action: "reject",
      reason: "too_fast",
      message: "Please wait a moment and try again.",
    };
  }

  return { action: "allow" };
}

async function getClientIp(): Promise<string | undefined> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      const ip = forwarded.split(",")[0]?.trim();
      if (ip) return ip;
    }
    return headerList.get("x-real-ip")?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Fail closed when a secret key is configured. Missing tokens, low scores,
 * and Google outages are rejected. Skip only when protection is turned off
 * or the secret is not set (local development).
 */
export async function verifyRecaptcha(
  token: string | undefined,
  expectedAction: string
): Promise<{ ok: true } | { ok: false; reason: string; message: string }> {
  const disabled = process.env.NEXT_PUBLIC_DISABLE_RECAPTCHA === "true";
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim();

  if (disabled || !secretKey) {
    if (!secretKey && !disabled) {
      console.warn(
        "[spam] RECAPTCHA_SECRET_KEY is not set. Submissions are not checked with Google."
      );
    }
    return { ok: true };
  }

  if (!token || token.length < 20) {
    return {
      ok: false,
      reason: "missing_token",
      message:
        "Spam protection didn't run. Refresh the page and try again. If it keeps happening, turn off any ad blocker.",
    };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });
    const remoteIp = await getClientIp();
    if (remoteIp) params.set("remoteip", remoteIp);

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    const data = (await response.json()) as SiteVerifyResponse;

    if (!data.success) {
      console.warn("[spam] reCAPTCHA rejected token", data["error-codes"]);
      return {
        ok: false,
        reason: "rejected",
        message: "We couldn't confirm this submission. Please try again.",
      };
    }

    const score = data.score ?? 0;
    if (score < MIN_SCORE) {
      console.warn("[spam] reCAPTCHA score too low", { score, action: data.action });
      return {
        ok: false,
        reason: "low_score",
        message: "We couldn't confirm this submission. Please try again.",
      };
    }

    if (data.action && data.action !== expectedAction) {
      console.warn("[spam] reCAPTCHA action mismatch", {
        expected: expectedAction,
        actual: data.action,
      });
      return {
        ok: false,
        reason: "action_mismatch",
        message: "We couldn't confirm this submission. Please try again.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[spam] reCAPTCHA verification request failed", error);
    return {
      ok: false,
      reason: "request_failed",
      message:
        "Spam protection is temporarily unavailable. Please try again in a moment.",
    };
  }
}
