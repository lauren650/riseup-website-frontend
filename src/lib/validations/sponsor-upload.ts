import { z } from 'zod';

/**
 * Validation schema for sponsor upload form
 * Used in Phase 11 when sponsors submit their logo and website URL
 */
export const sponsorUploadSchema = z.object({
  logo: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: 'Logo must be less than 2MB',
    })
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type),
      {
        message: 'Logo must be PNG, JPG, or SVG',
      }
    ),
  website_url: z
    .string()
    .url('Must be a valid URL')
    .min(1, 'Website URL is required')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      {
        message: 'URL must start with http:// or https://',
      }
    ),
});

export type SponsorUploadInput = z.infer<typeof sponsorUploadSchema>;

/**
 * Validates file type and size on the client side
 * Returns error message if invalid, null if valid
 */
export function validateLogoFile(file: File): string | null {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];

  if (file.size > maxSize) {
    return 'Logo must be less than 2MB';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Logo must be PNG, JPG, or SVG';
  }

  return null;
}

/**
 * Validates website URL format
 * Returns error message if invalid, null if valid
 */
export function validateWebsiteUrl(url: string): string | null {
  if (!url || url.trim() === '') {
    return 'Website URL is required';
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Must be a valid URL';
  }
}
