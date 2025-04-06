import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
  Easing,
  Vibration,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LockIcon, UnlockIcon } from './icons/DoorIcons';
import ChevronIcon from './icons/ChevronIcon';
import AudioService from '../utils/AudioService';
import * as Haptics from 'expo-haptics';
import DoorTimerService from '../services/DoorTimerService';

// Constants for dimensions
const BUTTON_WIDTH = 126;
const BUTTON_HEIGHT = 36;
const THUMB_SIZE = 32;
const BORDER_WIDTH = 2;
const MAX_SLIDE = BUTTON_WIDTH - THUMB_SIZE - BORDER_WIDTH;
const SLIDE_THRESHOLD = MAX_SLIDE * 0.6;

// Colors
const COLORS = {
  CONTAINER_BG: 'rgba(46, 51, 61, 0.35)',
  CONTAINER_BORDER: 'rgba(70, 78, 97, 0.35)',
  INDICATOR_BG: '#404759',
  ICON_COLOR: '#FFFFFF',
  CHEVRON_COLOR: '#404759',
  SUCCESS_BG: '#C3FF79',
  SUCCESS_BORDER: 'rgba(195, 255, 121, 0.35)',
  TEXT_COLOR: '#131515',
  SUCCESS_BG_DARKER: 'rgba(116, 153, 49, 1)',
};

// Vibration patterns
const hapticPatterns = {
  UNLOCK: Platform.OS === 'android' ? [0, 20, 40, 20] : [0, 50],
  LOCK: Platform.OS === 'android' ? [0, 30, 50, 30] : [0, 50, 0, 50],
};

// Haptic feedback function
const playHaptic = (pattern: 'UNLOCK' | 'LOCK') => {
  try {
    AudioService.playHapticFeedback(pattern);
  } catch (error) {
    console.log(`Error playing haptic feedback:`, error);
    // Fallback to direct vibration
    Vibration.vibrate(hapticPatterns[pattern]);
  }
};

// Create a static global store for persisting timer state across component instances
// This is keyed by doorId to avoid conflicts between doors
const timerStateStore: {
  [doorId: string]: {
    remainingTime: number;
    isActive: boolean;
    lastUpdated: number;
  }
} = {};

// Component props
interface IsolatedSwipeButtonProps {
  doorId: string;  // Add door ID for debugging
  onSwipe: () => void;
  onLock?: () => void;
  initialUnlocked?: boolean;
  countdownDuration?: number;
}

const IsolatedSwipeButton: React.FC<IsolatedSwipeButtonProps> = ({
  doorId,
  onSwipe,
  onLock,
  initialUnlocked = false,
  countdownDuration = 60,
}) => {
  console.log(`[ISB:${doorId}] Rendering button with initialUnlocked=${initialUnlocked}`);
  
  // Generate a unique instance ID for this component
  const instanceId = useRef(`swipe-button-${doorId}-${Math.random().toString(36).substring(2, 9)}`);
  
  // Track if component is mounted - SINGLE DECLARATION
  const isMountedRef = useRef(true);
  
  // Track the initial state to detect changes
  const initialStateRef = useRef(initialUnlocked);
  
  // State hooks for component state - DIRECTLY CHECK DOORTIMER SERVICE
  const [isUnlocked, setIsUnlocked] = useState(() => {
    // Initialize from DoorTimerService if possible
    const serviceStatus = doorId ? DoorTimerService.isDoorUnlocked(doorId) : initialUnlocked;
    console.log(`[BUTTON:${instanceId.current}] Initializing isUnlocked state to ${serviceStatus} (from service=${doorId ? 'true' : 'false'})`);
    return serviceStatus;
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(() => {
    // Initialize countdown from service if door is unlocked
    if (doorId && DoorTimerService.isDoorUnlocked(doorId)) {
      return DoorTimerService.getRemainingUnlockTime(doorId);
    }
    return countdownDuration;
  });
  
  const [sliderPosition, setSliderPosition] = useState(isUnlocked ? MAX_SLIDE : 0);
  const [progressWidth, setProgressWidth] = useState(isUnlocked ? BUTTON_WIDTH : 0);
  
  // Create refs for animation values - no shared values between instances
  const slideAnim = useRef(new Animated.Value(isUnlocked ? MAX_SLIDE : 0)).current;
  const progressAnim = useRef(new Animated.Value(isUnlocked ? BUTTON_WIDTH : 0)).current;
  
  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound references - these will be managed by AudioService now
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  
  // User interaction tracking
  const [interactionActive, setInteractionActive] = useState(false);
  
  // State for timer - ALWAYS USE SERVICE STATUS IF AVAILABLE
  const [isTimerPlaying, setIsTimerPlaying] = useState(() => {
    // Check door status from DoorTimerService if doorId is available
    if (doorId) {
      const serviceStatus = DoorTimerService.isDoorUnlocked(doorId);
      console.log(`[BUTTON:${instanceId.current}] Setting initial timer state based on DoorTimerService: ${serviceStatus}`);
      return serviceStatus;
    }
    
    // Fallback to initialUnlocked prop if DoorTimerService isn't available
    console.log(`[BUTTON:${instanceId.current}] Setting initial timer state based on prop: ${initialUnlocked}`);
    return initialUnlocked;
  });
  
  // Mount/unmount lifecycle
  useEffect(() => {
    console.log(`[ISB:${doorId}] Component mounted with initialUnlocked=${initialUnlocked}`);
    
    // Initialize the component
    if (initialUnlocked) {
      slideAnim.setValue(MAX_SLIDE);
      progressAnim.setValue(BUTTON_WIDTH);
      
      // Initialize countdown from DoorTimerService or use default
      const initialTime = doorId && DoorTimerService.isDoorUnlocked(doorId) 
        ? DoorTimerService.getRemainingUnlockTime(doorId)
        : countdownDuration;
        
      setCountdown(initialTime);
      
      // Start the countdown if needed
      if (initialTime > 0) {
        startCountdown(initialTime);
      }
    }
    
    // Initialize sounds
    loadSounds();
    
    // Return cleanup function
    return () => {
      console.log(`[ISB:${doorId}] Component unmounting`);
      isMountedRef.current = false;
      
      // Store the current timer state if active
      if (isTimerPlaying) {
        // Update the timestamp before unmounting
        if (timerStateStore[doorId]) {
          timerStateStore[doorId].lastUpdated = Date.now();
        }
        console.log(`[BUTTON:${instanceId.current}] Storing timer state before unmount`);
      }
      
      // Clear timer
      if (timerRef.current) {
        console.log(`[ISB:${doorId}] Clearing timer on unmount`);
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Cancel any vibration
      Vibration.cancel();
      
      // Clean up sounds
      if (soundsLoaded) {
        console.log(`[ISB:${doorId}] AudioService cleanup`);
        AudioService.cleanup();
      }
    };
  }, []);
  
  // Handle changes to initialUnlocked prop
  useEffect(() => {
    // Only respond to changes, not initial mount
    if (initialStateRef.current !== initialUnlocked) {
      console.log(`[BUTTON:${instanceId.current}] initialUnlocked changed from ${initialStateRef.current} to ${initialUnlocked}`);
      initialStateRef.current = initialUnlocked;
      
      setIsUnlocked(initialUnlocked);
      
      // If door was just unlocked, start the timer
      if (initialUnlocked && !isTimerPlaying) {
        console.log(`[BUTTON:${instanceId.current}] Starting timer due to prop change`);
        setIsTimerPlaying(true);
        
        // Reset countdown to full duration
        setCountdown(countdownDuration);
        
        // Store the timer state
        timerStateStore[doorId] = {
          remainingTime: countdownDuration,
          isActive: true,
          lastUpdated: Date.now()
        };
        
        // Start the countdown
        startCountdown(countdownDuration);
      }
      
      // If door was just locked, stop the timer
      if (!initialUnlocked && isTimerPlaying) {
        console.log(`[BUTTON:${instanceId.current}] Stopping timer due to prop change`);
        setIsTimerPlaying(false);
        
        // Clear the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Clear the stored timer state
        delete timerStateStore[doorId];
      }
    }
  }, [initialUnlocked, isTimerPlaying, countdownDuration, doorId, startCountdown]);
  
  // SYNC WITH SERVICE: Add an interval to continuously sync with DoorTimerService
  useEffect(() => {
    // Only set up sync if we have a valid doorId
    if (!doorId) return;
    
    console.log(`[ISB:${doorId}] Setting up frequent sync with DoorTimerService`);
    
    const syncInterval = setInterval(() => {
      // Get current status from service
      const doorStatus = DoorTimerService.isDoorUnlocked(doorId);
      
      // Update component state if it differs from service
      if (doorStatus !== isUnlocked) {
        console.log(`[ISB:${doorId}] Door status changed from ${isUnlocked} to ${doorStatus} (from service)`);
        setIsUnlocked(doorStatus);
        
        // Update animation state
        if (doorStatus) {
          // Door was unlocked - animate to unlocked state
          setIsAnimating(true);
          
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: MAX_SLIDE,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease)
            }),
            Animated.timing(progressAnim, {
              toValue: BUTTON_WIDTH,
              duration: 300,
              useNativeDriver: false,
              easing: Easing.out(Easing.ease)
            })
          ]).start(() => {
            setIsAnimating(false);
          });
        } else {
          // Door was locked - animate to locked state
          setIsAnimating(true);
          
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease)
            }),
            Animated.timing(progressAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
              easing: Easing.out(Easing.ease)
            })
          ]).start(() => {
            setIsAnimating(false);
          });
        }
        
        // Update timer playing state
        setIsTimerPlaying(doorStatus);
      }
      
      // If door is unlocked, update countdown from service
      if (doorStatus) {
        const remainingTime = DoorTimerService.getRemainingUnlockTime(doorId);
        const flooredTime = Math.floor(remainingTime);
        
        // Check if countdown reached zero and we need to lock the door
        if (remainingTime <= 0 && isUnlocked) {
          console.log(`[ISB:${doorId}] Timer reached zero via service sync, locking door`);
          // Only call resetToLocked if not already animating to avoid UI glitches
          if (!isAnimating) {
            resetToLocked();
          }
        }
        
        // Only update countdown if it's different from current value (to prevent unnecessary rerenders)
        if (Math.abs(flooredTime - countdown) >= 1) {
          //console.log(`[ISB:${doorId}] Updating countdown from ${countdown}s to ${flooredTime}s (from service)`);
          setCountdown(flooredTime);
        }
        
        // ALWAYS update progress animation using the precise value for smooth animation
        const progressPercent = remainingTime / countdownDuration;
        const newProgressWidth = progressPercent * BUTTON_WIDTH;
        progressAnim.setValue(newProgressWidth);
      }
    }, 100); // Update frequently for smooth animation
    
    return () => {
      clearInterval(syncInterval);
      console.log(`[ISB:${doorId}] Cleared sync interval`);
    };
  }, [doorId, isUnlocked, isAnimating, countdown, countdownDuration, slideAnim, progressAnim, resetToLocked]);
  
  // Initialize sounds using AudioService
  const loadSounds = async () => {
    console.log(`[ISB:${doorId}] Initializing sounds via AudioService`);
    try {
      await AudioService.initialize();
      setSoundsLoaded(true);
      console.log(`[ISB:${doorId}] AudioService initialized successfully`);
    } catch (error) {
      console.error(`[ISB:${doorId}] Error initializing AudioService:`, error);
    }
  };
  
  // Start countdown timer - SIMPLIFIED to work with DoorTimerService only
  const startCountdown = useCallback((initialDuration = countdownDuration) => {
    console.log(`[ISB:${doorId}] Starting countdown timer with duration: ${initialDuration}s`);
    
    // Always clear any existing timer first
    if (timerRef.current) {
      console.log(`[ISB:${doorId}] Clearing existing timer`);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Set initial countdown value
    setCountdown(Math.floor(initialDuration));
    
    // NO LONGER CREATING AN INTERVAL - We use the DoorTimerService sync interval instead
    // We don't need a separate timer since the sync with DoorTimerService will handle the countdown
    console.log(`[ISB:${doorId}] Using DoorTimerService for countdown, no local timer created`);
    
    // Note: The actual door timing is controlled by DoorTimerService
    // This component now just displays the countdown without managing it
  }, [countdownDuration, doorId]);
  
  // Play unlock feedback using AudioService
  const playUnlockFeedback = useCallback(async () => {
    console.log(`[ISB:${doorId}] Playing unlock feedback via AudioService`);
    try {
      await AudioService.playUnlockSound();
    } catch (error) {
      console.error(`[ISB:${doorId}] Error in unlock feedback:`, error);
      Vibration.vibrate([0, 40, 30, 40, 30, 40]);
    }
  }, [doorId]);
  
  // Play lock feedback using AudioService
  const playLockFeedback = useCallback(async () => {
    console.log(`[ISB:${doorId}] Playing lock feedback via AudioService`);
    try {
      await AudioService.playLockSound();
    } catch (error) {
      console.error(`[ISB:${doorId}] Error in lock feedback:`, error);
      Vibration.vibrate([0, 30, 20, 30, 20, 30]);
    }
  }, [doorId]);
  
  // Unlock the door
  const setupUnlockedState = useCallback(() => {
    console.log(`[ISB:${doorId}] Setting up unlocked state`);
    
    if (isAnimating || isUnlocked) {
      console.log(`[ISB:${doorId}] Setup blocked: already unlocked or animating`);
      return;
    }
    
    // Update state
    setIsAnimating(true);
    setIsUnlocked(true);
    setIsTimerPlaying(true);
    
    // Play feedback
    playUnlockFeedback();
    
    // Call callback
    if (onSwipe) {
      console.log(`[ISB:${doorId}] Calling onSwipe callback`);
      onSwipe();
    }
    
    // Start countdown
    startCountdown();
    
    // Animate to unlocked position
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: MAX_SLIDE,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      }),
      Animated.timing(progressAnim, {
        toValue: BUTTON_WIDTH,
        duration: 250,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic)
      })
    ]).start(() => {
      console.log(`[ISB:${doorId}] Unlock animation completed`);
      setIsAnimating(false);
    });
  }, [isAnimating, isUnlocked, onSwipe, playUnlockFeedback, startCountdown, slideAnim, progressAnim, doorId]);
  
  // Lock the door
  const resetToLocked = useCallback(() => {
    console.log(`[ISB:${doorId}] Resetting to locked state`);
    
    // Check conditions
    if (!isUnlocked || isAnimating) {
      console.log(`[ISB:${doorId}] Reset blocked: not unlocked or animating`);
      return;
    }
    
    // Clear timer
    if (timerRef.current) {
      console.log(`[ISB:${doorId}] Clearing timer during lock operation`);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update state
    setIsAnimating(true);
    setIsUnlocked(false);
    setIsTimerPlaying(false);
    setCountdown(countdownDuration);
    setInteractionActive(false);
    
    // Clear stored timer state
    delete timerStateStore[doorId];
    
    // Call callback
    if (onLock) {
      console.log(`[ISB:${doorId}] Calling onLock callback`);
      onLock();
    }
    
    // Play feedback
    playLockFeedback();
    
    // Animate back to start
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      })
    ]).start(() => {
      console.log(`[ISB:${doorId}] Lock animation completed`);
      setIsAnimating(false);
    });
  }, [countdownDuration, isAnimating, isUnlocked, onLock, playLockFeedback, slideAnim, progressAnim, doorId]);
  
  // Handle unlock action
  const handleUnlock = useCallback(() => {
    console.log(`[ISB:${doorId}] Handle unlock triggered`);
    
    if (isUnlocked || isAnimating || interactionActive) {
      console.log(`[ISB:${doorId}] Unlock action blocked`);
      return;
    }
    
    setInteractionActive(true);
    setupUnlockedState();
    
    // Reset interaction flag after a delay
    setTimeout(() => {
      setInteractionActive(false);
    }, 1000);
  }, [isAnimating, isUnlocked, interactionActive, setupUnlockedState, doorId]);
  
  // Reset slider to start position
  const resetToStart = useCallback(() => {
    console.log(`[ISB:${doorId}] Resetting slider position`);
    
    if (isUnlocked) {
      return;
    }
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic)
      })
    ]).start(() => {
      // Only reset interaction after animation is complete
      setInteractionActive(false);
    });
  }, [isUnlocked, slideAnim, progressAnim, doorId]);
  
  // Pan responder for slide gesture
  const panResponder = React.useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return !isUnlocked && !interactionActive && !isAnimating;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isUnlocked && !interactionActive && !isAnimating && Math.abs(gestureState.dx) > 1;
      },
      onPanResponderGrant: () => {
        // Set a starting offset to reduce initial jitter
        slideAnim.setOffset(0);
        slideAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isUnlocked) return;
        
        // Clamp the value to avoid going past the bounds
        const position = Math.min(Math.max(0, gestureState.dx), MAX_SLIDE);
        
        // Update the thumb position
        slideAnim.setValue(position);
        
        // Progress width - directly proportional to slide position
        const progress = (position / MAX_SLIDE) * BUTTON_WIDTH;
        progressAnim.setValue(progress);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isUnlocked) return;
        
        slideAnim.flattenOffset();
        
        if (gestureState.dx >= SLIDE_THRESHOLD) {
          handleUnlock();
        } else {
          resetToStart();
        }
      },
      onPanResponderTerminate: () => {
        slideAnim.flattenOffset();
        
        if (!isUnlocked) {
          resetToStart();
        }
      }
    }),
  [handleUnlock, isAnimating, isUnlocked, interactionActive, resetToStart, slideAnim, progressAnim]);
  
  // Custom circle timer component based on countdown value
  const CircleTimerView = () => {
    // Use a simple View-based timer rather than SVG to avoid dependencies
    const progress = countdown / countdownDuration;
    
    return (
      <View style={styles.circleTimerContainer}>
        <View style={[
          styles.circleBackground,
          { borderColor: 'rgba(195, 255, 121, 0.3)' }
        ]}>
          <View style={[
            styles.progressCircle,
            { 
              backgroundColor: '#C3FF79',
              // Scale the circle based on countdown progress
              transform: [
                { scale: progress }
              ]
            }
          ]} />
          
          <View style={styles.circleCenter}>
            <UnlockIcon width={16} height={16} fill="#C3FF79" />
            <Text style={styles.timerText}>{Math.ceil(countdown)}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Unlocked state component with visual timer
  const UnlockedView = () => {
    // Calculate progress percentage for the timer
    const progress = Math.max(0, countdown / countdownDuration);
    
    return (
      <View style={styles.unlockContainer}>
        {/* Background layer (darker green) */}
        <View style={styles.timerBackground} />
        
        {/* Progress indicator (lighter green that shrinks over time) */}
        <View 
          style={[
            styles.progressIndicator,
            { 
              width: `${progress * 106}%` // Increased to ensure full coverage with no gaps
            }
          ]}
        />
        
        {/* Content layer (icon + text) */}
        <View style={styles.countdownContent}>
          <UnlockIcon width={20} height={20} fill={COLORS.TEXT_COLOR} />
          <Text style={styles.countdownText}>
            {`Locking in ${Math.ceil(countdown)}s`}
          </Text>
        </View>
      </View>
    );
  };
  
  // Manual unlock button - for testing
  const renderTestButtons = () => {
    return (
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleUnlock}
          disabled={isUnlocked || isAnimating}
        >
          <Text style={styles.testButtonText}>🔓 Unlock</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={resetToLocked}
          disabled={!isUnlocked || isAnimating}
        >
          <Text style={styles.testButtonText}>🔒 Lock</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  console.log(`[ISB:${doorId}] Rendering with isUnlocked=${isUnlocked}, countdown=${countdown}`);
  
  // Render the component
  if (isUnlocked) {
    return (
      <View style={styles.container}>
        <UnlockedView />
      </View>
    );
  }
  
  return (
    <View>
      <View style={styles.wrapper}>
        <View 
          style={[
            styles.container,
            { 
              borderWidth: 2, 
              borderColor: COLORS.CONTAINER_BORDER,
              backgroundColor: COLORS.CONTAINER_BG
            }
          ]} 
          {...panResponder.panHandlers}
        >
          {/* Green background that appears during swipe */}
          <Animated.View 
            style={[
              styles.successBackground,
              { 
                width: progressAnim,
                opacity: progressAnim.interpolate({
                  inputRange: [0, 20],
                  outputRange: [0, 1],
                  extrapolate: 'clamp'
                })
              }
            ]}
          />
          
          {/* Thumb with lock icon */}
          <Animated.View 
            style={[
              styles.thumb,
              { 
                transform: [
                  { translateX: slideAnim }
                ] 
              }
            ]}
          >
            <View style={styles.thumbContent}>
              <LockIcon 
                width={20} 
                height={20} 
                fill={COLORS.ICON_COLOR} 
              />
            </View>
          </Animated.View>
          
          {/* Chevron indicators */}
          <View style={styles.chevronContainer}>
            <ChevronIcon 
              width={20} 
              height={20} 
              fill={COLORS.CHEVRON_COLOR} 
              direction="right" 
            />
            <ChevronIcon 
              width={20} 
              height={20} 
              fill={COLORS.CHEVRON_COLOR} 
              direction="right" 
            />
            <ChevronIcon 
              width={20} 
              height={20} 
              fill={COLORS.CHEVRON_COLOR} 
              direction="right" 
            />
          </View>
        </View>
      </View>
      {/* Uncomment for testing */}
      {/* {renderTestButtons()} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 128,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
  },
  wrapper: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
  },
  swipeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
  },
  swipeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Outfit-Medium',
    letterSpacing: 0.2,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTimerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  circleBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 51, 61, 0.7)',
    overflow: 'hidden',
  },
  progressCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    opacity: 0.6,
  },
  circleCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  timerText: {
    color: '#C3FF79',
    fontSize: 10,
    fontFamily: 'Outfit-SemiBold',
    marginTop: 2,
  },
  countdownContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 51, 61, 0.5)',
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBackground: {
    position: 'absolute',
    left: -2,  // Extend 2px to cover border
    top: -2,   // Extend 2px to cover border
    bottom: -2, // Extend 2px to cover border
    height: 40, // Fixed absolute height instead of percentage
    width: 0,
    backgroundColor: COLORS.SUCCESS_BG,
    zIndex: 1,
    borderTopLeftRadius: 10, // Apply radius only to visible corners
    borderBottomLeftRadius: 10,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: COLORS.INDICATOR_BG,
    left: 0,
    top: '50%',
    marginTop: -THUMB_SIZE / 2,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  thumbContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  unlockContainer: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 10,
    borderWidth: BORDER_WIDTH,
    borderColor: COLORS.SUCCESS_BORDER,
    position: 'relative',
    overflow: 'hidden',
  },
  timerBackground: {
    position: 'absolute',
    left: -3,
    right: -3,
    top: -3,
    bottom: -3,
    backgroundColor: COLORS.SUCCESS_BG_DARKER,
  },
  progressIndicator: {
    position: 'absolute',
    left: -3,
    top: -3,
    bottom: -3,
    backgroundColor: COLORS.SUCCESS_BG,
    minWidth: 1, // Ensure visible at low values
  },
  countdownContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  countdownText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    color: COLORS.TEXT_COLOR,
    letterSpacing: 0.2,
    fontWeight: '600',
    textAlign: 'center',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: BUTTON_WIDTH,
  },
  testButton: {
    backgroundColor: '#23262D',
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});

export default IsolatedSwipeButton; 