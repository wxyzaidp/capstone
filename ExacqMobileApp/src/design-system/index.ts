/**
 * Design System Index
 * Central place to import all design system tokens
 */

// Export all design system parts
export * from './colors';
export * from './typography';
export * from './radius';

// Re-export commonly used token groups
import { UI_COLORS } from './colors';
import { UI_TYPOGRAPHY, applyTypography, TypographyToken } from './typography';
import { UI_RADIUS } from './radius';

// Convenient function to apply typography with optional color
export const applyStyle = (
  typographyToken: TypographyToken,
  colorTokenPath?: string,
  options?: { textAlign?: 'left' | 'center' | 'right' | 'justify' }
) => {
  return applyTypography(typographyToken, {
    color: colorTokenPath ? UI_COLORS.TEXT[colorTokenPath as keyof typeof UI_COLORS.TEXT] : undefined,
    ...options,
  });
}; 