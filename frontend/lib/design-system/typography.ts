/**
 * SAYU Design System - Typography
 * Serif for elegance, Sans-serif for readability
 */

export const typography = {
  // Font Families
  fontFamily: {
    heading: "'Playfair Display', 'Noto Serif KR', serif",
    body: "'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },

  // Font Sizes (matching Tailwind scale)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
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
} as const;

// Predefined text styles (component-ready)
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    fontFamily: typography.fontFamily.heading,
  },
  h2: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    fontFamily: typography.fontFamily.heading,
  },
  h3: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    fontFamily: typography.fontFamily.heading,
  },
  h4: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    fontFamily: typography.fontFamily.body,
  },
  h5: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.body,
  },

  // Body text
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.body,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.body,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.body,
  },

  // Special
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.body,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.body,
  },
} as const;

// Export for Tailwind config
export const tailwindTypography = {
  fontFamily: {
    heading: typography.fontFamily.heading.split(','),
    body: typography.fontFamily.body.split(','),
    mono: typography.fontFamily.mono.split(','),
  },
};
