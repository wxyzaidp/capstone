import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { 
  UI_COLORS, 
  UI_TYPOGRAPHY, 
  UI_RADIUS,
  applyTypography 
} from '../design-system';

/**
 * Common styles that can be shared across components
 */
export const CommonStyles = StyleSheet.create({
  // Layout Styles
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Card Styles
  card: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderRadius: UI_RADIUS.CARD.DEFAULT,
    padding: 16,
    shadowColor: UI_COLORS.BORDER.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAlt: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD_ALT,
    borderRadius: UI_RADIUS.CARD.DEFAULT,
    padding: 16,
  },

  // Button Styles
  button: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    height: 56,
    borderRadius: UI_RADIUS.BUTTON.LARGE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    opacity: 0.5,
    height: 56,
    borderRadius: UI_RADIUS.BUTTON.LARGE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_LARGE, {
      color: UI_COLORS.BACKGROUND.PAGE,
    }),
  },
  buttonSmall: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    height: 40,
    borderRadius: UI_RADIUS.BUTTON.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonTextSmall: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_MEDIUM, {
      color: UI_COLORS.BACKGROUND.PAGE,
    }),
  },

  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: '#717C98',
    borderRadius: UI_RADIUS.INPUT.DEFAULT,
    height: 56,
    paddingHorizontal: 16,
    color: UI_COLORS.TEXT.PRIMARY,
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
  },
  inputFocused: {
    borderColor: UI_COLORS.PRIMARY.DEFAULT,
  },
  inputLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#B6BDCD',
    marginBottom: 4,
  },

  // Typography Styles
  title: {
    ...applyTypography(UI_TYPOGRAPHY.TITLE, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    marginBottom: 8,
  },
  subtitle: {
    ...applyTypography(UI_TYPOGRAPHY.SUBTITLE, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    marginBottom: 16,
  },
  sectionTitle: {
    ...applyTypography(UI_TYPOGRAPHY.SECTION_TITLE, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    marginBottom: 16,
  },
  bodyText: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
  },
  bodyTextSecondary: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
  },
  labelText: {
    ...applyTypography(UI_TYPOGRAPHY.LABEL_MEDIUM, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
  },
  captionText: {
    ...applyTypography(UI_TYPOGRAPHY.CAPTION, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
  },

  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderTopLeftRadius: UI_RADIUS.MODAL.DEFAULT,
    borderTopRightRadius: UI_RADIUS.MODAL.DEFAULT,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  dragBarContainer: {
    width: '100%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  dragBar: {
    width: 36,
    height: 4,
    backgroundColor: '#404759',
    borderRadius: 6,
  },

  // Utility Styles
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19, 21, 21, 0.95)',
    zIndex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: UI_COLORS.BORDER.DEFAULT,
    width: '100%',
    marginVertical: 16,
  },
  roundedImage: {
    borderRadius: UI_RADIUS.CARD.DEFAULT,
    overflow: 'hidden',
  },
  
  // Margin utility styles
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mb32: { marginBottom: 32 },
  mr4: { marginRight: 4 },
  mr8: { marginRight: 8 },
  mr16: { marginRight: 16 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  ml4: { marginLeft: 4 },
  ml8: { marginLeft: 8 },
  ml16: { marginLeft: 16 },
  
  // Padding utility styles
  p8: { padding: 8 },
  p16: { padding: 16 },
  ph16: { paddingHorizontal: 16 },
  pv16: { paddingVertical: 16 },
});

// Common style functions that take parameters
export const getElevation = (level: number = 1): ViewStyle => {
  const elevationValues = {
    1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    4: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    5: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
  };
  
  return elevationValues[level as keyof typeof elevationValues] || elevationValues[1];
};

// Helper for status-based colors
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  const statusColors = {
    success: UI_COLORS.STATUS.SUCCESS,
    warning: UI_COLORS.STATUS.WARNING,
    error: UI_COLORS.STATUS.ERROR,
    info: UI_COLORS.STATUS.INFO,
  };
  
  return statusColors[status];
};

export default CommonStyles; 