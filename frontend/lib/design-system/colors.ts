/**
 * SAYU Design System - Color Palette
 * Clean, museum-inspired colors (NO PURPLE!)
 */

export const colors = {
  // Base Colors - Clean whites and grays
  white: '#FFFFFF',
  offWhite: '#FAFAF9',
  lightGray: '#F5F5F4',

  // Text Hierarchy (IMPROVED - Better contrast)
  black: '#000000',           // Pure black for headings
  darkGray: '#1A1A1A',        // Near black for body
  midGray: '#525252',         // Darker gray for secondary
  lightGrayText: '#737373',   // Only for captions

  // Borders & Dividers
  border: '#E5E5E5',
  borderLight: '#F5F5F4',

  // Accent Colors - Warm, art-focused
  accentPrimary: '#D97706',    // Amber - SAYU signature
  accentWarm: '#EA580C',       // Orange - CTA buttons
  accentCool: '#0369A1',       // Sky blue - Links & secondary

  // Accent Variations
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',  // Primary
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',  // Warm accent
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',  // Cool accent
    800: '#075985',
    900: '#0C4A6E',
  },

  // Semantic Colors
  success: '#16A34A',
  successLight: '#86EFAC',
  warning: '#EAB308',
  warningLight: '#FDE047',
  error: '#DC2626',
  errorLight: '#FCA5A5',
  info: '#0EA5E9',
  infoLight: '#BAE6FD',
} as const;

export type ColorKey = keyof typeof colors;

// Helper function to get color value
export function getColor(key: ColorKey): string {
  return colors[key];
}

// Export for Tailwind config
export const tailwindColors = {
  sayu: {
    white: colors.white,
    'off-white': colors.offWhite,
    'light-gray': colors.lightGray,
    black: colors.black,
    'dark-gray': colors.darkGray,
    'mid-gray': colors.midGray,
    'light-gray-text': colors.lightGrayText,
    border: colors.border,
    'border-light': colors.borderLight,
    accent: colors.accentPrimary,
    'accent-warm': colors.accentWarm,
    'accent-cool': colors.accentCool,
    amber: colors.amber,
    orange: colors.orange,
    sky: colors.sky,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
};
