import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { 
  UI_TYPOGRAPHY, 
  applyTypography
} from '../design-system';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Rect, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Text } from 'react-native';

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
      {title && <Text style={styles.title}>{title}</Text>}
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
            style={styles.addCardContainer} 
            activeOpacity={0.8}
            onPress={onAddCardPress}
          >
            <LinearGradient
              colors={['#2F353E', '#23262D']}
              style={styles.addCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.addCardButton}>
                <Feather name="plus" size={36} color="#64DCFA" />
                <Text style={styles.addCardText}>Add Card</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Pagination indicators */}
      <View style={styles.pagination}>
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
    ...applyTypography(UI_TYPOGRAPHY.SUBTITLE),
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
  addCardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 19.58,
    overflow: 'hidden',
    position: 'relative',
  },
  addCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 220, 250, 0.3)',
    borderRadius: 19.58,
    borderStyle: 'dashed',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    fontFamily: 'Outfit',
    fontWeight: '500',
    fontSize: 14,
    color: '#64DCFA',
    marginLeft: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default CardSlider; 