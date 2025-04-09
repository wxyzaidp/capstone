import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

/**
 * SwipeUnlock Component
 * 
 * Animation Optimization Strategy:
 * - Transform animations (position): useNativeDriver: true
 * - Opacity animations (textOpacity): useNativeDriver: true
 * - Layout animations (width/height): useNativeDriver: false (not supported)
 * 
 * We use shadow state tracking with Animated.Value listeners to avoid direct 
 * calls to getValue() which can cause performance issues.
 */

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
// Auto-complete threshold at 70% of the way
const AUTO_COMPLETE_THRESHOLD = 0.7;

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
  const isGestureActive = useRef(false); // Track if we're currently tracking a gesture
  
  // Animation values
  const position = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const successTextOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const successWidth = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current; // For timer animation
  
  // Shadow state to track animation values
  const positionValue = useRef(0);
  const textOpacityValue = useRef(1);
  const successWidthValue = useRef(0);
  
  // Attach listeners to keep shadow state in sync
  useEffect(() => {
    // Setup position listener
    const positionListener = position.addListener(({ value }) => {
      positionValue.current = value;
    });
    
    // Setup text opacity listener
    const textOpacityListener = textOpacity.addListener(({ value }) => {
      textOpacityValue.current = value;
    });
    
    // Setup success width listener
    const successWidthListener = successWidth.addListener(({ value }) => {
      successWidthValue.current = value;
    });
    
    // Cleanup listeners
    return () => {
      position.removeListener(positionListener);
      textOpacity.removeListener(textOpacityListener);
      successWidth.removeListener(successWidthListener);
    };
  }, [position, textOpacity, successWidth]);
  
  // Add a debounce ref to prevent rapid animation conflicts
  const lastAnimationTime = useRef(0);
  
  // Track the active gesture to avoid conflicts
  const activeGestureRef = useRef<'none' | 'thumb' | 'swipe-area'>('none');
  
  // Add a timestamp for the last animation start
  const lastAnimationStartTime = useRef(0);
  
  // Define these constants based on existing measurements
  const UNLOCK_THRESHOLD = SLIDER_TRACK_WIDTH - THUMB_SIZE - (SLIDER_TRACK_PADDING * 2);
  
  // Function to handle successful unlock - use this instead of separate triggerUnlock
  const triggerUnlock = () => {
    handleSuccessfulUnlock();
  };
  
  // Track animation starts and completions
  const startAnimation = (name, value, config) => {
    const now = Date.now();
    lastAnimationStartTime.current = now;
    console.log(`[Animation:START:${now}] ${name} to ${value} | Last anim: ${now - lastAnimationTime.current}ms ago`);
    
    // Create a promise wrapper to track animation completion
    return new Promise((resolve) => {
      Animated[config.type || 'timing'](
        config.target,
        {
          toValue: value,
          ...config.options
        }
      ).start(({ finished }) => {
        const finishTime = Date.now();
        const duration = finishTime - now;
        console.log(`[Animation:${finished ? 'FINISHED' : 'INTERRUPTED'}:${finishTime}] ${name} to ${value} | Duration: ${duration}ms`);
        resolve(finished);
      });
    });
  };
  
  // Function to stop all animations and log their current values
  const stopAllAnimations = (reason = 'unknown') => {
    console.log(`[Animation:STOP_ALL] Stopping all animations, reason: ${reason}`);
    
    return Promise.all([
      new Promise(resolve => {
        position.stopAnimation(value => {
          console.log(`[Animation:STOPPED] position at ${value}`);
          resolve(value);
        });
      }),
      new Promise(resolve => {
        successWidth.stopAnimation(value => {
          console.log(`[Animation:STOPPED] successWidth at ${value}`);
          resolve(value);
        });
      }),
      new Promise(resolve => {
        textOpacity.stopAnimation(value => {
          console.log(`[Animation:STOPPED] textOpacity at ${value}`);
          resolve(value);
        });
      })
    ]);
  };
  
  // Improved check for gesture conflicts
  const shouldAllowAnimation = (gesture = 'unknown') => {
    const now = Date.now();
    const timeSinceLastAnimation = now - lastAnimationTime.current;
    const timeSinceLastStart = now - lastAnimationStartTime.current;
    
    // Only allow new animations if at least 300ms has passed since the last one
    // Or if at least 100ms has passed since the last start
    if (timeSinceLastAnimation < 300 && timeSinceLastStart < 100) {
      console.log(`[Animation:DEBOUNCED] ${gesture} animation debounced, timeSinceLastAnimation=${timeSinceLastAnimation}ms, timeSinceLastStart=${timeSinceLastStart}ms`);
      return false;
    }
    
    console.log(`[Animation:ALLOWED] ${gesture} animation allowed, timeSinceLastAnimation=${timeSinceLastAnimation}ms, timeSinceLastStart=${timeSinceLastStart}ms`);
    lastAnimationTime.current = now;
    return true;
  };

  // Load sounds when component mounts
  useEffect(() => {
    // Initialize the AudioService
    AudioService.initialize().catch(error => 
      console.error('Failed to initialize AudioService in component mount:', error)
    );
    
    console.log(`[SwipeUnlock:${doorId || 'unknown'}] Component mounted`);
    
    return () => {
      isMounted.current = false;
      console.log(`[SwipeUnlock:${doorId || 'unknown'}] Component unmounted`);
      
      // Cancel any ongoing vibration
      Vibration.cancel();
    };
  }, [doorId]);
  
  // Sync with external doorStatus prop
  useEffect(() => {
    console.log(`[SwipeUnlock:${doorId || 'unknown'}] Door status changed to ${doorStatus}, current unlocked state: ${unlocked}`);
    
    if (doorStatus === 'Unlocked' && !unlocked) {
      handleSuccessfulUnlock(false); // Don't trigger the callback
    } else if (doorStatus === 'Locked' && unlocked) {
      console.log(`[SwipeUnlock:${doorId || 'unknown'}] External lock command received`);
      setUnlocked(false);
      setCountdown(UNLOCK_DURATION);
      
      // Play lock feedback when door is locked externally
      playLockFeedback();
      
      // Reset slider position
      startAnimation('position-reset', 0, {
        target: position,
        type: 'timing',
        options: { duration: 300, useNativeDriver: true }
      });
      
      // Reset success background width
      startAnimation('success-width-reset', 0, {
        target: successWidth,
        type: 'timing',
        options: { duration: 300, useNativeDriver: false }
      });
      
      // Reset timer progress
      timerProgress.setValue(1);
    }
  }, [doorStatus, unlocked, doorId]);
  
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
            useNativeDriver: false, // Layout animation - keep as false
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
          useNativeDriver: true, // Opacity can use native driver
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
              useNativeDriver: true, // Transform can use native driver
            }).start();
            
            // Reset success background width
            Animated.timing(successWidth, {
              toValue: 0,
              duration: 250,
              useNativeDriver: false, // Width changes can't use native driver
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
    if (now - lastInteractionTime.current < 100) {
      console.log(`[Interaction] Start debounced - too soon (${now - lastInteractionTime.current}ms)`);
      return;
    }
    
    console.log(`[Interaction] START at ${now}`);
    lastInteractionTime.current = now;
    setIsInteracting(true);
    // Notify parent that slider interaction has started
    if (onSliderInteractionStart) onSliderInteractionStart();
  };
  
  // End interaction with debouncing
  const handleInteractionEnd = () => {
    console.log(`[Interaction] END scheduled`);
    
    // Small delay to ensure we don't end interaction prematurely
    setTimeout(() => {
      if (isMounted.current) {
        console.log(`[Interaction] END executed`);
        setIsInteracting(false);
        // Notify parent that slider interaction has ended
        if (onSliderInteractionEnd) onSliderInteractionEnd();
      }
    }, 50);
  };

  // Function to handle successful unlock
  const handleSuccessfulUnlock = async (shouldNotify = true) => {
    if (!isMounted.current) return;
    
    console.log(`[SwipeUnlock:${doorId || 'unknown'}] Handling successful unlock`);
    
    // Stop any existing animations before starting new ones
    await stopAllAnimations('successful-unlock');
    
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
    startAnimation('position-unlock', SLIDER_THRESHOLD, {
      target: position,
      type: 'spring',
      options: { 
        friction: 12, // Increased from 7 for more damping
        tension: 25,  // Reduced from 40 for softer movement
        useNativeDriver: true 
      }
    });
    
    // Animate success background with timing for smooth transition
    startAnimation('success-width-unlock', SLIDER_TRACK_WIDTH, {
      target: successWidth,
      type: 'timing',
      options: { duration: 350, useNativeDriver: false } // Increased from 250
    });
    
    // Only notify parent if this was triggered by user interaction
    if (shouldNotify && onUnlock) {
      console.log(`[SwipeUnlock:${doorId || 'unknown'}] Notifying parent of unlock`);
      onUnlock();
    }
  };

  // Function to handle unsuccessful unlock (reset) with improved animation
  const handleUnsuccessfulUnlock = async () => {
    if (!isMounted.current) return;
    
    // Apply debounce to prevent rapid animations
    if (!shouldAllowAnimation('unsuccessful-unlock')) {
      console.log(`[SwipeUnlock:${doorId || 'unknown'}] Unsuccessful unlock debounced`);
      return;
    }
    
    console.log(`[SwipeUnlock:${doorId || 'unknown'}] Handling unsuccessful unlock (reset)`);
    
    // Stop any existing animations first to prevent conflicts
    await stopAllAnimations('unsuccessful-unlock');
    
    // Reset with spring animation for more natural feel
    startAnimation('position-reset', 0, {
      target: position,
      type: 'spring',
      options: { 
        friction: 14, // Increased from 8 for more damping 
        tension: 25,  // Reduced from 50 for softer movement
        useNativeDriver: true 
      }
    });
    
    // Reset success background width
    startAnimation('success-width-reset', 0, {
      target: successWidth,
      type: 'timing',
      options: { duration: 300, useNativeDriver: false } // Increased from 200
    });
    
    // Restore text opacity with easing
    startAnimation('text-opacity-reset', 1, {
      target: textOpacity,
      type: 'timing',
      options: { duration: 250, useNativeDriver: true } // Increased from 200
    });
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

  // Handler for the thumb slider
  const thumbPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onShouldBlockNativeResponder: () => true,
    
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: (_, gestureState) => {
      console.log('[SwipeUnlock:thumb] onPanResponderGrant - movement started');
      // We already have positionValue.current updated by our listener
      // isInteracting is a state, not a ref
      setIsInteracting(true);
      console.log(`[SwipeUnlock:thumb] Starting x: ${positionValue.current.toFixed(2)}`);
      
      // Stop any running animations immediately
      position.stopAnimation();
      successWidth.stopAnimation();
      textOpacity.stopAnimation();
      
      // Notify parent container
      if (onSliderInteractionStart) onSliderInteractionStart();
    },

    onPanResponderMove: (_, gestureState) => {
      const { dx } = gestureState;
      
      // Apply slight damping for more natural movement
      const damping = 0.97; // Slightly less resistance for the thumb vs the swipe area
      
      // Calculate new position, clamping within the slider track
      let newPosition = Math.max(
        SLIDER_TRACK_PADDING, 
        Math.min(
          SLIDER_TRACK_WIDTH - THUMB_SIZE - SLIDER_TRACK_PADDING,
          positionValue.current + dx * damping
        )
      );
      
      // Only log significant movements to reduce logging noise
      if (Math.abs(newPosition - positionValue.current) > 5) {
        console.log(`[SwipeUnlock:thumb] Moving to x=${newPosition.toFixed(2)}`);
      }
      
      // Set the position directly without animation
      position.setValue(newPosition);
      
      // Calculate how close we are to unlock threshold for success indicator
      const unlockProgress = Math.min(1, newPosition / UNLOCK_THRESHOLD);
      successWidth.setValue(unlockProgress * SLIDER_TRACK_WIDTH);
      
      // Fade text based on progress - use gentler curve
      const fadeOutRate = 1.2; // Slightly gentler than before (was 1.5)
      textOpacity.setValue(1 - (unlockProgress * fadeOutRate));
    },
    
    onPanResponderRelease: (_, gestureState) => {
      console.log('[SwipeUnlock:thumb] onPanResponderRelease - touch released');
      // isInteracting is a state, not a ref
      setIsInteracting(false);
      
      // Get the current position and velocity
      const currentPosition = positionValue.current;
      const velocity = gestureState.vx;
      
      console.log(`[SwipeUnlock:thumb] Release at position=${currentPosition.toFixed(2)}, velocity=${velocity.toFixed(2)}`);
      
      // Check if we've moved past the unlock threshold OR if we have a significant velocity
      // More lenient threshold if there's good velocity
      const hasReachedThreshold = currentPosition >= UNLOCK_THRESHOLD;
      const hasSignificantVelocity = velocity > 0.4 && currentPosition > UNLOCK_THRESHOLD * 0.6;
      
      if (hasReachedThreshold || hasSignificantVelocity) {
        console.log('[SwipeUnlock:thumb] UNLOCK TRIGGERED!');
        // Snap to the end position with a spring animation
        Animated.spring(position, {
          toValue: SLIDER_TRACK_WIDTH - THUMB_SIZE - SLIDER_TRACK_PADDING,
          tension: 25, // Reduced from 50 for softer movement
          friction: 12, // Increased from 10 for more damping
          useNativeDriver: true, // Transform animations can use native driver
        }).start(() => {
          // Only trigger unlock if we aren't already unlocked
          if (!unlocked) {
            triggerUnlock();
          }
        });
        
        // Animate success background to full width
        Animated.timing(successWidth, {
          toValue: SLIDER_TRACK_WIDTH,
          duration: 350, // Increased from 300 for smoother transition
          useNativeDriver: false, // Width animations cannot use native driver
        }).start();
        
        // Fully hide the text
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 250, // Increased from 200 for smoother fade
          useNativeDriver: true, // Opacity animations can use native driver
        }).start();
      } else {
        // Reset with a spring animation for more natural feel
        Animated.spring(position, {
          toValue: SLIDER_TRACK_PADDING,
          tension: 20, // Reduced from 40 for softer movement
          friction: 14, // Increased from 10 for more damping
          useNativeDriver: true, // Transform animations can use native driver
        }).start();
        
        // Reset success background with timing
        Animated.timing(successWidth, {
          toValue: 0,
          duration: 350, // Increased from 300 for smoother transition
          useNativeDriver: false, // Width animations cannot use native driver
        }).start();
        
        // Reset text opacity
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250, // Increased from 200 for smoother fade
          useNativeDriver: true, // Opacity animations can use native driver
        }).start();
      }
      
      // Notify parent we're done interacting - after a slight delay to
      // prevent immediate scrolling when gesture ends
      setTimeout(() => {
        if (onSliderInteractionEnd) onSliderInteractionEnd();
      }, 100);
    },
    
    onPanResponderTerminate: () => {
      console.log('[SwipeUnlock:thumb] onPanResponderTerminate - gesture terminated');
      // isInteracting is a state, not a ref
      setIsInteracting(false);
      
      // Reset with a spring animation
      Animated.spring(position, {
        toValue: SLIDER_TRACK_PADDING,
        tension: 20, // Reduced from 40 for softer movement
        friction: 14, // Increased from 10 for more damping
        useNativeDriver: true, // Transform animations can use native driver
      }).start();
      
      // Reset success background
      Animated.timing(successWidth, {
        toValue: 0,
        duration: 350, // Increased from 300 for smoother transition
        useNativeDriver: false, // Width animations cannot use native driver
      }).start();
      
      // Reset text opacity
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 250, // Increased from 200 for smoother fade
        useNativeDriver: true, // Opacity animations can use native driver
      }).start();
      
      // Notify parent we're done interacting
      if (onSliderInteractionEnd) onSliderInteractionEnd();
    },
  }), [triggerUnlock, unlocked, onSliderInteractionStart, onSliderInteractionEnd]);

  // Create a pan responder for the swipe area
  const swipeAreaPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => {
      console.log(`[Gesture:SWIPE:START] Checking if should become responder | unlocked=${unlocked} | isLocking=${isLocking}`);
      return !unlocked && !isLocking;
    },
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only become responder for horizontal swipes
      const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      console.log(`[Gesture:SWIPE:MOVE] Checking if should become responder | dx=${gestureState.dx} | dy=${gestureState.dy} | isHorizontal=${isHorizontalSwipe} | unlocked=${unlocked} | isLocking=${isLocking}`);
      return isHorizontalSwipe && !unlocked && !isLocking;
    },
    onPanResponderGrant: (_, gestureState) => {
      console.log(`[Gesture:SWIPE:GRANT] Gesture granted | position=${positionValue.current} | x0=${gestureState.x0}`);
      // Track that swipe area is the active gesture
      activeGestureRef.current = 'swipe-area';
      
      // Stop any existing animations first
      stopAllAnimations('swipe-area-grant');
      
      // Start the interaction
      handleInteractionStart();
    },
    onPanResponderMove: (_, gestureState) => {
      // Only respond if this is the active gesture
      if (activeGestureRef.current !== 'swipe-area') {
        console.log(`[Gesture:SWIPE:MOVE] Ignored - not active gesture (active=${activeGestureRef.current})`);
        return;
      }
      
      // Get current position based on gesture
      // Apply slight damping to make movement feel more weighted
      const damping = 0.95; // Slight resistance factor (1.0 would be no damping)
      const newPosition = Math.max(0, Math.min(gestureState.dx * damping, SLIDER_THRESHOLD));
      
      console.log(`[Gesture:SWIPE:MOVE] Moving to ${newPosition} | dx=${gestureState.dx}`);
      
      // Update position directly without animation for smooth tracking
      position.setValue(newPosition);
      
      // Update success background width with slight lag for natural feel
      const successRatio = newPosition / SLIDER_THRESHOLD;
      successWidth.setValue(successRatio * SLIDER_TRACK_WIDTH);
      
      // Fade text as thumb moves (direct setValue doesn't need useNativeDriver)
      // Use a gentler curve for text fading
      const fadeThreshold = SLIDER_THRESHOLD * 0.2; // Start fading earlier
      if (newPosition > fadeThreshold) {
        const opacityValue = Math.max(0, 1 - (newPosition - fadeThreshold) / (SLIDER_THRESHOLD - fadeThreshold) * 0.9);
        textOpacity.setValue(opacityValue);
      }
      
      // If position is at the threshold, consider it unlocked
      if (newPosition >= SLIDER_THRESHOLD * 0.95 && !unlocked) {
        console.log(`[Gesture:SWIPE:MOVE] Threshold reached, triggering unlock | position=${newPosition}`);
        handleSuccessfulUnlock();
      }
    },
    onPanResponderEnd: (_, gestureState) => {
      console.log(`[Gesture:SWIPE:END] Gesture ended | dx=${gestureState.dx} | vx=${gestureState.vx} | position=${positionValue.current}`);
      
      // Clear active gesture if this is still the active one
      if (activeGestureRef.current === 'swipe-area') {
        activeGestureRef.current = null;
      }
      
      // If position is at threshold or high velocity, unlock
      // Use same thresholds as thumb handler for consistency
      if (positionValue.current >= SLIDER_THRESHOLD * 0.95 || 
          (gestureState.vx > 0.4 && positionValue.current > SLIDER_THRESHOLD * 0.6)) {
        console.log(`[Gesture:SWIPE:END] High velocity or threshold reached, unlocking`);
        handleSuccessfulUnlock();
      } else {
        // Reset to initial position
        handleUnsuccessfulUnlock();
      }
      
      // End the interaction
      handleInteractionEnd();
    },
    onPanResponderTerminate: () => {
      console.log(`[Gesture:SWIPE:TERMINATE] Terminate called | position=${positionValue.current}`);
      
      // Clear active gesture if this is still the active one
      if (activeGestureRef.current === 'swipe-area') {
        activeGestureRef.current = null;
      }
      
      // Reset to initial position
      handleUnsuccessfulUnlock();
    },
  }), [unlocked, isLocking, handleSuccessfulUnlock, handleUnsuccessfulUnlock]);

  // Create a pan responder to block horizontal swipes in the bottom area
  // This is a critical part that prevents the card from scrolling while swiping
  const bottomAreaPanResponder = PanResponder.create({
    // Immediately claim the touch interaction at the start
    onStartShouldSetPanResponder: (evt) => {
      // Log the Y position to help debugging the boundary
      const { locationY } = evt.nativeEvent;
      console.log(`[SwipeUnlock:bottom] Touch detected in bottom half at Y=${locationY}`);
      return true;
    },
    onStartShouldSetPanResponderCapture: () => {
      console.log('[SwipeUnlock:bottom] Capturing touch start in bottom half');
      return true;
    },
    
    // Also claim any movement, even if it's small
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Log the movement with dx and dy to understand the direction
      const { dx, dy } = gestureState;
      console.log(`[SwipeUnlock:bottom] Movement detected: dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}`);
      // Aggressively capture all movements to prevent card scrolling
      return true;
    },
    onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      // Capturing move events to prevent them from reaching the scroll view
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        console.log(`[SwipeUnlock:bottom] Capturing movement: dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}`);
      }
      // Always capture movements in the bottom area
      return true;
    },
    
    // Never allow this responder to be terminated by another component
    onPanResponderTerminationRequest: () => {
      console.log('[SwipeUnlock:bottom] onPanResponderTerminationRequest - DENYING');
      return false;
    },
    
    // Always block native components from claiming this gesture
    onShouldBlockNativeResponder: () => true,
    
    onPanResponderGrant: () => {
      console.log('[SwipeUnlock:bottom] onPanResponderGrant - Got responder!');
      isGestureActive.current = true;
      // Immediately notify parent to disable carousel scrolling
      if (onSliderInteractionStart) onSliderInteractionStart();
    },
    
    // Just capture the move but don't do anything with it
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy, vx, vy } = gestureState;
      // Only log significant movements to reduce noise
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        console.log(`[SwipeUnlock:bottom] Tracking move: dx=${dx.toFixed(2)}, vx=${vx.toFixed(2)}`);
      }
      // Even if this isn't a swipe-to-unlock gesture, we need to prevent card scrolling
      return true;
    },
    
    // Re-enable scrolling when touch ends
    onPanResponderRelease: () => {
      console.log('[SwipeUnlock:bottom] Touch released in bottom half');
      isGestureActive.current = false;
      // Use requestAnimationFrame to ensure this runs in the next UI cycle
      requestAnimationFrame(() => {
        if (onSliderInteractionEnd) onSliderInteractionEnd();
      });
    },
    
    // Also handle terminated gestures
    onPanResponderTerminate: () => {
      console.log('[SwipeUnlock:bottom] Touch terminated in bottom half');
      isGestureActive.current = false;
      // Use requestAnimationFrame to ensure this runs in the next UI cycle
      requestAnimationFrame(() => {
        if (onSliderInteractionEnd) onSliderInteractionEnd();
      });
    }
  });

  // Style for bottom half blocker with touch feedback for debugging
  const bottomHalfBlockerStyle = {
    position: 'absolute' as const,
    top: 120, // Start exactly after the top section
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5, // Lower than the slider but higher than the card
    // Uncomment for debugging to see the touch area
    // backgroundColor: 'rgba(255, 0, 0, 0.1)',
  };

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
        
        {/* Full bottom half blocker that completely blocks carousel scrolling */}
        <View 
          style={bottomHalfBlockerStyle}
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
  // Replace the three blockers with a single bottom half blocker
  bottomHalfBlocker: {
    position: 'absolute',
    top: 120, // Start exactly after the top section
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5, // Lower than the slider but higher than the card
    // For debugging - remove in production
    // backgroundColor: 'rgba(255, 0, 0, 0.1)',
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