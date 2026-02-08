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
  process.env.NEXT_PUBLIC_REGISTER_ENDZONE_URL ?? 'https://endzone.example.com/register';
