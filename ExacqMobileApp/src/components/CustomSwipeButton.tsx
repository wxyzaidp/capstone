import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
  Easing,
  Vibration,
  AppState
} from 'react-native';
import { LockIcon, UnlockIcon } from './icons/DoorIcons';
import ChevronIcon from './icons/ChevronIcon';
import AudioService from '../utils/AudioService';

// Constants for button dimensions and layout
const BUTTON_WIDTH = 126;
const BUTTON_HEIGHT = 36;
const THUMB_SIZE = 32;
const BORDER_WIDTH = 2;
const TRACK_PADDING = BORDER_WIDTH;
const MAX_SLIDE = BUTTON_WIDTH - THUMB_SIZE - BORDER_WIDTH;
const SLIDE_THRESHOLD = MAX_SLIDE * 0.6; // 60% of slide distance as threshold for unlocking
const SLIDE_LABEL = 'Slide to unlock';
const SLIDE_LABEL_STYLE = { fontSize: 16, color: '#9c9c9c' };
const COUNTER_WIDTH = 50;
const ICON_SIZE = 24;

// Vibration patterns - only for unlock and lock events
const hapticPatterns = {
  UNLOCK: Platform.OS === 'android' ? [0, 20, 40, 20] : [0, 50],
  LOCK: Platform.OS === 'android' ? [0, 30, 50, 30] : [0, 50, 0, 50],
};

// Function to play haptic feedback - now using AudioService
const playHaptic = (pattern: keyof typeof hapticPatterns) => {
  try {
    AudioService.playHapticFeedback(pattern === 'UNLOCK' ? 'UNLOCK' : 'LOCK');
  } catch (error) {
    console.log(`Error playing haptic feedback (${pattern}):`, error);
    Vibration.vibrate(hapticPatterns[pattern]); // Fallback to direct vibration
  }
};

// Function to play unlock sound - now using AudioService
const playUnlockSound = async () => {
  try {
    // Use the centralized audio service
    await AudioService.playUnlockSound();
  } catch (error) {
    console.error('Error playing global unlock sound:', error);
    Vibration.vibrate([0, 40, 30, 40, 30, 40]); // Fall back to vibration
  }
};

// Function to play lock feedback - now using AudioService
const playLockSound = async () => {
  try {
    // Use the centralized audio service
    await AudioService.playLockSound();
  } catch (error) {
    console.error('Error playing global lock sound:', error);
    Vibration.vibrate([0, 30, 20, 30, 20, 30]); // Fall back to vibration
  }
};

// Colors from Figma design
const COLORS = {
  CONTAINER_BG: 'rgba(46, 51, 61, 0.35)',
  CONTAINER_BORDER: 'rgba(70, 78, 97, 0.35)',
  INDICATOR_BG: '#404759',
  ICON_COLOR: '#FFFFFF',
  CHEVRON_COLOR: '#404759',
  SUCCESS_BG: '#C3FF79',
  SUCCESS_BORDER: 'rgba(195, 255, 121, 0.35)',
  TEXT_COLOR: '#131515',
  SUCCESS_BG_DARKER: 'rgba(116, 153, 49, 1)', // Darker green for elapsed time indicator
};

// Enable all debug flags for maximum visibility
const DEBUG = true;
const DEBUG_ANIMATION = true;  // Specific debug flag for animation issues
const DEBUG_STATE = true;      // Specific debug flag for state updates
const DEBUG_TIMER = true;      // New flag for timer operations
const DEBUG_LIFECYCLE = true;  // New flag for component lifecycle events
const DEBUG_INSTANCE = true;   // New flag for instance tracking

const log = (message: string) => {
  if (DEBUG) console.log(`[CustomSwipeButton] ${message}`);
};

const logAnimation = (message: string) => {
  if (DEBUG_ANIMATION) console.log(`[CustomSwipeButton:ANIM] ${message}`);
};

const logState = (message: string) => {
  if (DEBUG_STATE) console.log(`[CustomSwipeButton:STATE] ${message}`);
};

const logTimer = (message: string) => {
  if (DEBUG_TIMER) console.log(`[CustomSwipeButton:TIMER] ${message}`);
};

const logLifecycle = (message: string) => {
  if (DEBUG_LIFECYCLE) console.log(`[CustomSwipeButton:LIFECYCLE] ${message}`);
};

const logInstance = (message: string) => {
  if (DEBUG_INSTANCE) console.log(`[CustomSwipeButton:INSTANCE] ${message}`);
};

interface CustomSwipeButtonProps {
  onSwipe: () => void;
  onLock?: () => void;
  initialUnlocked?: boolean;
  countdownDuration?: number;
}

// Unlocked state display component
const UnlockedView = React.memo(({
  countdown,
  maxCountdown
}: {
  countdown: number;
  maxCountdown: number;
}) => {
  // Calculate progress percentage for the timer
  const progress = Math.max(0, countdown / maxCountdown);
  
  console.log(`UnlockedView rendering with countdown=${countdown}, maxCountdown=${maxCountdown}, progress=${progress}`);
  
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
          {`Locking in ${countdown}s`}
        </Text>
      </View>
    </View>
  );
});

// Create a stable state object that will persist across renders
interface ButtonState {
  unlocked: boolean;
  countdown: number;
  isAnimating: boolean;
  mounted: boolean;
  instanceId: string; // Add unique identifier for each instance
}

// Generate a unique ID for each component instance
const generateInstanceId = () => `swipe_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Create a global registry to track all active instances
// This will help us identify if multiple instances are interfering with each other
const ACTIVE_INSTANCES = new Map();

// Log all active instances (add after generateInstanceId function)
const logActiveInstances = () => {
  console.log('==== ACTIVE SWIPE BUTTONS ====');
  console.log(`Total active instances: ${ACTIVE_INSTANCES.size}`);
  ACTIVE_INSTANCES.forEach((state, id) => {
    console.log(`Instance ${id}: unlocked=${state.unlocked}, countdown=${state.countdown}, timer=${state.hasTimer}`);
  });
  console.log('===============================');
};

// Create a tracker for timers to avoid conflicts
const TIMER_IDS = new Set();
// New debug counter for timer events
let timerCounter = 0;

// Generate a guaranteed unique timer ID
const getUniqueTimerId = () => {
  const counter = ++timerCounter;
  let id = `timer_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 9)}`;
  while (TIMER_IDS.has(id)) {
    id = `timer_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 9)}`;
  }
  TIMER_IDS.add(id);
  logTimer(`Created unique timer ID: ${id}. Active timers: ${TIMER_IDS.size}`);
  return id;
};

// Clear and remove a timer from the tracker
const clearUniqueTimer = (id) => {
  if (id) {
    logTimer(`Clearing timer ID: ${id}`);
    clearInterval(id);
    const removed = TIMER_IDS.delete(id);
    logTimer(`Timer ${id} removed: ${removed}. Remaining timers: ${TIMER_IDS.size}`);
  } else {
    logTimer(`Attempted to clear undefined timer ID`);
  }
};

const CustomSwipeButton: React.FC<CustomSwipeButtonProps> = ({
  onSwipe,
  onLock,
  initialUnlocked = false,
  countdownDuration = 60,
}) => {
  logLifecycle(`********************************************`);
  logLifecycle(`CustomSwipeButton RENDER TRIGGERED with initialUnlocked=${initialUnlocked}, countdownDuration=${countdownDuration}`);
  
  // Create unique instance ID for this component instance
  const instanceIdRef = useRef<string>(generateInstanceId());
  logLifecycle(`Component instance ID: ${instanceIdRef.current}`);
  
  // CRITICAL FIX: Replace stateRef with proper React state
  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(countdownDuration);
  
  // Debug counter to track state updates
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  
  logInstance(`Instance ${instanceIdRef.current} render #${renderCountRef.current}: unlocked=${isUnlocked}, countdown=${countdown}, animating=${isAnimating}`);
  
  // Add instance to global registry on first render
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    ACTIVE_INSTANCES.set(instanceId, {
      unlocked: isUnlocked,
      countdown: countdown,
      hasTimer: timerRef.current !== null,
      renderCount: renderCountRef.current
    });
    
    logLifecycle(`Instance ${instanceId} MOUNTED. Total active: ${ACTIVE_INSTANCES.size}`);
    logActiveInstances();
    
    return () => {
      logLifecycle(`Instance ${instanceId} UNMOUNTING. Before removal, total active: ${ACTIVE_INSTANCES.size}`);
      ACTIVE_INSTANCES.delete(instanceId);
      logLifecycle(`After removal, total active: ${ACTIVE_INSTANCES.size}`);
      logActiveInstances();
    };
  }, []);
  
  // Update instance registry on state changes
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    if (ACTIVE_INSTANCES.has(instanceId)) {
      ACTIVE_INSTANCES.set(instanceId, {
        unlocked: isUnlocked,
        countdown: countdown,
        hasTimer: timerRef.current !== null,
        renderCount: renderCountRef.current
      });
      logInstance(`Updated registry for ${instanceId}: unlocked=${isUnlocked}, countdown=${countdown}, hasTimer=${timerRef.current !== null}`);
    }
  }, [isUnlocked, countdown]);
  
  // Sound references local to this instance - updated to not use Audio.Sound type
  const localSoundRefs = useRef<{
    unlockSound: any | null;
    lockSound: any | null;
  }>({
    unlockSound: null,
    lockSound: null
  });
  
  // Local function to load sounds specific to this instance - updated to use AudioService
  const loadLocalSounds = useCallback(async () => {
    try {
      const instanceId = instanceIdRef.current;
      logInstance(`Loading sounds for ${instanceId}`);
      
      // We'll use the AudioService instead of loading sounds directly
      // Just initialize the audio service to ensure it's ready
      await AudioService.initialize();
      
      logInstance(`${instanceId}: Audio service initialized successfully`);
    } catch (error) {
      const instanceId = instanceIdRef.current;
      console.error(`${instanceId}: Error initializing AudioService:`, error);
    }
  }, []);
  
  // Keep the stateRef for compatibility with existing code during transition
  const stateRef = useRef<ButtonState>({
    unlocked: initialUnlocked,
    countdown: countdownDuration,
    isAnimating: false,
    mounted: true,
    instanceId: instanceIdRef.current
  });
  
  // Synchronize state ref with actual state for compatibility
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    const oldState = {...stateRef.current};
    
    stateRef.current.unlocked = isUnlocked;
    stateRef.current.countdown = countdown;
    stateRef.current.isAnimating = isAnimating;
    
    logState(`${instanceId}: State sync - Old: {u:${oldState.unlocked}, c:${oldState.countdown}, a:${oldState.isAnimating}} -> New: {u:${isUnlocked}, c:${countdown}, a:${isAnimating}}`);
  }, [isUnlocked, countdown, isAnimating]);
  
  // Create tracking state just for re-rendering when values change
  const [renderKey, setRenderKey] = useState(0);
  
  // Animation values - unique to this instance
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Timer reference - unique to this instance
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track whether user interaction is active
  const interactionActive = useRef(false);
  
  // Log instance ID on mount
  useEffect(() => {
    logLifecycle(`CustomSwipeButton instance ${instanceIdRef.current} INITIALIZED with animation refs`);
    
    // Debug: log the actual object identities
    logLifecycle(`Animation object IDs - slideAnim: ${slideAnim.toString()}, progressAnim: ${progressAnim.toString()}`);
  }, [slideAnim, progressAnim]);
  
  // Modified to track renders
  const forceUpdate = useCallback(() => {
    const instanceId = instanceIdRef.current;
    const currentKey = renderKey;
    logInstance(`[RENDER] Force updating button ${instanceId}, current key=${currentKey}, new key=${currentKey + 1}`);
    logInstance(`[RENDER] Current state: ${JSON.stringify({...stateRef.current, timerActive: timerRef.current !== null})}`);
    setRenderKey(prev => prev + 1);
  }, [renderKey]);
  
  // Track app state to handle backgrounding
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const instanceId = instanceIdRef.current;
      logLifecycle(`AppState changed to ${nextAppState} for instance ${instanceId}`);
      
      if (nextAppState === 'active') {
        // App came to foreground
        logLifecycle(`App active - checking button state for instance ${instanceId}`);
        forceUpdate();
      }
    });
    
    return () => {
      logLifecycle(`Removing AppState listener for instance ${instanceIdRef.current}`);
      subscription.remove();
    };
  }, [forceUpdate]);
  
  // Cleanup timers on unmount
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    
    // Initialize sounds when component mounts
    logLifecycle(`${instanceId}: Running mount effect to initialize sounds`);
    try {
      loadLocalSounds();
    } catch (error) {
      console.log(`${instanceId}: Failed to initialize sounds:`, error);
    }
    
    return () => {
      logLifecycle(`${instanceId}: CLEANUP effect running`);
      stateRef.current.mounted = false;
      
      if (timerRef.current) {
        logTimer(`${instanceId}: Clearing timer ${timerRef.current} on unmount`);
        clearUniqueTimer(timerRef.current);
        timerRef.current = null;
      }
      
      // Cancel any ongoing vibration
      Vibration.cancel();
      
      // Clean up sound resources
      logLifecycle(`${instanceId}: Cleaning up sound resources`);
      if (localSoundRefs.current.unlockSound) {
        localSoundRefs.current.unlockSound = null;
      }
      if (localSoundRefs.current.lockSound) {
        localSoundRefs.current.lockSound = null;
      }
      
      logLifecycle(`${instanceId}: CLEANUP completed`);
    };
  }, [loadLocalSounds]);
  
  // Set up initial state if unlocked
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    if (initialUnlocked) {
      logState(`${instanceId}: Setting up initial unlocked state`);
      
      stateRef.current.unlocked = true;
      stateRef.current.countdown = countdownDuration;
      
      // Set initial animation values
      logAnimation(`${instanceId}: Setting initial animation values for unlocked state`);
      slideAnim.setValue(MAX_SLIDE);
      progressAnim.setValue(BUTTON_WIDTH);
      
      // Start countdown immediately
      logState(`${instanceId}: Starting initial countdown`);
      startCountdown();
      forceUpdate();
      
      logState(`${instanceId}: Initial unlocked setup complete`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Play unlock sound from local reference
  const playLocalUnlockSound = useCallback(async () => {
    const instanceId = instanceIdRef.current;
    try {
      logInstance(`${instanceId}: Playing unlock feedback`);
      
      // Play haptic feedback immediately
      playHaptic('UNLOCK');
      
      // Play sound using AudioService
      try {
        logInstance(`${instanceId}: Playing unlock sound`);
        await playUnlockSound();
      } catch (e) {
        console.error(`${instanceId}: Error playing unlock sound:`, e);
      }
    } catch (error) {
      console.error(`${instanceId}: Error in unlock feedback:`, error);
      Vibration.vibrate([0, 40, 30, 40, 30, 40]);
    }
  }, []);
  
  // Play lock sound from local reference
  const playLocalLockSound = useCallback(async () => {
    const instanceId = instanceIdRef.current;
    try {
      logInstance(`${instanceId}: Playing lock feedback`);
      
      // Play haptic feedback immediately
      playHaptic('LOCK');
      
      // Play sound using AudioService
      try {
        logInstance(`${instanceId}: Playing lock sound`);
        await playLockSound();
      } catch (e) {
        console.error(`${instanceId}: Error playing lock sound:`, e);
      }
    } catch (error) {
      console.error(`${instanceId}: Error in lock feedback:`, error);
      Vibration.vibrate([0, 30, 20, 30, 20, 30]);
    }
  }, []);
  
  // Trigger unlock feedback implementation
  const triggerUnlockFeedback = useCallback(() => {
    const instanceId = instanceIdRef.current;
    try {
      logInstance(`${instanceId}: Triggering unlock feedback`);
      
      // Play unlock sound with haptic feedback
      playLocalUnlockSound();
    } catch (error) {
      console.error(`${instanceId}: [Unlock Feedback Error]`, error);
    }
  }, [playLocalUnlockSound]);
  
  // CRITICAL FIX: Start countdown function that uses React state properly
  const startCountdown = useCallback(() => {
    const instanceId = instanceIdRef.current;
    logTimer(`===== COUNTDOWN START REQUESTED for ${instanceId} =====`);
    logTimer(`${instanceId}: Current state: unlocked=${isUnlocked}, countdown=${countdown}, timer=${timerRef.current}`);
    
    // Always clear any existing timer first
    if (timerRef.current) {
      logTimer(`${instanceId}: Clearing existing timer ${timerRef.current}`);
      clearUniqueTimer(timerRef.current);
      timerRef.current = null;
    }
    
    // Only start if unlocked
    if (!isUnlocked) {
      logTimer(`${instanceId}: Not starting countdown - component not unlocked`);
      return;
    }
    
    // Reset countdown immediately using setState
    logTimer(`${instanceId}: Resetting countdown to ${countdownDuration}`);
    setCountdown(countdownDuration);
    
    // Generate a unique ID for this timer instance
    const uniqueTimerId = getUniqueTimerId();
    
    // Store the instanceId with the timer for debugging
    const timerDebugId = `${uniqueTimerId}-${instanceId}`;
    
    // Start new timer with the unique ID
    logTimer(`${instanceId}: Creating new timer with unique ID ${timerDebugId}...`);
    const id = setInterval(() => {
      // Use function form of setState to ensure we're working with the latest state
      setCountdown(prevCount => {
        logTimer(`${instanceId}: TICK - current=${prevCount}`);
        
        // Check if we reached zero
        if (prevCount <= 1) {
          logTimer(`${instanceId}: Countdown reached zero, clearing timer`);
          if (timerRef.current) {
            clearUniqueTimer(timerRef.current);
            timerRef.current = null;
          }
          
          // Lock when countdown finished
          if (isUnlocked) {
            logTimer(`${instanceId}: Auto-locking after countdown completion`);
            // Need to use setTimeout to avoid state changes during render
            setTimeout(() => resetToLocked(), 0);
          }
          return 0;
        }
        
        return prevCount - 1;
      });
    }, 1000);
    
    logTimer(`${instanceId}: Timer created with ID ${timerDebugId}`);
    timerRef.current = id;
    
    // Update registry
    if (ACTIVE_INSTANCES.has(instanceId)) {
      const current = ACTIVE_INSTANCES.get(instanceId);
      ACTIVE_INSTANCES.set(instanceId, {
        ...current,
        hasTimer: true,
        timerId: id
      });
      logInstance(`${instanceId}: Registry updated with timer ID`);
    }
  }, [countdownDuration, isUnlocked]);
  
  // CRITICAL FIX: Simplified unlock implementation using setState
  const setupUnlockedState = useCallback(() => {
    const instanceId = instanceIdRef.current;
    logState(`===== UNLOCK OPERATION STARTED for ${instanceId} =====`);
    
    if (isAnimating || isUnlocked) {
      logState(`${instanceId}: [ERROR] Setup blocked, unlocked=${isUnlocked}, animating=${isAnimating}`);
      return;
    }
    
    // Update state immediately using setState
    logState(`${instanceId}: Setting unlocked state`);
    setIsAnimating(true);
    setIsUnlocked(true);
    
    // Trigger unlock feedback
    logState(`${instanceId}: Triggering unlock feedback`);
    triggerUnlockFeedback();
    
    // Call callback immediately
    if (onSwipe) {
      logState(`${instanceId}: Calling onSwipe callback`);
      onSwipe();
    }
    
    // Start countdown immediately - don't wait for animation
    logState(`${instanceId}: Starting countdown`);
    startCountdown();
    
    // Animate to unlocked position (just for visual effect)
    logAnimation(`${instanceId}: Starting unlock animation`);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: MAX_SLIDE,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(progressAnim, {
        toValue: BUTTON_WIDTH,
        duration: 250,
        useNativeDriver: false,
        easing: Easing.ease
      })
    ]).start(() => {
      logAnimation(`${instanceId}: Unlock animation completed`);
      setIsAnimating(false);
    });
  }, [isAnimating, isUnlocked, onSwipe, progressAnim, slideAnim, startCountdown, triggerUnlockFeedback]);
  
  // CRITICAL FIX: Updated resetToLocked function to use setState
  const resetToLocked = useCallback(() => {
    const instanceId = instanceIdRef.current;
    logState(`===== LOCK OPERATION STARTED for ${instanceId} =====`);
    
    // Check conditions
    if (!isUnlocked || isAnimating) {
      logState(`${instanceId}: [ERROR] Reset blocked, unlocked=${isUnlocked}, animating=${isAnimating}`);
      return;
    }
    
    // Clear timer immediately before state changes
    if (timerRef.current) {
      logState(`${instanceId}: Clearing timer ${timerRef.current} during lock operation`);
      clearUniqueTimer(timerRef.current);
      timerRef.current = null;
    }
    
    // Update state immediately using setState
    logState(`${instanceId}: Setting locked state`);
    setIsAnimating(true);
    setIsUnlocked(false);
    setCountdown(countdownDuration);
    interactionActive.current = false;
    
    // Call callback immediately
    if (onLock) {
      logState(`${instanceId}: Calling onLock callback`);
      onLock();
    }
    
    // Play lock feedback using local sound
    logState(`${instanceId}: Triggering lock feedback`);
    playLocalLockSound();
    
    // Animate back to start (just for visual effect)
    logAnimation(`${instanceId}: Starting lock animation`);
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
      logAnimation(`${instanceId}: Lock animation completed`);
      setIsAnimating(false);
    });
  }, [clearUniqueTimer, countdownDuration, isAnimating, isUnlocked, onLock, playLocalLockSound, progressAnim, slideAnim]);
  
  // CRITICAL FIX: Update handle unlock to use the state variables
  const handleUnlock = useCallback(() => {
    const instanceId = instanceIdRef.current;
    if (isUnlocked || isAnimating || interactionActive.current) {
      logInstance(`${instanceId}: Unlock action blocked`);
      return;
    }
    
    logInstance(`${instanceId}: Handling unlock action`);
    interactionActive.current = true;
    setupUnlockedState();
    
    // Reset interaction flag after a delay
    setTimeout(() => {
      interactionActive.current = false;
    }, 1000);
  }, [isAnimating, isUnlocked, setupUnlockedState]);
  
  // CRITICAL FIX: Update reset to start to use state values
  const resetToStart = useCallback(() => {
    const instanceId = instanceIdRef.current;
    if (isUnlocked) {
      return;
    }
    
    logInstance(`${instanceId}: Resetting slider position`);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 50,
        useNativeDriver: true
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false
      })
    ]).start();
    
    setTimeout(() => {
      interactionActive.current = false;
    }, 300);
  }, [isUnlocked, progressAnim, slideAnim]);
  
  // CRITICAL FIX: Update pan responder to use state values instead of refs
  const panResponder = React.useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return !isUnlocked && 
               !interactionActive.current && 
               !isAnimating;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isUnlocked && 
               !interactionActive.current && 
               !isAnimating && 
               Math.abs(gestureState.dx) > 1;
      },
      onPanResponderGrant: () => {
        slideAnim.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isUnlocked) {
          return;
        }
        
        // Bounded position
        const position = Math.max(0, Math.min(gestureState.dx, MAX_SLIDE));
        slideAnim.setValue(position);
        
        // Progress width - directly proportional to slide position
        const progress = (position / MAX_SLIDE) * BUTTON_WIDTH;
        progressAnim.setValue(progress);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isUnlocked) {
          return;
        }
        
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
  [handleUnlock, isAnimating, isUnlocked, resetToStart, slideAnim, progressAnim]);
  
  // CRITICAL FIX: Use direct state values for rendering
  // This is how SwipeUnlock works, avoiding the shared state issue
  if (isUnlocked) {
    return (
      <UnlockedView 
        countdown={countdown} 
        maxCountdown={countdownDuration} 
      />
    );
  }
  
  return (
    <View style={styles.wrapper}>
      <View 
        style={styles.container} 
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
            width={16} 
            height={16} 
            fill={COLORS.CHEVRON_COLOR} 
            direction="right" 
          />
          <ChevronIcon 
            width={16} 
            height={16} 
            fill={COLORS.CHEVRON_COLOR} 
            direction="right" 
          />
          <ChevronIcon 
            width={16} 
            height={16} 
            fill={COLORS.CHEVRON_COLOR} 
            direction="right" 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
  },
  container: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 10,
    backgroundColor: COLORS.CONTAINER_BG,
    borderWidth: BORDER_WIDTH,
    borderColor: COLORS.CONTAINER_BORDER,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  successBackground: {
    position: 'absolute',
    left: -1,
    top: -1,
    bottom: -1,
    height: '102%',
    width: 0,
    backgroundColor: COLORS.SUCCESS_BG,
    zIndex: 1,
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
    transform: [{ translateY: -8 }],
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
});

export default CustomSwipeButton; 