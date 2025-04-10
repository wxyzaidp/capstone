import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { 
  UI_TYPOGRAPHY, 
  applyTypography,
  UI_COLORS
} from '../design-system';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Rect, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import SimpleCard from './SimpleCard';
import { CommonStyles } from '../styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
// TODO: Create navigation types if not available
// import { RootStackParamList } from '../navigation/types';

// Card item interface
interface CardItem {
  id: string;
  userName: string;
  role?: string;
}

interface CardSliderProps {
  title?: string;
  cards: CardItem[];
  onCardPress?: (cardId: string) => void;
  onAddCardPress?: () => void;
}

// Get screen width for proper card sizing
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 0.58; // Credit card aspect ratio

// SVG Card Border Component with gradient border
const CardBorder: React.FC = () => (
  <Svg width="100%" height="100%" viewBox="0 0 375 217" style={styles.borderSvg}>
    <Defs>
      <SvgLinearGradient 
        id="borderGradient"
        x1="404"
        y1="155"
        x2="-60"
        y2="68"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0" stopColor="#64DCFA" />
        <Stop offset="0.41" stopColor="#64DCFA" stopOpacity="0" />
        <Stop offset="0.635" stopColor="#64DCFA" stopOpacity="0" />
        <Stop offset="0.84" stopColor="#64DCFA" />
        <Stop offset="0.87" stopColor="#FFFFFF" stopOpacity="0.72" />
        <Stop offset="0.9" stopColor="#64DCFA" stopOpacity="0.72" />
      </SvgLinearGradient>
    </Defs>
    
    {/* Border with gradient */}
    <Rect 
      x="1" 
      y="1" 
      width="98%" 
      height="98%" 
      rx="18.6" 
      stroke="url(#borderGradient)" 
      strokeWidth="1.5" 
      fill="transparent" 
    />
  </Svg>
);

// Placeholder card background (now using PNG)
const CardBackground: React.FC = () => (
  <View style={styles.backgroundImageContainer}>
    <Image
      source={require('../assets/Cards_1_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    />
  </View>
);

// Gradient Border Component
const GradientBorder = () => {
  return (
    <View style={styles.gradientBorderContainer}>
      <Svg height="100%" width="100%" style={styles.gradientBorder}>
        <Defs>
          <SvgLinearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="rgba(100, 220, 250, 0.6)" />
            <Stop offset="100%" stopColor="rgba(100, 220, 250, 0.2)" />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x="0.5"
          y="0.5"
          width="99%"
          height="99%"
          rx="19"
          ry="19"
          strokeWidth="1.5"
          stroke="url(#border-gradient)"
          fill="transparent"
          strokeDasharray="5,5"
        />
      </Svg>
    </View>
  );
};

const CardSlider: React.FC<CardSliderProps> = ({ 
  title, 
  cards,
  onCardPress,
  onAddCardPress
}) => {
  // If no cards provided, show sample cards with realistic data
  const displayCards = cards?.length > 0 ? cards : [
    {
      id: '1',
      userName: 'Jacob B',
      role: 'Guest'
    },
    {
      id: '2',
      userName: 'Sarah L',
      role: 'Employee'
    }
  ];

  const handleCardPress = (cardId: string) => {
    if (onCardPress) {
      onCardPress(cardId);
    }
  };

  return (
    <View style={styles.container}>
      {title && <Text style={[CommonStyles.subtitle, styles.title]}>{title}</Text>}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {displayCards.map((card, index) => (
          <TouchableOpacity 
            key={card.id} 
            style={styles.cardTouchable} 
            activeOpacity={0.8}
            onPress={() => handleCardPress(card.id)}
          >
            {/* Card Container */}
            <View style={styles.cardContainer}>
              {/* PNG Background */}
              <CardBackground />
              
              {/* Card border with gradient */}
              <CardBorder />
            </View>
          </TouchableOpacity>
        ))}

        {/* Add Card Button */}
        {onAddCardPress && (
          <TouchableOpacity 
            style={[styles.addCardButton, { marginLeft: cards.length > 0 ? 16 : 0 }]} 
            onPress={onAddCardPress}
          >
            <View style={[CommonStyles.centerContent, styles.addCardContent]}>
              <ExpoImage
                source={require('../assets/add-card-icon.png')}
                style={styles.addIcon}
                contentFit="contain"
                cachePolicy="memory"
              />
              <Text style={styles.addCardText}>Add Card</Text>
            </View>
            <GradientBorder />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Pagination indicators */}
      <View style={[CommonStyles.row, CommonStyles.centerContent, styles.pagination]}>
        {displayCards.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === 0 ? styles.paginationDotActive : {}
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 32, // Extra padding on the right for better UX
  },
  cardTouchable: {
    marginRight: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 19.58,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1B2024', // Fallback background color
    ...CommonStyles.shadow,
  },
  backgroundImageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    backgroundColor: '#1B2024', // Fallback color
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
  addCardButton: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 19.58,
    overflow: 'hidden',
    position: 'relative',
  },
  addCardContent: {
    flexDirection: 'row',
    height: '100%',
  },
  addIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  addCardText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: UI_COLORS.PRIMARY.DEFAULT,
  },
  pagination: {
    marginTop: 16,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gradientBorderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default CardSlider; 