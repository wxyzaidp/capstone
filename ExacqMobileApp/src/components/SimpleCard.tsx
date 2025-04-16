import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Rect, Path, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Image as ExpoImage } from 'expo-image';
import { Image as RNImage } from 'react-native';
import { UI_TYPOGRAPHY, applyTypography } from '../design-system';

// Define constants
const APP_HORIZONTAL_MARGIN = 16; // Standard margin for the app

interface SimpleCardProps {
  onPress?: () => void;
  name?: string;
  role?: string;
  index?: number; // Used for identification
}

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');
// Card dimensions from Figma design - using screen percentage for better responsiveness
const CARD_WIDTH = width - (APP_HORIZONTAL_MARGIN * 2); // Equal margins on both sides
const CARD_HEIGHT = CARD_WIDTH * 0.58; // Maintaining aspect ratio of original design
const BORDER_RADIUS = 19.58; // Exact border radius from Figma (19.580839157104492px)
const CARD_SPACING = 12; // Gap between cards from Figma

// Card background images
const backgroundImages = [
  require('../assets/Card_background.png'),
  require('../assets/Cards_2_bg.png'),
  require('../assets/Cards_3_bg.png'),
  require('../assets/Cards_4_bg.png'),
];

// Create a shuffled array of indices (0-3) that will be used to assign
// backgrounds to cards in a random but non-repeating way
// This is created when the module loads and will be different on each app reload
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Create a shuffled mapping of indices to backgrounds
// This is at module level, so it's created once on app load but is different on each reload
const backgroundIndices = shuffleArray([0, 1, 2, 3]);

// Role colors for different user types
const roleColors = {
  Guest: '#717C98', // Exact color from Figma
  Admin: '#B18AFF',
  Employee: '#73A7F2',
  Security: '#47CAD1',
};

// SVG gradient border component matching the Figma design exactly
const CardBorder = () => (
  <Svg width="100%" height="100%" style={styles.borderSvg}>
    <Defs>
      <SvgLinearGradient 
        id="borderGradient"
        x1="107.87%" y1="71.61%" 
        x2="-16.23%" y2="31.38%"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0" stopColor="#64DCFA" stopOpacity="1" />
        <Stop offset="0.41" stopColor="#64DCFA" stopOpacity="0" />
        <Stop offset="0.635" stopColor="#64DCFA" stopOpacity="0" />
        <Stop offset="0.84" stopColor="#64DCFA" stopOpacity="1" />
        <Stop offset="0.87" stopColor="#FFFFFF" stopOpacity="0.72" />
        <Stop offset="0.9" stopColor="#64DCFA" stopOpacity="0.72" />
      </SvgLinearGradient>
    </Defs>
    <Rect 
      x="0.5" 
      y="0.5" 
      width="99%" 
      height="99%" 
      rx={BORDER_RADIUS - 0.5}
      stroke="url(#borderGradient)" 
      strokeWidth="1.5" // Increased stroke width for better visibility
      fill="transparent"
    />
  </Svg>
);

// Exacq Logo Component
const ExacqLogo = ({ width = 38, height = 37 }) => (
  <Svg width={width} height={height} viewBox="0 0 38 37" fill="none">
    <Path d="M19.0688 18.5L11.1015 5.01694H5.58575L14.6255 18.5H19.0688Z" fill="#64DCFA"/>
    <Path d="M19.0688 18.5L27.0361 5.01694H32.5519L23.5121 18.5H19.0688Z" fill="#64DCFA"/>
    <Path d="M19.0688 18.5L11.1015 31.983H5.58575L14.6255 18.5H19.0688Z" fill="#64DCFA"/>
    <Path d="M19.0688 18.5L27.0361 31.983H32.5519L23.5121 18.5H19.0688Z" fill="#64DCFA"/>
  </Svg>
);

// Card Background with Image
const CardBackground = ({ imageIndex }: { imageIndex: number }) => (
  <View style={styles.backgroundImageContainer}>
    <ExpoImage
      source={backgroundImages[imageIndex]}
      style={styles.backgroundImage}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
  </View>
);

export default function SimpleCard({ onPress, name = "Jacob B", role = "Security", index = 0 }: SimpleCardProps) {
  // Get the background based on the card's index, using our shuffled mapping
  // This ensures each card gets a unique background, but the assignment changes on reload
  const backgroundIndex = backgroundIndices[index % backgroundIndices.length];
  const backgroundImage = backgroundImages[backgroundIndex];
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress}
      style={styles.touchable}
    >
      <View style={styles.card}>
        {/* Background Layer */}
        <CardBackground imageIndex={backgroundIndex} />
        
        {/* Border Layer */}
        <CardBorder />
        
        {/* Content Layer */}
        <View style={styles.contentContainer}>
          {/* Exacq Logo */}
          <View style={styles.logoContainer}>
            <ExacqLogo width={38} height={37} />
          </View>
          
          {/* User Details */}
          <View style={styles.footer}>
            <Text 
              style={styles.name}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <Text 
              style={styles.role}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {role}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    // Remove marginRight intended for horizontal scrollviews
    // marginRight: CARD_SPACING, 
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#1B2024', // Exact color from Figma
    position: 'relative',
    // Enhanced shadow values for better visibility
    shadowColor: 'rgba(35, 38, 45, 0.25)',
    shadowOffset: { width: 0, height: 3.5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  backgroundImageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  borderSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24, // Update padding to match Figma design (24px)
    justifyContent: 'space-between',
    zIndex: 20,
  },
  logoContainer: {
    alignItems: 'flex-start', // Position logo on the left
    marginTop: 4, // Add slight top margin
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align items at the bottom
    width: '100%',
  },
  name: {
    color: '#FFFFFF', // Pure white from Figma
    fontFamily: 'Outfit-Medium', // Use actual Outfit Medium font
    fontSize: 18,
    lineHeight: 24, // 1.33 * 18px = 24px
    flex: 2, // Give name more space in the row
    marginRight: 8, // Add space between name and role
  },
  role: {
    fontFamily: 'Outfit-Regular', // Use actual Outfit Regular font
    fontSize: 14,
    lineHeight: 20, // 1.43 * 14px = 20px
    color: '#717C98', // Use a single consistent color for all roles
    flex: 1, // Give role less space than name
    textAlign: 'right', // Align text to the right
  },
}); 