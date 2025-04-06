import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { 
  UI_COLORS, 
  UI_TYPOGRAPHY, 
  UI_RADIUS,
  PRIMITIVE_RADIUS,
  RADIUS,
  applyTypography 
} from '../../design-system';

const RadiusExample = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Radius Design System</Text>
      <Text style={styles.subtitle}>Consistent corner rounding for UI elements</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primitive Values</Text>
        <View style={styles.row}>
          {Object.entries(PRIMITIVE_RADIUS).map(([key, value]) => (
            <View key={key} style={styles.item}>
              <View 
                style={[
                  styles.box, 
                  { borderRadius: value }
                ]} 
              >
                <Text style={styles.boxText}>{value}px</Text>
              </View>
              <Text style={styles.label}>{key}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Semantic Naming</Text>
        <View style={styles.row}>
          {Object.entries(RADIUS).map(([key, value]) => (
            <View key={key} style={styles.item}>
              <View 
                style={[
                  styles.box, 
                  { borderRadius: value }
                ]} 
              >
                <Text style={styles.boxText}>{value}px</Text>
              </View>
              <Text style={styles.label}>{key}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>UI Component Examples</Text>
        <View style={styles.componentRow}>
          <View style={[styles.component, { borderRadius: UI_RADIUS.BUTTON }]}>
            <Text style={styles.componentText}>Button</Text>
          </View>
          <View style={[styles.component, { borderRadius: UI_RADIUS.CARD }]}>
            <Text style={styles.componentText}>Card</Text>
          </View>
          <View style={[styles.component, { borderRadius: UI_RADIUS.CHIP }]}>
            <Text style={styles.componentText}>Chip</Text>
          </View>
          <View style={[styles.component, { borderRadius: UI_RADIUS.AVATAR }]}>
            <Text style={styles.componentText}>Avatar</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    ...applyTypography(UI_TYPOGRAPHY.HEADING_2, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    marginBottom: 8,
  },
  subtitle: {
    ...applyTypography(UI_TYPOGRAPHY.SUBTITLE, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...applyTypography(UI_TYPOGRAPHY.SECTION_TITLE, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  item: {
    width: '25%',
    padding: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  box: {
    width: 64,
    height: 64,
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  boxText: {
    ...applyTypography(UI_TYPOGRAPHY.CARD_SUBTITLE, {
      color: UI_COLORS.TEXT.INVERSE,
    }),
  },
  label: {
    ...applyTypography(UI_TYPOGRAPHY.LABEL_SMALL, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    textAlign: 'center',
  },
  componentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  component: {
    width: '45%',
    height: 80,
    margin: 8,
    backgroundColor: UI_COLORS.SECONDARY.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  componentText: {
    ...applyTypography(UI_TYPOGRAPHY.CARD_TITLE, {
      color: UI_COLORS.TEXT.INVERSE,
    }),
  },
});

export default RadiusExample; 