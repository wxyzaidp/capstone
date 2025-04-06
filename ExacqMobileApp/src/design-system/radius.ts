/**
 * Radius Design System
 * Based on Figma Design Tokens
 */

/**
 * Primitive radius values directly from Figma
 */
export const RADIUS = {
  NONE: 0,
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  ROUND: 9999, // For circular elements
} as const;

/**
 * Semantic radius naming for contextual use
 */
export const RADIUS_SEMANTIC = {
  BUTTON: {
    SMALL: RADIUS.XS,
    MEDIUM: RADIUS.SM,
    LARGE: RADIUS.MD,
    PILL: RADIUS.ROUND,
  },
  CARD: {
    DEFAULT: RADIUS.LG, // Updated based on Figma Card components
    SMALL: RADIUS.SM,
    LARGE: RADIUS.XL,
  },
  MODAL: {
    DEFAULT: RADIUS.LG,
    LARGE: RADIUS.XL,
  },
  INPUT: {
    DEFAULT: RADIUS.SM,
    LARGE: RADIUS.MD,
  },
  BADGE: {
    DEFAULT: RADIUS.XS,
    PILL: RADIUS.ROUND,
  },
  AVATAR: {
    DEFAULT: RADIUS.ROUND, // Circular avatars
    ROUNDED: RADIUS.MD,    // Rounded avatars
  },
  ICON: {
    DEFAULT: RADIUS.XS,
    ROUNDED: RADIUS.SM,
    CIRCULAR: RADIUS.ROUND,
  },
  TOAST: RADIUS.MD,
  TOOLTIP: RADIUS.XS,
} as const;

/**
 * Figma token names for mapping directly to our design system
 */
export const RADIUS_FIGMA_TOKEN = {
  'radius.none': RADIUS.NONE,
  'radius.xs': RADIUS.XS,
  'radius.sm': RADIUS.SM,
  'radius.md': RADIUS.MD,
  'radius.lg': RADIUS.LG,
  'radius.xl': RADIUS.XL,
  'radius.xxl': RADIUS.XXL,
  'radius.round': RADIUS.ROUND,
} as const;

/**
 * UI Element mapping
 */
export const UI_RADIUS = {
  BUTTON: RADIUS_SEMANTIC.BUTTON,
  CARD: RADIUS_SEMANTIC.CARD,
  MODAL: RADIUS_SEMANTIC.MODAL,
  INPUT: RADIUS_SEMANTIC.INPUT,
  BADGE: RADIUS_SEMANTIC.BADGE,
  AVATAR: RADIUS_SEMANTIC.AVATAR,
  ICON: RADIUS_SEMANTIC.ICON,
  TOAST: RADIUS_SEMANTIC.TOAST,
  TOOLTIP: RADIUS_SEMANTIC.TOOLTIP,
} as const;

/**
 * Helper function to get radius value based on token name
 */
export function getRadius(tokenName: keyof typeof RADIUS_FIGMA_TOKEN): number {
  return RADIUS_FIGMA_TOKEN[tokenName];
} 