/**
 * RiseUp Brand Guidelines & Design System
 * 
 * This file contains all brand constants including colors, typography, spacing,
 * and design tokens. Import these values to ensure consistency across the app.
 * 
 * Inspired by: Anduril's dark, modern, tech-forward aesthetic
 */

// ============================================================================
// COLORS
// ============================================================================

export const brandColors = {
  // Primary Colors
  background: '#000000',
  foreground: '#ffffff',

  // Accent Colors
  accent: '#b72031', // RiseUp patriotic red brand color
  accentForeground: '#ffffff', // Text color on accent backgrounds (white on red)

  // Muted/Secondary
  muted: '#121126', // Patriotic blue for backgrounds
  mutedForeground: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white for secondary text
  
  // Semantic Colors
  success: '#10b981', // Green for success states
  warning: '#f59e0b', // Amber for warnings
  error: '#ef4444', // Red for errors
  info: '#3b82f6', // Blue for informational states
} as const

// Opacity variants for common use cases
export const opacities = {
  disabled: 0.5,
  hover: 0.9,
  muted: 0.6,
  subtle: 0.4,
  ghost: 0.1,
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
  },
  
  // Font Sizes (using Tailwind-like scale)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem',       // 128px
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Fully rounded (pills, circles)
} as const

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
  
  // Commonly used transition strings
  all: 'all 200ms ease-in-out',
  colors: 'color, background-color, border-color 200ms ease-in-out',
  opacity: 'opacity 200ms ease-in-out',
  transform: 'transform 200ms ease-in-out',
} as const

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Glow effects (using accent color)
  accentGlow: `0 0 20px rgba(183, 32, 49, 0.3)`,
  accentGlowStrong: `0 0 30px rgba(183, 32, 49, 0.5)`,
} as const

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

export const buttonVariants = {
  primary: {
    bg: brandColors.accent,
    text: brandColors.accentForeground,
    hoverOpacity: opacities.hover,
  },
  secondary: {
    bg: brandColors.foreground,
    text: brandColors.background,
    hoverOpacity: opacities.hover,
  },
  outline: {
    border: brandColors.foreground,
    text: brandColors.foreground,
    hoverBg: `rgba(255, 255, 255, ${opacities.ghost})`,
  },
} as const

// ============================================================================
// BRAND VOICE & TONE
// ============================================================================

/**
 * Brand Voice Guidelines:
 * 
 * - Professional yet approachable
 * - Empowering and motivational
 * - Community-focused
 * - Youth-centered, parent-trusted
 * - Action-oriented ("Rise up", "Get started", "Join us")
 * 
 * Tone:
 * - Warm but confident
 * - Encouraging without being preachy
 * - Clear and direct communication
 * - Celebrates achievement and growth
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get rgba color with custom opacity
 * @example getRgbaColor('#dff140', 0.5) // Returns 'rgba(223, 241, 64, 0.5)'
 */
export function getRgbaColor(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Get accent color with custom opacity
 */
export function getAccentWithOpacity(opacity: number): string {
  return getRgbaColor(brandColors.accent, opacity)
}

/**
 * Get foreground (white) with custom opacity
 */
export function getForegroundWithOpacity(opacity: number): string {
  return getRgbaColor(brandColors.foreground, opacity)
}
