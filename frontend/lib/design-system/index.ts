/**
 * SAYU Design System
 * Unified design tokens and utilities
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

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
