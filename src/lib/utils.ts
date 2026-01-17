import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind classes using tailwind-merge.
 * This handles conflicting Tailwind classes properly (e.g., px-2 px-4 becomes px-4).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
