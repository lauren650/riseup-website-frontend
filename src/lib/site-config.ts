/**
 * Site configuration - edit these values to update links and settings across the site.
 * Changes here will apply after the next build/refresh.
 *
 * You can also set NEXT_PUBLIC_REGISTER_ENDZONE_URL in .env.local to override the URL
 * without editing this file (useful for different environments).
 */

/**
 * Register at Endzone - URL for the registration button in the navigation.
 * Edit the URL below, or set NEXT_PUBLIC_REGISTER_ENDZONE_URL in .env.local
 */
export const REGISTER_ENDZONE_URL =
  process.env.NEXT_PUBLIC_REGISTER_ENDZONE_URL ?? 'https://endzone.riseupfootball.org';

/**
 * Shop - URL for the Shop link in the navigation (Squadlocker team store).
 * Set NEXT_PUBLIC_SHOP_URL in .env.local to override.
 */
export const SHOP_URL =
  process.env.NEXT_PUBLIC_SHOP_URL ?? 'https://teamlocker.squadlocker.com/stores/riseup-moore#/lockers/riseup-moore';

/**
 * On-page anchor for golf tournament registration (GiveButter widget section).
 */
export const GOLF_TOURNAMENT_REGISTER_URL = '#register';

/**
 * GiveButter widget ID for golf tournament ticket purchases.
 * Set NEXT_PUBLIC_GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID in .env.local to override.
 */
export const GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID =
  process.env.NEXT_PUBLIC_GOLF_TOURNAMENT_GIVEBUTTER_WIDGET_ID ?? 'LxGK8b';

/**
 * Base URL for the site (used for absolute links in emails, e.g. /upload/[token]).
 * Set NEXT_PUBLIC_SITE_URL in .env.local / Vercel. Falls back to VERCEL_URL in production.
 */
export function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://riseupfootball.org'; // fallback for production
}
