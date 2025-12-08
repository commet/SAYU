/**
 * SAYU Design System
 * Unified design tokens and utilities
 */

export { colors, getColor, tailwindColors, type ColorKey } from './colors';
export { typography, textStyles, tailwindTypography } from './typography';
export { spacing, containerWidth, borderRadius, semanticSpacing } from './spacing';
export { shadows, tailwindShadows } from './shadows';

// Complete design system export
export const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
} as const;
