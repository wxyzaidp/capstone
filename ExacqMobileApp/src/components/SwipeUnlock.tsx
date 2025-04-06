import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
  Vibration
} from 'react-native';
import AudioService from '../utils/AudioService';
import DoorIcon from './icons/DoorIcon';
import LockIcon from './icons/LockIcon';
import UnlockIcon from './icons/UnlockIcon';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

/**
 * Haptic feedback implementation
 * - Uses AudioService for consistent feedback
 */

// Function to play haptic feedback
const playHapticFeedback = (isUnlock = true) => {
  try {
    // Use centralized AudioService
    AudioService.playHapticFeedback(isUnlock ? 'UNLOCK' : 'LOCK');
  } catch (error) {
    console.log('Error playing haptic feedback:', error);
    // Fallback to direct vibration
    Vibration.vibrate(isUnlock ? [0, 40, 30, 40] : [0, 30, 30, 30]);
  }
};

// Function to play unlock sound
const playUnlockSound = async () => {
  try {
    console.log('Attempting to play unlock sound via AudioService');
    await AudioService.playUnlockSound();
  } catch (error) {
    console.error('Error playing unlock sound via AudioService:', error);
    // Fall back to extended vibration if sound fails
    Vibration.vibrate([0, 40, 30, 40, 30, 40]);
  }
};

// Function to play lock feedback
const playLockFeedback = async () => {
  try {
    console.log('Attempting to play lock sound via AudioService');
    await AudioService.playLockSound();
  } catch (error) {
    console.error('Error playing lock sound via AudioService:', error);
    // Fall back to extended vibration if sound fails
    Vibration.vibrate([0, 30, 20, 30, 20, 30]);
  }
};

// Exact dimensions from Figma
const CARD_WIDTH = 247; 
const CARD_PADDING = 24;
const SLIDER_TRACK_WIDTH = 199;
const SLIDER_TRACK_HEIGHT = 56;
const SLIDER_TRACK_PADDING = 2;
const SLIDER_ICON_SIZE = 24;
const THUMB_SIZE = SLIDER_TRACK_HEIGHT - (SLIDER_TRACK_PADDING * 2);
const SLIDER_THRESHOLD = SLIDER_TRACK_WIDTH - THUMB_SIZE - (SLIDER_TRACK_PADDING * 2);
const UNLOCK_DURATION = 60;
// Lower unlock threshold to make it easier to unlock (60% of the full distance)
const UNLOCK_THRESHOLD_PERCENTAGE = 0.6;

interface SwipeUnlockProps {
  onUnlock?: () => void;
  onLock?: () => void;
  doorName?: string;
  doorStatus?: 'Locked' | 'Unlocked';
  onSliderInteractionStart?: () => void;
  onSliderInteractionEnd?: () => void;
  doorId?: string;
  countdownDuration?: number;
  initialUnlocked?: boolean;
  onSwipe?: () => void;
}

const SwipeUnlock: React.FC<SwipeUnlockProps> = ({ 
  onUnlock, 
  onLock,
  doorName = 'Indy Office Dr #02',
  doorStatus = 'Locked',
  onSliderInteractionStart,
  onSliderInteractionEnd,
  doorId,
  countdownDuration,
  initialUnlocked,
  onSwipe
}) => {
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  const [unlocked, setUnlocked] = useState(initialUnlocked || false);
  const [countdown, setCountdown] = useState(countdownDuration || UNLOCK_DURATION);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isLocking, setIsLocking] = useState(false); // For handling the locking transition
  const lastInteractionTime = useRef(0);
  
  // Animation values
  const position = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const successTextOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const successWidth = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current; // For timer animation
  
  // Load sounds when component mounts
  useEffect(() => {
    // Initialize the AudioService
    AudioService.initialize().catch(error => 
      console.error('Failed to initialize AudioService in component mount:', error)
    );
    
    return () => {
      isMounted.current = false;
      
      // Cancel any ongoing vibration
      Vibration.cancel();
      
      // No need to manually unload sounds - AudioService handles cleanup
    };
  }, []);
  
  // Sync with external doorStatus prop
  useEffect(() => {
    if (doorStatus === 'Unlocked' && !unlocked) {
      handleSuccessfulUnlock(false); // Don't trigger the callback
    } else if (doorStatus === 'Locked' && unlocked) {
      setUnlocked(false);
      setCountdown(UNLOCK_DURATION);
      
      // Play lock feedback when door is locked externally
      playLockFeedback();
      
      // Reset slider position
      Animated.timing(position, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Reset success background width
      Animated.timing(successWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
      
      // Reset timer progress
      timerProgress.setValue(1);
    }
  }, [doorStatus]);
  
  // Countdown timer when door is unlocked
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (unlocked && countdown > 0) {
      // Reset timer progress to 1 when first unlocked
      if (countdown === UNLOCK_DURATION) {
        timerProgress.setValue(1);
      }
      
      interval = setInterval(() => {
        if (isMounted.current) {
          setCountdown(prev => prev - 1);
          
          // Update timer progress animation with smooth transitions
          const newProgress = (countdown - 1) / UNLOCK_DURATION;
          Animated.timing(timerProgress, {
            toValue: Math.max(0, newProgress),
            duration: 1200, // Increased from 950ms to 1200ms to make it slower
            useNativeDriver: false,
            easing: Easing.linear // Ensure consistent speed across the entire animation
          }).start();
        }
      }, 1000);
    } else if (countdown === 0 && unlocked) {
      // Auto-lock when countdown reaches zero
      // First set to locking state to handle transition
      if (isMounted.current) {
        setIsLocking(true);
        
        // Play lock feedback when auto-locking
        playLockFeedback();
        
        // Reset text opacity early to ensure it's visible when we switch views
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
        
        // Add a slight delay to show the timer at 0 for a moment
        setTimeout(() => {
          if (isMounted.current) {
            setUnlocked(false);
            setCountdown(UNLOCK_DURATION);
            setIsLocking(false);
            
            // Reset slider position with smoother animation
            Animated.spring(position, {
              toValue: 0,
              friction: 8,
              tension: 50,
              useNativeDriver: true
            }).start();
            
            // Reset success background width
            Animated.timing(successWidth, {
              toValue: 0,
              duration: 250,
              useNativeDriver: false
            }).start();
            
            // Reset timer progress
            timerProgress.setValue(1);
            
            // Call onLock to notify parent component
            if (onLock) onLock();
          }
        }, 500); // Short delay to see "0s" before resetting
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [unlocked, countdown, onLock]);

  // Debounced interaction start to prevent multiple quick triggers
  const handleInteractionStart = () => {
    const now = Date.now();
    // Prevent multiple rapid triggers with a small debounce
    if (now - lastInteractionTime.current < 100) return;
    
    lastInteractionTime.current = now;
    setIsInteracting(true);
    // Notify parent that slider interaction has started
    if (onSliderInteractionStart) onSliderInteractionStart();
  };
  
  // End interaction with debouncing
  const handleInteractionEnd = () => {
    // Small delay to ensure we don't end interaction prematurely
    setTimeout(() => {
      if (isMounted.current) {
        setIsInteracting(false);
        // Notify parent that slider interaction has ended
        if (onSliderInteractionEnd) onSliderInteractionEnd();
      }
    }, 50);
  };

  // Function to handle successful unlock
  const handleSuccessfulUnlock = (shouldNotify = true) => {
    if (!isMounted.current) return;
    
    // Use LayoutAnimation for smoother transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    setUnlocked(true);
    setCountdown(UNLOCK_DURATION);
    setIsLocking(false);
    
    // Play haptic feedback for unlock
    playHapticFeedback();
    
    // Play unlock sound
    playUnlockSound();
    
    // Reset timer progress to full
    timerProgress.setValue(1);
    
    // Animate thumb to end position with spring for more natural feel
    Animated.spring(position, {
      toValue: SLIDER_THRESHOLD,
      friction: 7,
      tension: 40,
      useNativeDriver: true
    }).start();
    
    // Animate success background with timing for smooth transition
    Animated.timing(successWidth, {
      toValue: SLIDER_TRACK_WIDTH,
      duration: 250,
      useNativeDriver: false
    }).start();
    
    // Only notify parent if this was triggered by user interaction
    if (shouldNotify && onUnlock) onUnlock();
  };

  // Function to handle unsuccessful unlock (reset) with improved animation
  const handleUnsuccessfulUnlock = () => {
    if (!isMounted.current) return;
    
    // Reset with spring animation for more natural feel
    Animated.spring(position, {
      toValue: 0,
      friction: 8,  // Higher friction for smoother return
      tension: 50,  // Higher tension for faster return
      useNativeDriver: true
    }).start();
    
    // Reset success background width
    Animated.timing(successWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start();
    
    // Restore text opacity with easing
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  // Handle the gesture finished - determine if door should unlock
  const handleFinishGesture = useCallback((_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    setIsInteracting(false);
    
    // Notify parent that slider interaction has ended
    if (onSliderInteractionEnd) onSliderInteractionEnd();
    
    const distance = gestureState.dx > 0 ? gestureState.dx : 0;
    console.log(`SwipeUnlock: Gesture finished at distance ${distance}. Threshold is ${UNLOCK_THRESHOLD_PERCENTAGE * SLIDER_THRESHOLD}px`);
    
    if (distance >= UNLOCK_THRESHOLD_PERCENTAGE * SLIDER_THRESHOLD) {
      // Successful unlock
      handleSuccessfulUnlock();
      
      // Call onSwipe callback if provided
      if (onSwipe) {
        onSwipe();
      }
    } else {
      // Failed unlock - return slider to start
      handleUnsuccessfulUnlock();
    }
  }, [onSliderInteractionEnd, handleSuccessfulUnlock, handleUnsuccessfulUnlock, onSwipe]);

  // Create improved panResponder for thumb with better tracking
  const thumbPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to horizontal gestures with some movement
      // More sensitive to start tracking (lower threshold)
      return !unlocked && Math.abs(gestureState.dx) > 1;
    },
    onPanResponderGrant: () => {
      handleInteractionStart();
      // Important for smooth animation - capture the current position
      position.extractOffset();
    },
    onPanResponderMove: (_, gestureState) => {
      if (unlocked) return;
      
      // Constrain within bounds, allowing only right movement (positive dx)
      const newPosition = Math.max(0, Math.min(gestureState.dx, SLIDER_THRESHOLD));
      position.setValue(newPosition);
      
      // Update text opacity smoothly
      const textOpacityValue = Math.max(0, 1 - (newPosition / (SLIDER_THRESHOLD * UNLOCK_THRESHOLD_PERCENTAGE)));
      textOpacity.setValue(textOpacityValue);
      
      // Update success background width proportionally
      const widthProgress = (newPosition / SLIDER_THRESHOLD) * SLIDER_TRACK_WIDTH;
      successWidth.setValue(widthProgress);
    },
    onPanResponderRelease: (_, gestureState) => {
      position.flattenOffset();
      
      if (unlocked) {
        handleInteractionEnd();
        return;
      }
      
      // Check if we've moved far enough for unlock
      // Use the lower threshold percentage for easier unlocking
      if (gestureState.dx > SLIDER_THRESHOLD * UNLOCK_THRESHOLD_PERCENTAGE) {
        handleSuccessfulUnlock();
        // Call onSwipe when unlocked successfully
        if (onSwipe) onSwipe();
      } else {
        handleUnsuccessfulUnlock();
      }
      
      handleInteractionEnd();
    },
    onPanResponderTerminate: () => {
      position.flattenOffset();
      
      if (!unlocked) {
        handleUnsuccessfulUnlock();
      }
      
      handleInteractionEnd();
    }
  });

  // PanResponder for the entire swipe button area
  const swipeAreaPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !unlocked,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to horizontal right swipes
      // More sensitive to start tracking
      return !unlocked && gestureState.dx > 1;
    },
    onPanResponderGrant: () => {
      handleInteractionStart();
      // Start tracking from current position
      position.extractOffset();
    },
    onPanResponderMove: (_, gestureState) => {
      if (unlocked) return;
      
      // Constrain within bounds
      const newPosition = Math.max(0, Math.min(gestureState.dx, SLIDER_THRESHOLD));
      position.setValue(newPosition);
      
      // Update text opacity
      const textOpacityValue = Math.max(0, 1 - (newPosition / (SLIDER_THRESHOLD * UNLOCK_THRESHOLD_PERCENTAGE)));
      textOpacity.setValue(textOpacityValue);
      
      // Update success background width
      const widthProgress = (newPosition / SLIDER_THRESHOLD) * SLIDER_TRACK_WIDTH;
      successWidth.setValue(widthProgress);
    },
    onPanResponderRelease: (_, gestureState) => {
      position.flattenOffset();
      
      if (unlocked) {
        handleInteractionEnd();
        return;
      }
      
      // Check if we've moved far enough for unlock
      // Use the lower threshold percentage for easier unlocking
      if (gestureState.dx > SLIDER_THRESHOLD * UNLOCK_THRESHOLD_PERCENTAGE) {
        handleSuccessfulUnlock();
        // Call onSwipe when unlocked successfully
        if (onSwipe) onSwipe();
      } else {
        handleUnsuccessfulUnlock();
      }
      
      handleInteractionEnd();
    },
    onPanResponderTerminate: () => {
      position.flattenOffset();
      
      if (!unlocked) {
        handleUnsuccessfulUnlock();
      }
      
      handleInteractionEnd();
    }
  });

  // Create a pan responder to block horizontal swipes in the bottom area
  const bottomAreaPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: () => {
      // Immediately notify parent to disable carousel scrolling
      if (onSliderInteractionStart) onSliderInteractionStart();
      return true;
    },
    onPanResponderMove: () => {
      // Just prevent all gestures in this area
      return true;
    },
    onPanResponderRelease: () => {
      // Re-enable carousel scrolling on release
      if (onSliderInteractionEnd) onSliderInteractionEnd();
    },
    onPanResponderTerminate: () => {
      // Also re-enable carousel scrolling on terminate
      if (onSliderInteractionEnd) onSliderInteractionEnd();
    }
  });

  // Calculate positions for the slider and blockers
  const sliderTop = 120; // Start position of the slider (after the top section)
  const sliderLeft = (CARD_WIDTH - SLIDER_TRACK_WIDTH) / 2;
  
  // Calculate the timer progress width directly
  // Simpler approach - just multiply the progress by the full width
  const timerProgressWidth = Animated.multiply(
    timerProgress,
    SLIDER_TRACK_WIDTH
  );
  
  return (
    <Animated.View 
      style={[
        styles.container
      ]}
    >
      {/* Card Content */}
      <View style={[
        styles.cardContainer,
        unlocked && styles.cardContainerUnlocked
      ]}>
        {/* Top part - Info only (RED AREA - allows carousel swiping) */}
        <View style={styles.cardTopSection}>
          {/* Door icon */}
          <View style={styles.iconContainer}>
            <DoorIcon 
              width={24} 
              height={24} 
              isOpen={unlocked} 
            />
          </View>
          
          {/* Door Info */}
          <View style={styles.doorInfoContainer}>
            <Text style={styles.doorName} numberOfLines={1} ellipsizeMode="tail">
              {doorName}
            </Text>
            <Text style={[
              styles.doorStatus, 
              unlocked && styles.doorStatusUnlocked
            ]}>
              {unlocked ? 'Unlocked' : doorStatus}
            </Text>
          </View>
        </View>
        
        {/* BLOCKERS - These prevent carousel swiping */}
        
        {/* Left margin blocker */}
        <View 
          style={[styles.leftMarginBlocker]}
          {...bottomAreaPanResponder.panHandlers}
        />
        
        {/* Right margin blocker */}
        <View 
          style={[styles.rightMarginBlocker]}
          {...bottomAreaPanResponder.panHandlers}
        />
        
        {/* Below slider blocker */}
        <View 
          style={[styles.belowSliderBlocker]}
          {...bottomAreaPanResponder.panHandlers}
        />
        
        {/* Bottom part - Swipe button container (BLUE AREA - no carousel swiping) */}
        <View style={styles.sliderArea}>
          {/* This view is specifically for the swipe button */}
          <View 
            style={styles.swipeButtonContainer}
            {...(unlocked ? {} : swipeAreaPanResponder.panHandlers)}
          >
            {/* Background */}
            <View style={[
              styles.swipeButtonBg,
              unlocked && styles.swipeButtonBgUnlocked,
              isInteracting && styles.swipeButtonBgActive
            ]} />
            
            {/* Different success background rendering based on unlock state */}
            {!unlocked ? (
              // During swipe action - simple width animation
              <Animated.View 
                style={[
                  styles.successBackground,
                  { width: successWidth }
                ]}
              />
            ) : (
              // When unlocked - use mask approach for timer
              <View style={styles.timerContainerMask}>
                {/* Green background with a controlled width */}
                <Animated.View 
                  style={[
                    styles.timerProgressBar,
                    { width: timerProgressWidth }
                  ]}
                />
              </View>
            )}
            
            {/* Border */}
            <View style={[
              styles.strokeBorder,
              unlocked && styles.strokeBorderUnlocked
            ]} />
            
            {/* Text */}
            <View style={styles.textAndIconContainer}>
              {!unlocked ? (
                <Animated.Text 
                  style={[
                    styles.swipeText,
                    { opacity: textOpacity }
                  ]}
                >
                  Swipe to Unlock
                </Animated.Text>
              ) : (
                <View style={styles.unlockTextContainer}>
                  <UnlockIcon width={24} height={24} color="#131515" />
                  <Text style={styles.unlockCountdownText}>
                    Locking in {countdown}s
                  </Text>
                </View>
              )}
            </View>
            
            {/* Thumb */}
            {!unlocked && (
              <Animated.View 
                style={[
                  styles.sliderThumb, 
                  { 
                    transform: [
                      { translateX: position }
                    ] 
                  },
                  isInteracting && styles.sliderThumbActive
                ]}
                {...thumbPanResponder.panHandlers}
              >
                <View style={styles.thumbIconContainer}>
                  <LockIcon width={SLIDER_ICON_SIZE} height={SLIDER_ICON_SIZE} />
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    position: 'relative',
  },
  cardContainer: {
    backgroundColor: '#23262D',
    borderRadius: 12,
    width: '100%',
    overflow: 'hidden',
    padding: CARD_PADDING,
    zIndex: 1,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent', // Transparent border by default
  },
  cardContainerUnlocked: {
    borderColor: '#C3FF79', // Green border when unlocked
  },
  cardTopSection: {
    marginBottom: 24,
    height: 96, // Explicit height to help with top section
  },
  // Left margin blocker - prevent carousel swipes on the left side of bottom area
  leftMarginBlocker: {
    position: 'absolute',
    top: 120, // Start after top section
    left: 0,
    width: (CARD_WIDTH - SLIDER_TRACK_WIDTH) / 2, // Width of left margin
    height: SLIDER_TRACK_HEIGHT, // Same height as slider
    zIndex: 10,
    // For debugging - remove in production
    // backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  // Right margin blocker - prevent carousel swipes on the right side of bottom area
  rightMarginBlocker: {
    position: 'absolute',
    top: 120, // Start after top section
    right: 0,
    width: (CARD_WIDTH - SLIDER_TRACK_WIDTH) / 2, // Width of right margin
    height: SLIDER_TRACK_HEIGHT, // Same height as slider
    zIndex: 10,
    // For debugging - remove in production
    // backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  // Below slider blocker - prevent carousel swipes below the slider
  belowSliderBlocker: {
    position: 'absolute',
    top: 120 + SLIDER_TRACK_HEIGHT, // Start below slider
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    // For debugging - remove in production
    // backgroundColor: 'rgba(0, 0, 255, 0.2)',
  },
  iconContainer: {
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginBottom: 16,
  },
  doorInfoContainer: {
    gap: 4,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 4,
  },
  doorName: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  doorStatus: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#B6BDCD',
    textAlign: 'left',
  },
  doorStatusUnlocked: {
    color: '#C3FF79',
  },
  sliderArea: {
    alignItems: 'center',
    width: '100%',
    zIndex: 15, // Higher than the blocker to ensure slider is interactive
    position: 'relative',
  },
  swipeButtonContainer: {
    width: SLIDER_TRACK_WIDTH,
    height: SLIDER_TRACK_HEIGHT,
    position: 'relative',
  },
  swipeButtonBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(46, 51, 61, 0.35)',
    borderRadius: 10,
    padding: SLIDER_TRACK_PADDING,
  },
  swipeButtonBgUnlocked: {
    backgroundColor: 'rgba(195, 255, 121, 0.35)',
  },
  swipeButtonBgActive: {
    backgroundColor: 'rgba(52, 58, 70, 0.5)', // Slightly lighter when active
  },
  successBackground: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#C3FF79',
    borderRadius: 10,
    left: 0,
    top: 0,
    zIndex: 1,
  },
  // Timer container that uses a mask approach
  timerContainerMask: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    zIndex: 1,
  },
  // Timer progress bar with square edges
  timerProgressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#C3FF79',
    borderRadius: 0, // Remove rounded corners from the progress bar itself
    left: 0,
    top: 0,
  },
  textAndIconContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, // Above all blockers and slider elements
  },
  unlockTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  swipeText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#717C98',
    textAlign: 'center',
    marginLeft: THUMB_SIZE + 8, // Position text after the thumb with a small buffer
    width: SLIDER_TRACK_WIDTH - (THUMB_SIZE + 16), // Constrain width to available space
  },
  unlockCountdownText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#131515',
    textAlign: 'center',
  },
  strokeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: 'rgba(70, 78, 97, 0.35)',
    borderRadius: 10,
    zIndex: 3,
  },
  strokeBorderUnlocked: {
    borderColor: 'rgba(195, 255, 121, 0.35)',
    borderRadius: 12,
  },
  sliderThumb: {
    position: 'absolute',
    left: SLIDER_TRACK_PADDING,
    top: SLIDER_TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: '#1E2021',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25, // Highest z-index to ensure thumb is always interactive
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderThumbActive: {
    shadowOpacity: 0.4, // Increase shadow when active
    shadowRadius: 4,
    elevation: 4,
  },
  thumbIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeUnlock; 