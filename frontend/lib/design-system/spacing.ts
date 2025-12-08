/**
 * SAYU Design System - Spacing & Layout
 * Consistent spacing scale
 */

export const spacing = {
  // Base spacing scale (matches Tailwind)
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  32: '8rem',        // 128px
  40: '10rem',       // 160px
  48: '12rem',       // 192px
  56: '14rem',       // 224px
  64: '16rem',       // 256px
} as const;

// Container max widths
export const containerWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px - Default for cards
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',
} as const;

// Semantic spacing (component-specific)
export const semanticSpacing = {
  card: {
    padding: spacing[6],        // 24px
    gap: spacing[4],            // 16px
    radius: borderRadius.base,  // 8px
  },
  section: {
    paddingY: spacing[16],      // 64px
    paddingX: spacing[6],       // 24px
    gap: spacing[12],           // 48px
  },
  container: {
    paddingX: spacing[4],       // 16px (mobile)
    paddingXLg: spacing[8],     // 32px (desktop)
    maxWidth: containerWidth.xl,
  },
  button: {
    paddingX: spacing[6],       // 24px
    paddingY: spacing[3],       // 12px
    gap: spacing[2],            // 8px
  },
} as const;
