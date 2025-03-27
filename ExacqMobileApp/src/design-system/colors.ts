/**
 * Colors Design System
 * Based on Figma Design Tokens
 */

/**
 * Primitive colors directly from Figma
 */
export const PRIMITIVE = {
  // Main palette
  PRIMARY: {
    '50': '#E3F2FD',
    '100': '#BBDEFB',
    '200': '#98E8FC', // Light blue from design
    '300': '#64B5F6',
    '400': '#42A5F5',
    '500': '#2196F3',
    '600': '#64DCFA', // Accent blue from design
    '700': '#1976D2',
    '800': '#1565C0',
    '900': '#0D47A1',
  },
  
  // Dark colors from Figma design - Updated to match Figma values exactly
  DARK: {
    BACKGROUND: '#1E2021', // Main background - confirmed in Figma
    CARD: '#23262D',      // Card and top bar background - confirmed in Figma
    CARD_ALT: '#2E333D',  // Secondary card backgrounds - confirmed in Figma
    BUTTON: 'rgba(46, 51, 61, 0.35)', // Button background
    OVERLAY: 'rgba(70, 78, 97, 0.35)', // Border and overlay colors - confirmed in Figma
  },
  
  // Neutrals
  NEUTRAL: {
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    '50': '#F5F5F5',
    '100': '#EEEEEE',
    '200': '#E0E0E0',
    '300': '#BDBDBD',
    '400': '#9E9E9E',
    '500': '#757575',
    '600': '#646A78', // Gray from pagination dots
    '700': '#717C98', // Gray from swipe text
    '800': '#B6BDCD', // Light gray text from design
    '900': '#121212',
  },
  
  // Home Indicator
  HOME_INDICATOR: {
    LIGHT: '#F3F5FB', // From Figma's Home Indicator fill
  },
  
  // Secondary palettes
  SECONDARY: {
    // Teal palette
    TEAL: {
      '50': '#D8EFEC',
      '100': '#BDE5E0',
      '200': '#9CD7D0',
      '300': '#7CCAC1',
      '400': '#5BBDB1',
      '500': '#3AB0A2',
      '600': '#309387',
      '700': '#27756C',
      '800': '#1D5851',
      '900': '#133B36',
    },
    
    // Gold palette
    GOLD: {
      '50': '#FFF7CC',
      '100': '#FFF2AA',
      '200': '#FFEBB0',
      '300': '#FFE655',
      '400': '#FFDE2B',
      '500': '#FFD700',
      '600': '#DAB300',
      '700': '#A68C00',
      '800': '#806C00',
      '900': '#554800',
    },
  },
  
  // Feedback colors
  FEEDBACK: {
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    INFO: '#2196F3',
  },
} as const;

/**
 * Semantic color mappings
 */
export const SEMANTIC = {
  // Main blue colors
  BLUE: {
    LIGHTEST: PRIMITIVE.PRIMARY['50'],
    LIGHTER: PRIMITIVE.PRIMARY['100'],
    LIGHT: PRIMITIVE.PRIMARY['200'],
    BASE: PRIMITIVE.PRIMARY['600'], // Updated to use the accent blue from design
    MEDIUM: PRIMITIVE.PRIMARY['600'],
    TEXT: PRIMITIVE.PRIMARY['700'],
    DARK: PRIMITIVE.PRIMARY['800'],
    DARKEST: PRIMITIVE.PRIMARY['900'],
  },
  
  // Teal colors
  TEAL: {
    LIGHTEST: PRIMITIVE.SECONDARY.TEAL['50'],
    LIGHTER: PRIMITIVE.SECONDARY.TEAL['100'],
    LIGHT: PRIMITIVE.SECONDARY.TEAL['300'],
    BASE: PRIMITIVE.SECONDARY.TEAL['500'],
    MEDIUM: PRIMITIVE.SECONDARY.TEAL['600'],
    TEXT: PRIMITIVE.SECONDARY.TEAL['700'],
    DARK: PRIMITIVE.SECONDARY.TEAL['800'],
    DARKEST: PRIMITIVE.SECONDARY.TEAL['900'],
  },
  
  // Gold colors
  GOLD: {
    LIGHTEST: PRIMITIVE.SECONDARY.GOLD['50'],
    LIGHTER: PRIMITIVE.SECONDARY.GOLD['100'],
    LIGHT: PRIMITIVE.SECONDARY.GOLD['300'],
    BASE: PRIMITIVE.SECONDARY.GOLD['500'],
    MEDIUM: PRIMITIVE.SECONDARY.GOLD['600'],
    TEXT: PRIMITIVE.SECONDARY.GOLD['700'],
    DARK: PRIMITIVE.SECONDARY.GOLD['800'],
    DARKEST: PRIMITIVE.SECONDARY.GOLD['900'],
  },
  
  // Grayscale
  GRAY: {
    LIGHTEST: PRIMITIVE.NEUTRAL['50'],
    LIGHTER: PRIMITIVE.NEUTRAL['100'],
    LIGHT: PRIMITIVE.NEUTRAL['200'],
    BASE: PRIMITIVE.NEUTRAL['400'],
    MEDIUM: PRIMITIVE.NEUTRAL['500'],
    TEXT: PRIMITIVE.NEUTRAL['700'],
    MUTED: PRIMITIVE.NEUTRAL['800'], // Light gray text from design
    DARK: PRIMITIVE.NEUTRAL['800'],
    DARKEST: PRIMITIVE.NEUTRAL['900'],
  },
  
  // Status colors
  STATUS: {
    SUCCESS: PRIMITIVE.FEEDBACK.SUCCESS,
    WARNING: PRIMITIVE.FEEDBACK.WARNING,
    ERROR: PRIMITIVE.FEEDBACK.ERROR,
    INFO: PRIMITIVE.FEEDBACK.INFO,
  },
} as const;

/**
 * UI-specific color usage
 */
export const UI_COLORS = {
  // Background colors
  BACKGROUND: {
    PAGE: PRIMITIVE.DARK.BACKGROUND,
    CARD: PRIMITIVE.DARK.CARD,
    CARD_ALT: PRIMITIVE.DARK.CARD_ALT,
    DARK: PRIMITIVE.DARK.BACKGROUND,
    LIGHT: PRIMITIVE.NEUTRAL['50'],
    PRIMARY: SEMANTIC.BLUE.BASE,
    SECONDARY: SEMANTIC.TEAL.BASE,
    PREMIUM: SEMANTIC.GOLD.BASE,
    GRAY: SEMANTIC.GRAY.LIGHTER,
    BUTTON: PRIMITIVE.DARK.BUTTON,
    OVERLAY: PRIMITIVE.DARK.OVERLAY,
  },
  
  // Text colors
  TEXT: {
    PRIMARY: PRIMITIVE.NEUTRAL.WHITE,
    SECONDARY: PRIMITIVE.NEUTRAL['800'], // Light gray from design
    TERTIARY: PRIMITIVE.NEUTRAL['700'],
    INVERSE: PRIMITIVE.NEUTRAL.WHITE,
    LINK: SEMANTIC.BLUE.BASE,
    MUTED: SEMANTIC.GRAY.MEDIUM,
    ERROR: PRIMITIVE.FEEDBACK.ERROR,
  },
  
  // Interactive element colors
  PRIMARY: {
    DEFAULT: SEMANTIC.BLUE.BASE,
    HOVER: SEMANTIC.BLUE.MEDIUM,
    PRESSED: SEMANTIC.BLUE.DARK,
    DISABLED: SEMANTIC.GRAY.LIGHT,
  },
  
  // Secondary actions
  SECONDARY: {
    DEFAULT: SEMANTIC.TEAL.BASE,
    HOVER: SEMANTIC.TEAL.MEDIUM,
    PRESSED: SEMANTIC.TEAL.DARK,
    DISABLED: SEMANTIC.GRAY.LIGHT,
  },
  
  // Premium/Gold elements
  PREMIUM: {
    DEFAULT: SEMANTIC.GOLD.BASE,
    HOVER: SEMANTIC.GOLD.MEDIUM,
    PRESSED: SEMANTIC.GOLD.DARK,
    DISABLED: SEMANTIC.GRAY.LIGHT,
  },
  
  // Accent colors for highlighting
  ACCENT: {
    LIGHT: SEMANTIC.BLUE.LIGHTER,
    DEFAULT: SEMANTIC.BLUE.BASE,
    DARK: SEMANTIC.BLUE.DARK,
  },
  
  // Status indicators
  STATUS: {
    SUCCESS: PRIMITIVE.FEEDBACK.SUCCESS,
    WARNING: PRIMITIVE.FEEDBACK.WARNING,
    ERROR: PRIMITIVE.FEEDBACK.ERROR,
    INFO: PRIMITIVE.FEEDBACK.INFO,
  },
  
  // Borders and separators
  BORDER: {
    DEFAULT: PRIMITIVE.DARK.OVERLAY,
    FOCUS: SEMANTIC.BLUE.BASE,
    ERROR: PRIMITIVE.FEEDBACK.ERROR,
  },

  // Navigation
  NAV: {
    ACTIVE: PRIMITIVE.NEUTRAL.WHITE,
    INACTIVE: PRIMITIVE.NEUTRAL['800'],
    BACKGROUND: PRIMITIVE.DARK.CARD,
  }
} as const;

/**
 * Figma token names for direct mapping
 */
export const COLOR_TOKENS = {
  // Primary blue
  '--p-blue-50': PRIMITIVE.PRIMARY['50'],
  '--p-blue-100': PRIMITIVE.PRIMARY['100'],
  '--p-blue-200': PRIMITIVE.PRIMARY['200'],
  '--p-blue-300': PRIMITIVE.PRIMARY['300'],
  '--p-blue-400': PRIMITIVE.PRIMARY['400'],
  '--p-blue-500': PRIMITIVE.PRIMARY['500'],
  '--p-blue-600': PRIMITIVE.PRIMARY['600'],
  '--p-blue-700': PRIMITIVE.PRIMARY['700'],
  '--p-blue-800': PRIMITIVE.PRIMARY['800'],
  '--p-blue-900': PRIMITIVE.PRIMARY['900'],
  
  // Figma specific tokens
  '--p-dark-background': PRIMITIVE.DARK.BACKGROUND,
  '--p-dark-card': PRIMITIVE.DARK.CARD,
  '--p-dark-card-alt': PRIMITIVE.DARK.CARD_ALT,
  '--p-dark-button': PRIMITIVE.DARK.BUTTON,
  '--p-dark-overlay': PRIMITIVE.DARK.OVERLAY,
  
  // Teal
  '--p-teal-50': PRIMITIVE.SECONDARY.TEAL['50'],
  '--p-teal-100': PRIMITIVE.SECONDARY.TEAL['100'],
  '--p-teal-200': PRIMITIVE.SECONDARY.TEAL['200'],
  '--p-teal-300': PRIMITIVE.SECONDARY.TEAL['300'],
  '--p-teal-400': PRIMITIVE.SECONDARY.TEAL['400'],
  '--p-teal-500': PRIMITIVE.SECONDARY.TEAL['500'],
  '--p-teal-600': PRIMITIVE.SECONDARY.TEAL['600'],
  '--p-teal-700': PRIMITIVE.SECONDARY.TEAL['700'],
  '--p-teal-800': PRIMITIVE.SECONDARY.TEAL['800'],
  '--p-teal-900': PRIMITIVE.SECONDARY.TEAL['900'],
  
  // Gold
  '--p-gold-50': PRIMITIVE.SECONDARY.GOLD['50'],
  '--p-gold-100': PRIMITIVE.SECONDARY.GOLD['100'],
  '--p-gold-200': PRIMITIVE.SECONDARY.GOLD['200'],
  '--p-gold-300': PRIMITIVE.SECONDARY.GOLD['300'],
  '--p-gold-400': PRIMITIVE.SECONDARY.GOLD['400'],
  '--p-gold-500': PRIMITIVE.SECONDARY.GOLD['500'],
  '--p-gold-600': PRIMITIVE.SECONDARY.GOLD['600'],
  '--p-gold-700': PRIMITIVE.SECONDARY.GOLD['700'],
  '--p-gold-800': PRIMITIVE.SECONDARY.GOLD['800'],
  '--p-gold-900': PRIMITIVE.SECONDARY.GOLD['900'],
  
  // Grayscale
  '--p-gray-50': PRIMITIVE.NEUTRAL['50'],
  '--p-gray-100': PRIMITIVE.NEUTRAL['100'],
  '--p-gray-200': PRIMITIVE.NEUTRAL['200'],
  '--p-gray-300': PRIMITIVE.NEUTRAL['300'],
  '--p-gray-400': PRIMITIVE.NEUTRAL['400'],
  '--p-gray-500': PRIMITIVE.NEUTRAL['500'],
  '--p-gray-600': PRIMITIVE.NEUTRAL['600'],
  '--p-gray-700': PRIMITIVE.NEUTRAL['700'],
  '--p-gray-800': PRIMITIVE.NEUTRAL['800'],
  '--p-gray-900': PRIMITIVE.NEUTRAL['900'],
  
  // Base colors
  '--p-white': PRIMITIVE.NEUTRAL.WHITE,
  '--p-black': PRIMITIVE.NEUTRAL.BLACK,
  
  // Status colors
  '--p-success': PRIMITIVE.FEEDBACK.SUCCESS,
  '--p-warning': PRIMITIVE.FEEDBACK.WARNING,
  '--p-error': PRIMITIVE.FEEDBACK.ERROR,
  '--p-info': PRIMITIVE.FEEDBACK.INFO,
} as const;

/**
 * Helper function to get a color by token path
 */
export const getColor = (path: string): string => {
  // Direct Figma token
  if (path.startsWith('--p-')) {
    return (COLOR_TOKENS as any)[path] || PRIMITIVE.NEUTRAL.BLACK;
  }
  
  // Nested path (e.g., "SEMANTIC.BLUE.BASE")
  const parts = path.split('.');
  let result: any = { PRIMITIVE, SEMANTIC, UI_COLORS, COLOR_TOKENS };
  
  for (const part of parts) {
    if (result && result[part]) {
      result = result[part];
    } else {
      return PRIMITIVE.NEUTRAL.BLACK; // Fallback
    }
  }
  
  return typeof result === 'string' ? result : PRIMITIVE.NEUTRAL.BLACK;
}; 