import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { 
  UI_COLORS, 
  UI_TYPOGRAPHY,
  applyTypography,
  PRIMITIVE,
  UI_RADIUS
} from '../design-system';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Constants from 'expo-constants';

// Exact SVG Building Icon from the assets folder
const BuildingIcon = ({ size = 24, color = '#6FDCFA' }) => {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 40 36" fill="none">
      <Path
        d="M2 36C0.895431 36 0 35.1046 0 34V2C0 0.895431 0.895431 0 2 0H18C19.1046 0 20 0.895431 20 2V8H38C39.1046 8 40 8.89543 40 10V34C40 35.1046 39.1046 36 38 36H2ZM4 32H8V28H4V32ZM4 24H8V20H4V24ZM4 16H8V12H4V16ZM4 8H8V4H4V8ZM12 32H16V28H12V32ZM12 24H16V20H12V24ZM12 16H16V12H12V16ZM12 8H16V4H12V8ZM20 32H36V12H20V16H24V20H20V24H24V28H20V32ZM28 20V16H32V20H28ZM28 28V24H32V28H28Z"
        fill={color}
      />
    </Svg>
  );
};

// Exact SVG Notification Icon from the assets folder
const NotificationIcon = ({ size = 20, color = 'white' }) => {
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 32 40" fill="none">
      <Path
        d="M0 34V30H4V16C4 13.2333 4.83333 10.7747 6.5 8.624C8.16667 6.47467 10.3333 5.06667 13 4.4V3C13 2.16667 13.292 1.45867 13.876 0.876C14.4587 0.292 15.1667 0 16 0C16.8333 0 17.5413 0.292 18.124 0.876C18.708 1.45867 19 2.16667 19 3V4.4C21.6667 5.06667 23.8333 6.47467 25.5 8.624C27.1667 10.7747 28 13.2333 28 16V30H32V34H0ZM16 40C14.9 40 13.9587 39.6087 13.176 38.826C12.392 38.042 12 37.1 12 36H20C20 37.1 19.6087 38.042 18.826 38.826C18.042 39.6087 17.1 40 16 40ZM8 30H24V16C24 13.8 23.2167 11.9167 21.65 10.35C20.0833 8.78333 18.2 8 16 8C13.8 8 11.9167 8.78333 10.35 10.35C8.78333 11.9167 8 13.8 8 16V30Z"
        fill={color}
      />
    </Svg>
  );
};

// Custom Chevron Down Icon based on the SVG from assets
const ChevronDownIcon = ({ size = 12, color = 'white' }) => {
  const ratio = 13 / 20; // height/width ratio from the original SVG
  return (
    <Svg width={size} height={size * ratio} viewBox="0 0 20 13" fill="none">
      <Path
        d="M10 7.66667L17.6667 6.70241e-07L20 2.33333L10 12.3333L0 2.33333L2.33333 0L10 7.66667Z" 
        fill={color}
      />
    </Svg>
  );
};

interface TopBarProps {
  title: string;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
}

// Use the same dark background from Figma - #23262D
const TOPBAR_COLOR = UI_COLORS.BACKGROUND.CARD;

const TopBar = ({ 
  title, 
  onLocationPress, 
  onNotificationPress
}: TopBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.locationContainer}
          onPress={onLocationPress}
          activeOpacity={0.7}
        >
          <View style={styles.frameContent}>
            <View style={styles.iconButtonLeading}>
              <BuildingIcon size={24} color="#6FDCFA" />
            </View>
            <Text 
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>
          <ChevronDownIcon size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.iconButtonTrailing}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <NotificationIcon size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TOPBAR_COLOR,
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)', // stroke_Z3USFN
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12, // layout_5MQ1QS gap
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // layout_TAB8AY gap (4px)
  },
  frameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // layout_9O0FAA gap (12px)
  },
  iconButtonLeading: {
    padding: 8, // layout_1UC1VF padding
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...applyTypography(UI_TYPOGRAPHY.LABEL_LARGE, {
      color: '#FFFFFF', // fill_GL9REB
    }),
    fontFamily: 'Outfit',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24, // calculated from 1.333em × 18px
    maxWidth: 200, // Add max width to prevent very long titles from breaking layout
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8, // layout_GR8K69 gap
  },
  iconButtonTrailing: {
    padding: 8, // layout_1UC1VF padding
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});

export default TopBar; 