/**
 * Typography Design System
 * Based on Figma Design Tokens
 */
import { TextStyle } from 'react-native';
import { UI_COLORS } from './colors';

/**
 * Font families
 */
export const FONT_FAMILY = {
  REGULAR: 'Outfit-Regular',
  MEDIUM: 'Outfit-Medium',
  SEMI_BOLD: 'Outfit-SemiBold',
  BOLD: 'Outfit-Bold',
} as const;

/**
 * Font weights
 */
export const FONT_WEIGHT = {
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMI_BOLD: '600' as const,
  BOLD: '700' as const,
} as const;

/**
 * Font sizes
 * Updated to match Figma
 */
export const FONT_SIZE = {
  XXS: 10,
  XS: 12,
  SM: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 28,
  XXXXL: 32,
} as const;

/**
 * Line heights
 * Updated to match Figma
 */
export const LINE_HEIGHT = {
  XXS: 14,
  XS: 16,
  SM: 20,
  MD: 24,
  LG: 28,
  XL: 30,
  XXL: 36,
  XXXL: 40,
  XXXXL: 44,
} as const;

/**
 * Letter spacing
 */
export const LETTER_SPACING = {
  TIGHTER: -0.5,
  TIGHT: -0.25,
  NORMAL: 0,
  WIDE: 0.5,
  WIDER: 1,
  LABEL: 0.2, // 2% letter spacing for labels in Figma
  BUTTON: 0.2, // 2% letter spacing for buttons in Figma
  CATEGORY: 0.25, // 25% letter spacing for category headers in Figma
} as const;

/**
 * Text transforms
 */
export const TEXT_TRANSFORM = {
  NONE: 'none',
  CAPITALIZE: 'capitalize',
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
} as const;

/**
 * Typography Token Interface
 */
export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: TextStyle['textTransform'];
}

/**
 * Typography Tokens
 */
export const TYPOGRAPHY = {
  // Headings
  HEADING_1: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.XXL,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XXL,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  HEADING_2: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.XL,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XL,
    letterSpacing: LETTER_SPACING.TIGHT,
  },
  HEADING_3: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: FONT_SIZE.MD,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.MD,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  
  // Category headers
  CATEGORY: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: FONT_SIZE.XS,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XS,
    letterSpacing: LETTER_SPACING.CATEGORY,
    textTransform: TEXT_TRANSFORM.UPPERCASE,
  },
  
  // Body text
  BODY_LARGE: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.MD,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  BODY_MEDIUM: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.SM,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.SM,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  BODY_SMALL: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.XS,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XS,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  
  // Labels
  LABEL_LARGE: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: FONT_SIZE.MD,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.MD,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  LABEL_MEDIUM: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: FONT_SIZE.SM,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.SM,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  LABEL_SMALL: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: FONT_SIZE.XS,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XS,
    letterSpacing: LETTER_SPACING.LABEL,
  },
  
  // Buttons
  BUTTON_LARGE: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: FONT_SIZE.MD,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.MD,
    letterSpacing: LETTER_SPACING.BUTTON,
  },
  BUTTON_MEDIUM: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: FONT_SIZE.SM,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.SM,
    letterSpacing: LETTER_SPACING.BUTTON,
  },
  BUTTON_SMALL: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: FONT_SIZE.XS,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XS,
    letterSpacing: LETTER_SPACING.BUTTON,
  },
  
  // Special typographies
  TITLE: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: FONT_SIZE.XL,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  SUBTITLE: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: FONT_SIZE.SM,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.SM,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  SECTION_TITLE: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: FONT_SIZE.MD,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.MD,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  CARD_TITLE: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: FONT_SIZE.XL,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XL,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  CARD_SUBTITLE: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.MD,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.MD,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  CAPTION: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: FONT_SIZE.XS,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XS,
    letterSpacing: LETTER_SPACING.NORMAL,
  },
  
  // Navigation
  NAV_ITEM: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: FONT_SIZE.XS,
    fontWeight: undefined,
    lineHeight: LINE_HEIGHT.XS,
    letterSpacing: LETTER_SPACING.LABEL, 
  },
  
  // Status bar (iOS style)
  STATUS_BAR: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 17,
    fontWeight: FONT_WEIGHT.SEMI_BOLD,
    lineHeight: 22,
    letterSpacing: -0.24, // -2.4% as in Figma
  },
} as const;

// Add debug console log
console.log('[typography.ts] CATEGORY definition:', TYPOGRAPHY.CATEGORY);
console.log('[typography.ts] Available font families:', FONT_FAMILY);

/**
 * Typography for UI elements
 */
export const UI_TYPOGRAPHY = {
  // Headings
  HEADING_1: TYPOGRAPHY.HEADING_1,
  HEADING_2: TYPOGRAPHY.HEADING_2,
  HEADING_3: TYPOGRAPHY.HEADING_3,
  
  // Page content
  TITLE: TYPOGRAPHY.TITLE,
  SUBTITLE: TYPOGRAPHY.SUBTITLE,
  SECTION_TITLE: TYPOGRAPHY.SECTION_TITLE,
  
  // Card elements
  CARD_TITLE: TYPOGRAPHY.CARD_TITLE,
  CARD_SUBTITLE: TYPOGRAPHY.CARD_SUBTITLE,
  
  // Body content
  BODY_LARGE: TYPOGRAPHY.BODY_LARGE,
  BODY_MEDIUM: TYPOGRAPHY.BODY_MEDIUM,
  BODY_SMALL: TYPOGRAPHY.BODY_SMALL,
  
  // Form elements
  LABEL_LARGE: TYPOGRAPHY.LABEL_LARGE,
  LABEL_MEDIUM: TYPOGRAPHY.LABEL_MEDIUM,
  LABEL_SMALL: TYPOGRAPHY.LABEL_SMALL,
  
  // Buttons
  BUTTON_LARGE: TYPOGRAPHY.BUTTON_LARGE,
  BUTTON_MEDIUM: TYPOGRAPHY.BUTTON_MEDIUM,
  BUTTON_SMALL: TYPOGRAPHY.BUTTON_SMALL,
  
  // Special text
  CAPTION: TYPOGRAPHY.CAPTION,
  CATEGORY: TYPOGRAPHY.CATEGORY,
  NAV_ITEM: TYPOGRAPHY.NAV_ITEM,
  STATUS_BAR: TYPOGRAPHY.STATUS_BAR,
} as const;

/**
 * Figma token names for direct mapping
 */
export const TYPOGRAPHY_TOKENS = {
  // Headings
  '--p-heading-1': TYPOGRAPHY.HEADING_1,
  '--p-heading-2': TYPOGRAPHY.HEADING_2,
  '--p-heading-3': TYPOGRAPHY.HEADING_3,
  
  // Body text
  '--p-body-large': TYPOGRAPHY.BODY_LARGE,
  '--p-body-medium': TYPOGRAPHY.BODY_MEDIUM,
  '--p-body-small': TYPOGRAPHY.BODY_SMALL,
  
  // Labels
  '--p-label-large': TYPOGRAPHY.LABEL_LARGE,
  '--p-label-medium': TYPOGRAPHY.LABEL_MEDIUM,
  '--p-label-small': TYPOGRAPHY.LABEL_SMALL,
  
  // Special typographies
  '--p-title': TYPOGRAPHY.TITLE,
  '--p-subtitle': TYPOGRAPHY.SUBTITLE,
  '--p-section-title': TYPOGRAPHY.SECTION_TITLE,
  '--p-card-title': TYPOGRAPHY.CARD_TITLE,
  '--p-card-subtitle': TYPOGRAPHY.CARD_SUBTITLE,
  '--p-caption': TYPOGRAPHY.CAPTION,
  '--p-category': TYPOGRAPHY.CATEGORY,
  '--p-nav-item': TYPOGRAPHY.NAV_ITEM,
  '--p-status-bar': TYPOGRAPHY.STATUS_BAR,
  
  // Buttons
  '--p-button-large': TYPOGRAPHY.BUTTON_LARGE,
  '--p-button-medium': TYPOGRAPHY.BUTTON_MEDIUM,
  '--p-button-small': TYPOGRAPHY.BUTTON_SMALL,
} as const;

/**
 * Apply typography style with optional color and other text styles
 */
export const applyTypography = (
  token: TypographyToken,
  options?: { 
    color?: string;
    textAlign?: TextStyle['textAlign']; 
  }
): TextStyle => {
  // Debug logging
  console.log('[applyTypography] Using token:', {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontWeight: token.fontWeight
  });
  
  // Create style object without undefined values
  const baseStyle: TextStyle = {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  };
  
  // Only add properties that are defined
  if (token.fontWeight !== undefined) {
    baseStyle.fontWeight = token.fontWeight;
  }
  
  if (token.letterSpacing !== undefined) {
    baseStyle.letterSpacing = token.letterSpacing;
  }
  
  if (token.textTransform !== undefined) {
    baseStyle.textTransform = token.textTransform;
  }
  
  // Apply any additional options
  const style = {
    ...baseStyle,
    ...options,
  };
  
  console.log('[applyTypography] Resulting style:', style);
  
  return style;
}; 