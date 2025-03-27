import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { 
  UI_COLORS, 
  UI_TYPOGRAPHY, 
  UI_RADIUS,
  applyTypography 
} from '../design-system';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  style?: ViewStyle;
}

const Card = ({ title, subtitle, children, style }: CardProps) => {
  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderRadius: UI_RADIUS.CARD,
    padding: 16,
    shadowColor: UI_COLORS.BORDER.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...applyTypography(UI_TYPOGRAPHY.CARD_TITLE, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    marginBottom: 4,
  },
  subtitle: {
    ...applyTypography(UI_TYPOGRAPHY.CARD_SUBTITLE, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    marginBottom: 12,
  },
  content: {
    marginTop: 8,
  },
});

export default Card; 