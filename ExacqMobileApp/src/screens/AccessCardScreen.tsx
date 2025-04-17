import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Platform, Modal, Animated, TouchableWithoutFeedback, StatusBar, PanResponder } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { UI_COLORS } from '../design-system/colors';
import LoginBottomSheet from '../components/LoginBottomSheet';
import AccessCardTopBar from '../components/AccessCardTopBar';
import { useNavigation, useRoute, RouteProp, ParamListBase, NavigationProp } from '@react-navigation/native';
import SimpleCard from '../components/SimpleCard';
import { SvgXml } from 'react-native-svg';
import Toast from '../components/Toast';

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

// Define the server URL (use localhost for simulator/emulator, IP for physical device)
const SERVER_URL = 'https://exacq-server-263977944028.us-central1.run.app'; // Changed from localhost

// Define thresholds and tolerances for gesture detection
const SENSOR_UPDATE_INTERVAL = 160; // ms
// Thresholds for Portrait -> Landscape -> Portrait detection
const LANDSCAPE_GAMMA_THRESHOLD = 65; // Degrees away from 0 to be considered landscape
const PORTRAIT_GAMMA_TOLERANCE = 25; // Degrees close to 0 to be considered portrait
const STABLE_BETA_THRESHOLD = 60;  // Beta should be reasonably upright

type OrientationGestureState = 'idle' | 'seeking_landscape' | 'seeking_portrait' | 'triggered';

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
  
  // --- Sensor and Gesture State ---
  const [deviceMotionData, setDeviceMotionData] = useState<DeviceMotionMeasurement | null>(null);
  const latestGammaRef = useRef<number>(0);
  const latestBetaRef = useRef<number>(0);
  const [startGamma, setStartGamma] = useState<number | null>(null);
  const [gestureState, setGestureState] = useState<OrientationGestureState>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const _subscription = useRef<ReturnType<typeof DeviceMotion.addListener> | null>(null);
  // ---------------------------------

  // PanResponder Logic (adjust spring animation values)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Log when this might become the responder
        console.log('[PanResponder] onStartShouldSetPanResponder called');
        return true; // Keep original logic
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture vertical swipes
        const isVerticalSwipe = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
        if (isVerticalSwipe) {
          console.log('[PanResponder] onMoveShouldSetPanResponder returning TRUE (vertical swipe)');
        }
        return isVerticalSwipe;
      },
      onPanResponderGrant: () => {
        console.log('[PanResponder] Granted (bottom sheet drag started)');
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

  // Function to communicate door status to the server
  const setDoorStatus = useCallback(async (shouldBeOpen: boolean) => {
    console.log(`[Network] Attempting to set door status to: ${shouldBeOpen}`);
    if (shouldBeOpen) {
        setToastMessage("Door opened successfully!");
    }
    try {
      const response = await fetch(`${SERVER_URL}/set-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: shouldBeOpen }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const result = await response.json();
      console.log('[Network] Server response:', result);
    } catch (error) {
      console.error('[Network] Failed to set door status:', error);
      setToastMessage("Error communicating with door");
    }
  }, []);

  // Reset door status on mount and unmount
  useEffect(() => {
    console.log('[Lifecycle] AccessCardScreen mounted, ensuring door is closed.');
    setDoorStatus(false);
    return () => {
      console.log('[Lifecycle] AccessCardScreen unmounted, ensuring door is closed.');
      setDoorStatus(false);
    };
  }, [setDoorStatus]);

  // Subscribe to DeviceMotion and update Refs
  useEffect(() => {
    let isMounted = true;
    const subscribe = async () => {
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (!isAvailable) {
        console.warn('[Sensor] Device Motion sensor is not available on this device.');
        return;
      }
      // Permissions are usually not needed for DeviceMotion, but check if required
      // await DeviceMotion.requestPermissionsAsync(); 
      console.log('[Sensor] Subscribing to Device Motion updates...');
      DeviceMotion.setUpdateInterval(SENSOR_UPDATE_INTERVAL); // Keep update interval
      _subscription.current = DeviceMotion.addListener(data => {
          if (isMounted && data && data.rotation) {
              // Update refs directly - NO STATE UPDATE HERE
              const { beta, gamma } = data.rotation;
              if (gamma !== null && gamma !== undefined) {
                  latestGammaRef.current = gamma * (180 / Math.PI); // Convert and store degrees
              }
              if (beta !== null && beta !== undefined) {
                  latestBetaRef.current = beta * (180 / Math.PI); // Convert and store degrees
              }
          }
      });
    };
    subscribe();
    return () => { // Unsubscribe logic remains the same
        isMounted = false;
        console.log('[Sensor] Unsubscribing from Device Motion updates.');
        _subscription.current && _subscription.current.remove();
        _subscription.current = null;
    };
  }, []); // Empty dependency array - runs once on mount

  // Process Sensor Data periodically using an Interval
  useEffect(() => {
    console.log('[Processor] Setting up gesture processing interval.');
    const intervalId = setInterval(() => {
        // Read latest values from refs
        const currentGamma = latestGammaRef.current;
        const currentBeta = latestBetaRef.current;
        
        // Read current state values (safe inside interval)
        const currentGestureState = gestureState;
        const currentStartGamma = startGamma;

        // --- State Machine Logic (using current values and ref values) ---
        // Log current values for debugging the interval
        console.log(`[Processor] Interval Check: beta: ${currentBeta.toFixed(1)}, gamma: ${currentGamma.toFixed(1)}, state: ${currentGestureState}`);

        switch (currentGestureState) {
            case 'idle':
                if (Math.abs(currentGamma) < PORTRAIT_GAMMA_TOLERANCE && Math.abs(currentBeta) > STABLE_BETA_THRESHOLD) {
                    console.log(`[Processor] Setting startGamma: ${currentGamma.toFixed(1)} (Initial Portrait - beta: ${currentBeta.toFixed(1)})`);
                    setStartGamma(currentGamma);
                    setGestureState('seeking_landscape');
                }
                break;

            case 'seeking_landscape':
                if (Math.abs(currentGamma) > LANDSCAPE_GAMMA_THRESHOLD) {
                    console.log(`[Processor] State change: seeking_landscape -> seeking_portrait (Reached Landscape - gamma: ${currentGamma.toFixed(1)})`);
                    setGestureState('seeking_portrait');
                }
                else if (Math.abs(currentGamma) < PORTRAIT_GAMMA_TOLERANCE) {
                    console.log(`[Processor] Resetting: Returned to portrait prematurely (gamma: ${currentGamma.toFixed(1)})`);
                    setGestureState('idle');
                    setStartGamma(null);
                }
                break;

            case 'seeking_portrait':
                 if (Math.abs(currentGamma) < PORTRAIT_GAMMA_TOLERANCE && Math.abs(currentBeta) > STABLE_BETA_THRESHOLD) {
                    console.log(`[Processor] State change: seeking_portrait -> triggered (Returned Portrait - gamma: ${currentGamma.toFixed(1)}, beta: ${currentBeta.toFixed(1)})`);
                    console.log('[Door] !!! TRIGGERING DOOR OPEN !!!');
                    setGestureState('triggered');
                    setDoorStatus(true); 
                    
                    setTimeout(() => {
                        console.log('[Processor] Resetting gesture state to idle after trigger.');
                        setStartGamma(null);
                        setGestureState('idle');
                        setDoorStatus(false); 
                    }, 60000); // Increased timeout to 60 seconds
                }
                break;

            case 'triggered':
                break;
        }
    }, SENSOR_UPDATE_INTERVAL); // Run processing logic at same frequency as sensor updates (or slightly less often)

    // Cleanup interval on unmount or when dependencies change (if any)
    return () => {
        console.log('[Processor] Clearing gesture processing interval.');
        clearInterval(intervalId);
    };
  // Re-run this effect if these state setters/values change - ensures interval callback closure has fresh values
  // Note: Including state setters in dependency arrays is generally safe.
  }, [gestureState, startGamma, setDoorStatus]); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />
      
      {/* Top Bar */}
      <AccessCardTopBar onBackPress={handleBackPress} />
      
      {/* Content Area - No longer needs RotationGestureHandler */}
      <View style={styles.contentContainer}>
          {/* Card display - No longer needs Animated.View or rotation style */} 
          <View style={styles.centeringCardContainer}>
            <SimpleCard
              key={cardId}
              name={name}
              role={role}
              index={cardIndex}
              onPress={() => console.log('[SimpleCard] onPress triggered')} // Keep SimpleCard log
            />
          </View>
          
          <View style={styles.animationContainer}>
            <Image source={require('../../assets/Tap_animation.gif')} style={styles.gifAnimation} resizeMode="contain" />
            <Text style={styles.readerText}>HOLD NEAR READER</Text>
          </View>
      </View>
      
      {/* Custom Gesture Unlock Bottom Sheet - Restoring */}
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
        <TouchableWithoutFeedback onPress={() => { 
           Animated.spring(panY, {
            toValue: height,
            tension: 50, // Slightly lower tension
            friction: 15, // Higher friction for smoother stop
            useNativeDriver: true,
          }).start(() => setGestureSheetVisible(false));
        }}>
          <Animated.View style={[styles.overlay, { opacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[
            styles.bottomSheet, 
            { transform: [{ translateY: panY }] } 
          ]}
          {...panResponder.panHandlers} 
        >
          <View style={styles.handleContainer} >
              <View style={styles.handle} />
          </View>
          
          <TouchableWithoutFeedback>
            <View style={{flex: 1}}> 
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Unlock with a Twist</Text>
              </View>
              
              <View style={styles.gestureSheetContent}>
                <View style={styles.twistAnimationContainer}>
                  <Image 
                    source={require('../../assets/Twist_Phone.gif')}
                    style={styles.twistAnimation}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    Twist your phone near the reader to unlock instantly. No tapping needed.
                  </Text>
                </View>
                
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

      {/* Add Toast Component */}
      <Toast 
        visible={!!toastMessage} 
        message={toastMessage || ''} 
        onDismiss={() => setToastMessage(null)}
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