import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Platform, Modal, Animated, TouchableWithoutFeedback, StatusBar, PanResponder } from 'react-native';
import { UI_COLORS } from '../design-system/colors';
import LoginBottomSheet from '../components/LoginBottomSheet';
import AccessCardTopBar from '../components/AccessCardTopBar';
import { useNavigation, useRoute, RouteProp, ParamListBase, NavigationProp } from '@react-navigation/native';
import SimpleCard from '../components/SimpleCard';
import { SvgXml } from 'react-native-svg';

// Define the type for route params
type AccessCardParams = {
  cardId: string;
  name: string;
  role: string;
  cardIndex: number;
};

// Define route type
type AccessCardRouteProp = RouteProp<{ AccessCard: AccessCardParams }, 'AccessCard'>;

// Define navigation type
type AccessCardNavigationProp = NavigationProp<ParamListBase>;

const { width, height } = Dimensions.get('window');

// Use the exact same background color as defined in the Stack.Screen options
const BACKGROUND_COLOR = '#131515';

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
  const navigation = useNavigation<AccessCardNavigationProp>();
  const route = useRoute<AccessCardRouteProp>();
  
  // Animation values for gesture bottom sheet
  const [gestureSheetVisible, setGestureSheetVisible] = useState(false);
  const panY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Get card details from route params
  const { cardId, name, role, cardIndex } = route.params || { 
    cardId: '', 
    name: 'Unknown', 
    role: 'Guest',
    cardIndex: 0
  };
  
  // PanResponder Logic (adjust spring animation values)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        // Use extractOffset to properly handle subsequent drags
        panY.extractOffset();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Follow the finger vertically, but don't allow dragging upwards past the initial position
        panY.setValue(Math.max(0, gestureState.dy));
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Flatten the offset so the animation starts from the release point
        panY.flattenOffset();
        const threshold = 150; // Drag distance threshold to close
        const velocityThreshold = 0.3; // Velocity threshold to close

        if (
          gestureState.dy > threshold ||
          (gestureState.vy > velocityThreshold && gestureState.dy > 0) // Check for downward flick
        ) {
          // Close animation - Adjust spring values
          Animated.spring(panY, {
            toValue: height,
            tension: 50, // Slightly lower tension
            friction: 15, // Higher friction for smoother stop
            useNativeDriver: true,
          }).start(() => {
            setGestureSheetVisible(false);
            panY.setValue(height); 
          });
        } else {
          // Snap back animation - Adjust spring values
          Animated.spring(panY, {
            toValue: 0,
            tension: 50, // Slightly lower tension
            friction: 15, // Higher friction for smoother stop
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Show gesture sheet automatically when screen loads
  useEffect(() => {
    // Short delay to ensure screen is fully loaded first
    const timer = setTimeout(() => {
      setGestureSheetVisible(true);
    }, 500);
    
    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, []);
  
  // Animate gesture bottom sheet opening and closing
  useEffect(() => {
    if (gestureSheetVisible) {
      // Reset panY before opening animation
      panY.setValue(0); 
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          tension: 50, // Slightly lower tension
          friction: 15, // Higher friction for smoother stop
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.85, // Target opacity for overlay
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Closing animation is handled by PanResponder or Understand button
      // Ensure opacity fades out if closed without gesture (e.g., button press)
       Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
       }).start();
    }
  }, [gestureSheetVisible]); // Removed panY, opacity from dependencies as they are refs

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

  // Handle understand button press - trigger close animation
  const handleUnderstand = () => {
     Animated.parallel([
        Animated.spring(panY, { 
            toValue: height,
            tension: 50, // Slightly lower tension
            friction: 15, // Higher friction for smoother stop
            useNativeDriver: true,
        }),
        Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }),
      ]).start(() => {
        setGestureSheetVisible(false);
        panY.setValue(height); 
        if (dontShowAgain) {
          console.log('User opted to not show gesture guide again');
        }
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />
      
      {/* Top Bar */}
      <AccessCardTopBar onBackPress={handleBackPress} />
      
      <View style={styles.contentContainer}>
        {/* Re-add wrapper View specifically for centering the card */}
        <View style={styles.centeringCardContainer}>
          <SimpleCard
            key={cardId}
            name={name}
            role={role}
            index={cardIndex}
            onPress={() => {}}
          />
        </View>
        
        {/* Tap Animation GIF */}
        <View style={styles.animationContainer}>
          <Image 
            source={require('../../assets/Tap_animation.gif')}
            style={styles.gifAnimation}
            resizeMode="contain"
          />
          <Text style={styles.readerText}>HOLD NEAR READER</Text>
        </View>
        
        {/* Login Button removed */}
      </View>
      
      {/* Custom Gesture Unlock Bottom Sheet */}
      <Modal
        transparent
        visible={gestureSheetVisible}
        animationType="none"
        onRequestClose={() => { 
          // Trigger close animation on hardware back button press
          Animated.spring(panY, {
            toValue: height,
            tension: 50, // Slightly lower tension
            friction: 15, // Higher friction for smoother stop
            useNativeDriver: true,
          }).start(() => setGestureSheetVisible(false));
        }}
      >
        {/* Overlay - Separate Touchable for closing on background tap */}
        <TouchableWithoutFeedback onPress={() => { 
          // Trigger close animation on overlay press
           Animated.spring(panY, {
            toValue: height,
            tension: 50, // Slightly lower tension
            friction: 15, // Higher friction for smoother stop
            useNativeDriver: true,
          }).start(() => setGestureSheetVisible(false));
        }}>
           {/* Apply animated opacity ONLY to the overlay */}
          <Animated.View style={[styles.overlay, { opacity }]} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet - Sibling to Overlay */}
        <Animated.View 
          style={[
            styles.bottomSheet, 
            { transform: [{ translateY: panY }] } // Use panY for transform
          ]}
          {...panResponder.panHandlers} // Attach pan handlers
        >
          {/* Handle is part of the draggable sheet */}
          <View style={styles.handleContainer} >
              <View style={styles.handle} />
          </View>
          
          {/* Inner content wrapper - Prevents touches inside content from propagating to overlay touchable */}
          <TouchableWithoutFeedback>
            <View style={{flex: 1}}> 
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Unlock with a Twist</Text>
              </View>
              
              <View style={styles.gestureSheetContent}>
                {/* Twist phone animation */}
                <View style={styles.twistAnimationContainer}>
                  <Image 
                    source={require('../../assets/Twist_Phone.gif')}
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
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </Modal>
      
      {/* LoginBottomSheet - kept for future use but not displayed */}
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
    paddingTop: 20, // Exactly 20px away from the top bar
    justifyContent: 'flex-start', // Align content to the top
  },
  // Add back a container specifically for centering the card
  centeringCardContainer: {
    width: '100%', // Take full width to allow centering within it
    alignItems: 'center', // Center the SimpleCard child
    paddingHorizontal: 16, // Add padding to enforce side gaps
    marginBottom: 40, // Add margin below the card container before the animation
  },
  animationContainer: {
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Use standard semi-transparent overlay
    zIndex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 510,
    backgroundColor: '#23262D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25, // Increased shadow opacity
    shadowRadius: 16,
    elevation: 24,
  },
  handleContainer: {
    width: '100%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#404759',
    borderRadius: 6,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  bottomSheetTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
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