/**
 * SAYU Design System - Shadows
 * Subtle, refined shadows (no heavy drop-shadows)
 */

export const shadows = {
  // Base shadows (Tailwind-compatible)
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Component-specific shadows
  card: {
    default: '0 1px 3px rgba(0, 0, 0, 0.04)',
    hover: '0 4px 12px rgba(0, 0, 0, 0.08)',
    focus: '0 0 0 3px rgba(217, 119, 6, 0.1)', // Amber focus ring
  },
  button: {
    default: 'none',
    hover: '0 2px 8px rgba(0, 0, 0, 0.08)',
    active: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  dropdown: {
    default: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
  },
  modal: {
    default: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
} as const;

// Export for Tailwind config
export const tailwindShadows = {
  'card-default': shadows.card.default,
  'card-hover': shadows.card.hover,
  'button-hover': shadows.button.hover,
  'dropdown': shadows.dropdown.default,
  'modal': shadows.modal.default,
};
