"use client";

import { ReCaptchaProvider } from "next-recaptcha-v3";

interface RecaptchaProviderWrapperProps {
  siteKey: string | undefined;
  children: React.ReactNode;
}

/**
 * Wraps children with ReCaptchaProvider when site key is configured.
 * Placing this at the layout level ensures the reCAPTCHA script loads
 * early, preventing "Recaptcha has not been loaded" errors on form submit.
 */
export function RecaptchaProviderWrapper({
  siteKey,
  children,
}: RecaptchaProviderWrapperProps) {
  if (siteKey) {
    return (
      <ReCaptchaProvider reCaptchaKey={siteKey}>{children}</ReCaptchaProvider>
    );
  }

  return <>{children}</>;
}
