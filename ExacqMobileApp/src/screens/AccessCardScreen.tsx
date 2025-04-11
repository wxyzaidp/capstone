import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Platform } from 'react-native';
import { UI_COLORS } from '../design-system/colors';
import LoginBottomSheet from '../components/LoginBottomSheet';
import AccessCardTopBar from '../components/AccessCardTopBar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AccessCard from '../components/AccessCard';
import BottomSheet from '../components/BottomSheet';
import { SvgXml } from 'react-native-svg';
import { Asset } from 'expo-asset';

// Define the type for route params
type AccessCardParams = {
  cardId: string;
  name: string;
  role: string;
  cardIndex: number;
};

// Define route type
type AccessCardRouteProp = RouteProp<{ AccessCard: AccessCardParams }, 'AccessCard'>;

const { width, height } = Dimensions.get('window');

// Use the exact same background color as defined in the Stack.Screen options
const BACKGROUND_COLOR = '#131515';

// GIF assets to preload
const GIF_ASSETS = [
  require('../assets/gifs/tap_animation.gif'),
  require('../assets/gifs/twist_phone.gif'),
];

// Function to preload gif assets
const preloadGifs = async () => {
  try {
    const cacheAssets = GIF_ASSETS.map(asset => {
      if (Platform.OS === 'web') {
        return Asset.fromURI(Image.resolveAssetSource(asset).uri).downloadAsync();
      }
      return Asset.fromModule(asset).downloadAsync();
    });
    
    await Promise.all(cacheAssets);
    console.log('All GIFs preloaded successfully');
  } catch (error) {
    console.error('Error preloading GIFs:', error);
  }
};

// SVG for unselected checkbox
const unselectedCheckboxSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="0.5" width="15" height="15" rx="2.16667" stroke="#717C98"/>
</svg>
`;

// SVG for selected checkbox
const selectedCheckboxSvg = `
<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect y="1" width="16" height="16" rx="2" fill="#6FDCFA"/>
<rect x="0.5" y="1.5" width="15" height="15" rx="1.5" stroke="#464E61" stroke-opacity="0.35"/>
<path d="M6.5834 12.0715L3.7666 9.23867L4.6002 8.40507L6.5834 10.3723L11.4002 5.57227L12.2338 6.42187L6.5834 12.0715Z" fill="#131515"/>
</svg>
`;

const AccessCardScreen = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [showGestureSheet, setShowGestureSheet] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [gifsLoaded, setGifsLoaded] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<AccessCardRouteProp>();
  
  // Get card details from route params
  const { cardId, name, role, cardIndex } = route.params || { 
    cardId: '', 
    name: 'Unknown', 
    role: 'Guest',
    cardIndex: 0
  };

  // Preload GIFs when component mounts
  useEffect(() => {
    const loadAssets = async () => {
      await preloadGifs();
      setGifsLoaded(true);
    };
    
    loadAssets();
  }, []);

  // Show gesture sheet automatically when screen loads and GIFs are ready
  useEffect(() => {
    if (gifsLoaded) {
      // Short delay to ensure screen is fully loaded first
      const timer = setTimeout(() => {
        setShowGestureSheet(true);
      }, 500);
      
      // Clean up timer on unmount
      return () => clearTimeout(timer);
    }
  }, [gifsLoaded]);

  const handleLogin = (username: string, password: string) => {
    // Handle login logic here
    console.log('Login attempt:', { username, password });
  };

  const handleVerify = (otp: string) => {
    console.log('OTP Verified:', otp);
    // Here you would typically make an API call to verify the OTP
    // and handle the response accordingly
  };

  // Handle passcode setup
  const handlePasscodeSet = (passcode: string) => {
    console.log('Passcode set:', passcode);
    // Here you would store the passcode securely and navigate to the app's main screens
    navigation.goBack(); // Navigate back after passcode set
  };
  
  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = () => {
    setDontShowAgain(!dontShowAgain);
  };

  // Handle understand button press
  const handleUnderstand = () => {
    setShowGestureSheet(false);
    // Save the preference if "Don't show again" is checked
    if (dontShowAgain) {
      // Save to AsyncStorage or similar
      console.log('User opted to not show gesture guide again');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <AccessCardTopBar onBackPress={handleBackPress} />
      
      <View style={styles.contentContainer}>
        {/* Display the access card from homepage - using default size */}
        <View style={styles.cardContainer}>
          <AccessCard
            cardId={cardId}
            name={name}
            role={role}
            index={cardIndex}
            onPress={() => {}} // No action when card is pressed
            isInteractive={false} // Disable interaction
          />
        </View>
        
        {/* Tap Animation GIF */}
        <View style={styles.animationContainer}>
          <Image 
            source={require('../assets/gifs/tap_animation.gif')}
            style={styles.gifAnimation}
            resizeMode="contain"
          />
          <Text style={styles.readerText}>HOLD NEAR READER</Text>
        </View>
      </View>
      
      {/* Gesture Unlock Bottom Sheet */}
      <BottomSheet
        visible={showGestureSheet}
        onClose={() => setShowGestureSheet(false)}
        title="Unlock with a Twist"
        height={510}
      >
        <View style={styles.gestureSheetContent}>
          {/* Twist phone animation */}
          <View style={styles.twistAnimationContainer}>
            <Image 
              source={require('../assets/gifs/twist_phone.gif')}
              style={styles.twistAnimation}
              resizeMode="contain"
            />
          </View>
          
          {/* Information message */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Twist your phone near the reader to unlock instantly. No tapping needed.
            </Text>
          </View>
          
          {/* Don't show again checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={handleCheckboxToggle}>
              <SvgXml 
                xml={dontShowAgain ? selectedCheckboxSvg : unselectedCheckboxSvg} 
                width={24} 
                height={24} 
              />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Don't show this tip again</Text>
          </View>
          
          {/* I Understand button */}
          <TouchableOpacity 
            style={styles.understandButton}
            onPress={handleUnderstand}
          >
            <Text style={styles.understandButtonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
      
      {/* LoginBottomSheet with OTP verification flow */}
      <LoginBottomSheet
        visible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
        onLogin={handleLogin}
        onVerify={handleVerify}
        onPasscodeSet={handlePasscodeSet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20, // Exactly 20px away from the top bar
    justifyContent: 'flex-start', // Align content to the top
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    marginTop: 40, // Changed back to 40px spacing below the card
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gifAnimation: {
    width: 100, // Changed from 80px to 100px
    height: 100, // Changed from 80px to 100px
  },
  readerText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    lineHeight: 12, // 1.2em × 10px
    letterSpacing: 2.5, // 25% of font size
    textTransform: 'uppercase',
    color: '#B6BDCD',
    marginTop: 16,
  },
  gestureSheetContent: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 16,
    flex: 1,
  },
  twistAnimationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  twistAnimation: {
    width: 100,
    height: 100,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  infoText: {
    fontFamily: 'Outfit',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#B6BDCD',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
    alignSelf: 'center',
  },
  checkboxLabel: {
    fontFamily: 'Outfit',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16, // 1.333em
    color: '#B6BDCD',
  },
  understandButton: {
    width: 350,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT, // #6FDCFA
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Added 40px margin below the button
  },
  understandButtonText: {
    fontFamily: 'Outfit',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24, // 1.5em
    color: BACKGROUND_COLOR,
  },
});

export default AccessCardScreen; 