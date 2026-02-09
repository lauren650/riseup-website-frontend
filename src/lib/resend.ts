/**
 * Resend email utilities with rate limit handling.
 * Resend enforces 2 requests/second; exceeding returns 429.
 * This module adds retry-on-429 and spacing for multiple sends.
 */

import type { CreateEmailOptions, CreateEmailResponse } from "resend";
import type { Resend } from "resend";

/** Delay in ms to stay under 2 req/sec (500ms = safe spacing) */
const RATE_LIMIT_DELAY_MS = 600;

/** Delay when retrying after 429 (Resend suggests waiting for retry-after) */
const RETRY_DELAY_MS = 1000;

/** Max retries on 429 before giving up */
const MAX_RETRIES = 3;

/**
 * Send an email via Resend with automatic retry on 429 (rate limit).
 * Use this instead of direct resend.emails.send() to handle rate limits.
 */
export async function sendWithRetry(
  client: Resend,
  options: CreateEmailOptions
): Promise<CreateEmailResponse> {
  let lastResult: CreateEmailResponse | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const result = await client.emails.send(options);
    lastResult = result;
    const error = result.error as { statusCode?: number; name?: string } | null;

    if (!error) {
      return result;
    }

    const isRateLimit = error.statusCode === 429 || error.name === "rate_limit_exceeded";
    if (isRateLimit && attempt < MAX_RETRIES) {
      const waitMs = RETRY_DELAY_MS * (attempt + 1);
      console.warn(
        `[Resend] Rate limit (429), retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
      );
      await sleep(waitMs);
      continue;
    }

    return result;
  }

  return lastResult!;
}

/**
 * Delay between sending multiple emails in the same flow.
 * Call this before the 2nd, 3rd, etc. email to stay under 2 req/sec.
 */
export function delayBetweenEmails(): Promise<void> {
  return sleep(RATE_LIMIT_DELAY_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
