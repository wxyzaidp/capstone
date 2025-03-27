import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
  Switch,
  PanResponder,
  ScrollView,
  Image,
  ImageStyle,
  Vibration,
  Easing,
} from 'react-native';
import { UI_COLORS, applyTypography, UI_TYPOGRAPHY } from '../design-system';
import Svg, { Path } from 'react-native-svg';
import AudioService from '../utils/AudioService';
import UnlockIcon from './icons/UnlockIcon';
import DoorTimerService from '../services/DoorTimerService';
import CustomToggle from './ui/CustomToggle';

// Icon imports - using actual asset paths
const LOCK_ICON = require('../assets/icons/lock_icon.svg');
const STAR_ICON = require('../assets/icons/star_icon.svg');
const EMERGENCY_HOME_ICON = require('../assets/icons/emergency_home_icon.svg');
const ERROR_ICON = require('../assets/icons/error_icon.svg');

// Image imports with correct paths
const MAIN_ENTRANCE = require('../assets/images/main_entrance.jpg');
const SERVER_ROOM = require('../assets/images/server_room.jpg');
const STORAGE_AREA = require('../assets/images/storage_area.jpg');
const ROOFTOP_ACCESS = require('../assets/images/rooftop_access.jpg');
const TRAINING_ROOM = require('../assets/images/training_room.jpg');
const LOBBY_ENTRANCE = require('../assets/images/lobby_entrance.jpg');
const SUPPLY_CLOSET = require('../assets/images/supply_closet.jpg');
const CONFERENCE_ROOM = require('../assets/images/conference_room.jpg');
const CAFETERIA = require('../assets/images/cafeteria.jpg');
const PARKING_GARAGE = require('../assets/images/parking_garage.jpg');
const IT_OFFICE = require('../assets/images/IT_office.jpg');
const EXECUTIVE_SUITE = require('../assets/images/executive_suite.jpg');

// Helper function to determine which image to display based on door name
const getDoorImage = (doorName: string) => {
  const doorNameLower = doorName.toLowerCase();
  
  if (doorNameLower.includes('server')) {
    return SERVER_ROOM;
  } else if (doorNameLower.includes('storage')) {
    return STORAGE_AREA;
  } else if (doorNameLower.includes('roof') || doorNameLower.includes('top')) {
    return ROOFTOP_ACCESS;
  } else if (doorNameLower.includes('training') || doorNameLower.includes('classroom')) {
    return TRAINING_ROOM;
  } else if (doorNameLower.includes('lobby')) {
    return LOBBY_ENTRANCE;
  } else if (doorNameLower.includes('entrance')) {
    return MAIN_ENTRANCE;
  } else if (doorNameLower.includes('supply') || doorNameLower.includes('closet')) {
    return SUPPLY_CLOSET;
  } else if (doorNameLower.includes('conference') || doorNameLower.includes('meeting')) {
    return CONFERENCE_ROOM;
  } else if (doorNameLower.includes('cafeteria') || doorNameLower.includes('lunch')) {
    return CAFETERIA;
  } else if (doorNameLower.includes('parking') || doorNameLower.includes('garage')) {
    return PARKING_GARAGE;
  } else if (doorNameLower.includes('it') || doorNameLower.includes('tech')) {
    return IT_OFFICE;
  } else if (doorNameLower.includes('executive') || doorNameLower.includes('suite')) {
    return EXECUTIVE_SUITE;
  } else {
    return MAIN_ENTRANCE; // Default image
  }
};

// Chevron Left Icon for the close button
const ChevronLeftIcon = ({ size = 16, color = '#6FDCFA' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path 
        d="M9.5 13L3.5 7L9.5 1" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Lock Icon for the swipe button
const LockIconSvg = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M8.00016 29.3334C7.26683 29.3334 6.63927 29.0725 6.1175 28.5507C5.59483 28.028 5.3335 27.4 5.3335 26.6667V13.3334C5.3335 12.6 5.59483 11.972 6.1175 11.4494C6.63927 10.9276 7.26683 10.6667 8.00016 10.6667H9.3335V8.00004C9.3335 6.1556 9.98372 4.58315 11.2842 3.28271C12.5837 1.98315 14.1557 1.33337 16.0002 1.33337C17.8446 1.33337 19.4171 1.98315 20.7175 3.28271C22.0171 4.58315 22.6668 6.1556 22.6668 8.00004V10.6667H24.0002C24.7335 10.6667 25.3615 10.9276 25.8842 11.4494C26.4059 11.972 26.6668 12.6 26.6668 13.3334V26.6667C26.6668 27.4 26.4059 28.028 25.8842 28.5507C25.3615 29.0725 24.7335 29.3334 24.0002 29.3334H8.00016ZM8.00016 26.6667H24.0002V13.3334H8.00016V26.6667ZM16.0002 22.6667C16.7335 22.6667 17.3615 22.4058 17.8842 21.884C18.4059 21.3614 18.6668 20.7334 18.6668 20C18.6668 19.2667 18.4059 18.6387 17.8842 18.116C17.3615 17.5943 16.7335 17.3334 16.0002 17.3334C15.2668 17.3334 14.6393 17.5943 14.1175 18.116C13.5948 18.6387 13.3335 19.2667 13.3335 20C13.3335 20.7334 13.5948 21.3614 14.1175 21.884C14.6393 22.4058 15.2668 22.6667 16.0002 22.6667ZM12.0002 10.6667H20.0002V8.00004C20.0002 6.88893 19.6113 5.94449 18.8335 5.16671C18.0557 4.38893 17.1113 4.00004 16.0002 4.00004C14.8891 4.00004 13.9446 4.38893 13.1668 5.16671C12.3891 5.94449 12.0002 6.88893 12.0002 8.00004V10.6667Z"
        fill={color}
      />
    </Svg>
  );
};

// Star Icon
const StarIconSvg = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M8.85 16.825L12 14.925L15.15 16.85L14.325 13.25L17.1 10.85L13.45 10.525L12 7.125L10.55 10.5L6.9 10.825L9.675 13.25L8.85 16.825ZM5.825 21L7.45 13.975L2 9.25L9.2 8.625L12 2L14.8 8.625L22 9.25L16.55 13.975L18.175 21L12 17.275L5.825 21Z" 
        fill={color}
      />
    </Svg>
  );
};

// Emergency Home Icon
const EmergencyHomeIconSvg = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13.0003 13H11.0003V7H13.0003V13Z" fill={color}/>
      <Path d="M12.7133 15.712C12.5213 15.904 12.2836 16 12.0003 16C11.7169 16 11.4796 15.904 11.2883 15.712C11.0963 15.5207 11.0003 15.2833 11.0003 15C11.0003 14.7167 11.0963 14.479 11.2883 14.287C11.4796 14.0957 11.7169 14 12.0003 14C12.2836 14 12.5213 14.0957 12.7133 14.287C12.9046 14.479 13.0003 14.7167 13.0003 15C13.0003 15.2833 12.9046 15.5207 12.7133 15.712Z" fill={color}/>
      <Path fillRule="evenodd" clipRule="evenodd" d="M22.586 10.5857L13.4144 1.41416C12.6334 0.633107 11.367 0.633107 10.586 1.41416L1.4144 10.5857C0.633351 11.3668 0.633351 12.6331 1.4144 13.4142L10.586 22.5857C11.367 23.3668 12.6334 23.3668 13.4144 22.5857L22.586 13.4142C23.367 12.6331 23.367 11.3668 22.586 10.5857ZM12.0002 2.82837L21.1718 11.9999L12.0002 21.1715L2.82861 11.9999L12.0002 2.82837Z" fill={color}/>
    </Svg>
  );
};

// Error Icon
const ErrorIconSvg = ({ size = 24, color = '#FF5A5A' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.9989 17.2033C12.3309 17.2033 12.6096 17.0909 12.8351 16.8663C13.0606 16.6416 13.1734 16.3633 13.1734 16.0313C13.1734 15.6993 13.0611 15.4194 12.8366 15.1918C12.612 14.9643 12.3335 14.8505 12.0014 14.8505C11.6694 14.8505 11.3906 14.9643 11.1651 15.1918C10.9396 15.4194 10.8269 15.6993 10.8269 16.0313C10.8269 16.3633 10.9391 16.6416 11.1636 16.8663C11.3883 17.0909 11.6667 17.2033 11.9989 17.2033ZM10.8626 13.012H13.1376V6.8745H10.8626V13.012ZM12.0001 22.2033C10.585 22.2033 9.25713 21.9356 8.01663 21.4003C6.77596 20.8649 5.69679 20.1385 4.77912 19.221C3.86162 18.3033 3.13521 17.2242 2.59987 15.9835C2.06454 14.743 1.79688 13.4152 1.79688 12C1.79688 10.5848 2.06454 9.257 2.59987 8.0165C3.13521 6.77584 3.86162 5.69667 4.77912 4.779C5.69679 3.8615 6.77596 3.13509 8.01663 2.59975C9.25713 2.06442 10.585 1.79675 12.0001 1.79675C13.4153 1.79675 14.7431 2.06442 15.9836 2.59975C17.2243 3.13509 18.3035 3.8615 19.2211 4.779C20.1386 5.69667 20.865 6.77584 21.4004 8.0165C21.9357 9.257 22.2034 10.5848 22.2034 12C22.2034 13.4152 21.9357 14.743 21.4004 15.9835C20.865 17.2242 20.1386 18.3033 19.2211 19.221C18.3035 20.1385 17.2243 20.8649 15.9836 21.4003C14.7431 21.9356 13.4153 22.2033 12.0001 22.2033ZM12.0001 19.9283C14.2175 19.9283 16.0932 19.1613 17.6274 17.6273C19.1614 16.0931 19.9284 14.2173 19.9284 12C19.9284 9.78267 19.1614 7.90692 17.6274 6.37275C16.0932 4.83875 14.2175 4.07175 12.0001 4.07175C9.78279 4.07175 7.90704 4.83875 6.37288 6.37275C4.83888 7.90692 4.07187 9.78267 4.07187 12C4.07187 14.2173 4.83888 16.0931 6.37288 17.6273C7.90704 19.1613 9.78279 19.9283 12.0001 19.9283Z"
        fill={color}
      />
    </Svg>
  );
};

// Check Icon for unlocked state
const CheckIconSvg = ({ size = 24, color = '#131515' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.0007 15.1709L19.1931 5.97852L20.6073 7.39273L10.0007 17.9993L3.63672 11.6354L5.05093 10.2212L10.0007 15.1709Z"
        fill={color}
      />
    </Svg>
  );
};

interface DoorBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  doorName: string;
  doorId: string;
  isInRange?: boolean;
  activeHours?: string;
  onUnlock?: () => void;
  onReportIssue?: () => void;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onToggleAlerts?: (showAlerts: boolean) => void;
  isFavorite?: boolean;
  showAlerts?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.89; // Increase height to match Figma

// Constants for swipe button dimensions and thresholds
const UNLOCK_DURATION = 60; // 60 seconds countdown
const SWIPE_BUTTON_WIDTH = 356;
const SWIPE_THUMB_SIZE = 52;
const SWIPE_MAX_DISTANCE = SWIPE_BUTTON_WIDTH - SWIPE_THUMB_SIZE - 4;
const SWIPE_UNLOCK_THRESHOLD = SWIPE_MAX_DISTANCE * 0.6;

// Haptic feedback function
const playHapticFeedback = (isUnlock = true) => {
  try {
    AudioService.playHapticFeedback(isUnlock ? 'UNLOCK' : 'LOCK');
  } catch (error) {
    Vibration.vibrate(isUnlock ? [0, 40, 30, 40] : [0, 30, 30, 30]);
  }
};

// Function to play unlock sound
const playUnlockSound = async () => {
  try {
    await AudioService.playUnlockSound();
  } catch (error) {
    console.error('Error playing unlock sound:', error);
    Vibration.vibrate([0, 40, 30, 40, 30, 40]); // Fall back to vibration
  }
};

// Function to play lock sound
const playLockSound = async () => {
  try {
    await AudioService.playLockSound();
  } catch (error) {
    console.error('Error playing lock sound:', error);
    Vibration.vibrate([0, 30, 20, 30, 20, 30]); // Fall back to vibration
  }
};

const DoorBottomSheet: React.FC<DoorBottomSheetProps> = ({
  visible,
  onClose,
  doorName,
  doorId,
  onUnlock,
  onReportIssue,
  onToggleFavorite,
  onToggleAlerts,
  isFavorite = false,
  showAlerts = true
}) => {
  // State
  const [isInRange] = useState(true); // Placeholder for actual in-range detection 
  const [activeHours] = useState('24/7'); // Placeholder for actual hours
  
  // Animation state and refs
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Add local state for toggles with initial values from props
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
  const [localShowAlerts, setLocalShowAlerts] = useState(showAlerts);
  
  // Sync local state when props change
  useEffect(() => {
    setLocalIsFavorite(isFavorite);
  }, [isFavorite]);
  
  useEffect(() => {
    setLocalShowAlerts(showAlerts);
  }, [showAlerts]);
  
  // Animated values
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Swipe button animation values
  const swipePosition = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const successWidth = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current;

  // Values for swipe-down-to-close
  const pan = useRef(new Animated.Value(0)).current;
  const dismissThreshold = BOTTOM_SHEET_HEIGHT * 0.2;
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);

  // Check door status whenever bottom sheet becomes visible
  useEffect(() => {
    if (visible && doorId) {
      const doorUnlockStatus = DoorTimerService.isDoorUnlocked(doorId);
      setIsUnlocked(doorUnlockStatus);
      console.log(`[DoorBottomSheet] Door ${doorId} opened with unlocked status: ${doorUnlockStatus}`);
      
      // If the door is unlocked, sync countdown with DoorTimerService
      if (doorUnlockStatus) {
        const remainingTime = DoorTimerService.getRemainingUnlockTime(doorId);
        console.log(`[DoorBottomSheet] Door ${doorId} has ${remainingTime}s remaining unlock time, syncing countdown`);
        setCountdown(remainingTime);
        
        // Set timer progress based on remaining time
        const progressValue = remainingTime / UNLOCK_DURATION;
        timerProgress.setValue(progressValue);
      } else {
        // Reset countdown if door is locked
        setCountdown(UNLOCK_DURATION);
      }
      
      // Log internal timer state from DoorTimerService if possible
      console.log(`[DoorBottomSheet] DoorTimerService internal state:`, 
        JSON.stringify(DoorTimerService.getDebugState(doorId)));
    }
  }, [visible, doorId]);

  // Update the countdown and animation ONLY when we're not syncing with DoorTimerService
  // This will effectively be disabled since we're always syncing from the above effect
  // Just keeping this in a simpler form for now to avoid breaking anything
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // SINGLE source of truth - sync with DoorTimerService more frequently for smoother UI
    if (visible && doorId) {
      console.log(`[DoorBottomSheet] Starting frequent sync timer for door ${doorId}`);
      
      interval = setInterval(() => {
        // Always check the door status and time from the service
        const doorUnlockStatus = DoorTimerService.isDoorUnlocked(doorId);
        
        // Update local state based on service state
        if (isUnlocked !== doorUnlockStatus) {
          console.log(`[DoorBottomSheet] Door ${doorId} status changed: ${isUnlocked} -> ${doorUnlockStatus}`);
          setIsUnlocked(doorUnlockStatus);
        }
        
        // Always sync the countdown with service if door is unlocked
        if (doorUnlockStatus) {
          const remainingTime = DoorTimerService.getRemainingUnlockTime(doorId);
          
          // Only log changes to avoid console spam
          if (Math.abs(countdown - Math.floor(remainingTime)) >= 1) {
            console.log(`[DoorBottomSheet] Fast sync countdown: ${countdown}s -> ${Math.floor(remainingTime)}s`);
          }
          
          // Always update countdown with the integer value to avoid visual jumps
          setCountdown(Math.floor(remainingTime));
          
          // Set timer progress based on remaining time - smoother animation
          // Use the precise value for the animation but integer for display
          const progressValue = remainingTime / UNLOCK_DURATION;
          timerProgress.setValue(progressValue);
        } else if (isUnlocked) {
          // If door is locked but we think it's unlocked, reset our state
          setIsUnlocked(false);
          setCountdown(UNLOCK_DURATION);
          resetSwipeButton();
        }
      }, 100); // Update much more frequently for smoother progress bar animation
    }

    return () => {
      if (interval) {
        console.log(`[DoorBottomSheet] Clearing fast sync timer for door ${doorId}`);
        clearInterval(interval);
      }
    };
  }, [visible, doorId, isUnlocked, countdown]);

  useEffect(() => {
    // Only log in dev mode
    if (__DEV__) console.log('[DoorBottomSheet] Effect triggered with visible:', visible);
    if (visible) {
      // Reset the pan position
      pan.setValue(0);
      
      // Animate the bottom sheet up with improved animation settings
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,      // Less bouncy
          friction: 10,     // More damping
          restSpeedThreshold: 0.5, // Settle faster
          restDisplacementThreshold: 0.5, // Settle faster
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate the bottom sheet down with smoother animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: BOTTOM_SHEET_HEIGHT,
          useNativeDriver: true,
          tension: 65,
          friction: 12,
          restSpeedThreshold: 0.5,
          restDisplacementThreshold: 0.5,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Only reset pan value after animation is complete
        pan.setValue(0);
      });
      
      // Only reset visually if the door is truly locked
      if (!doorId || !DoorTimerService.isDoorUnlocked(doorId)) {
        console.log(`[DoorBottomSheet] Door ${doorId} is locked or unknown, resetting swipe button on sheet close`);
        resetSwipeButton();
      } else {
        console.log(`[DoorBottomSheet] Door ${doorId} is still unlocked, skipping reset on sheet close`);
      }
    }
  }, [visible, translateY, opacity, pan, doorId]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);

  // Create a more aggressive panResponder for the drag handle
  const headerPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (__DEV__) console.log('[DoorBottomSheet] Header pan responder granted');
        setIsDraggingHeader(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (__DEV__) console.log('[DoorBottomSheet] Header released', gestureState.dy, 'vs threshold', dismissThreshold);
        setIsDraggingHeader(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          if (__DEV__) console.log('[DoorBottomSheet] Header dismissing');
          Animated.spring(translateY, {
            toValue: BOTTOM_SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 65,
            friction: 12,
            restSpeedThreshold: 0.5, 
            restDisplacementThreshold: 0.5,
          }).start();
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue(0);
          });
        } else {
          if (__DEV__) console.log('[DoorBottomSheet] Header snapping back');
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
            restSpeedThreshold: 0.5,
            restDisplacementThreshold: 0.5,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingHeader(false);
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    });
  }, [pan, onClose, dismissThreshold]);

  // Create a less aggressive panResponder for the main content
  const mainPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isDraggingDown && gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        if (__DEV__) console.log('[DoorBottomSheet] Main pan responder granted');
        setIsDraggingDown(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (__DEV__) console.log('[DoorBottomSheet] Main released', gestureState.dy, 'vs threshold', dismissThreshold);
        setIsDraggingDown(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          if (__DEV__) console.log('[DoorBottomSheet] Main dismissing');
          Animated.spring(translateY, {
            toValue: BOTTOM_SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 65,
            friction: 12,
            restSpeedThreshold: 0.5,
            restDisplacementThreshold: 0.5,
          }).start();
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue(0);
          });
        } else {
          if (__DEV__) console.log('[DoorBottomSheet] Main snapping back');
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
            restSpeedThreshold: 0.5,
            restDisplacementThreshold: 0.5,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingDown(false);
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    });
  }, [pan, onClose, dismissThreshold, isDraggingDown]);

  // Function to handle successful unlock
  const handleSuccessfulUnlock = () => {
    // Set unlocked state
    setIsUnlocked(true);
    setCountdown(UNLOCK_DURATION);
    
    // Play haptic feedback
    playHapticFeedback(true);
    
    // Play unlock sound
    playUnlockSound();
    
    // Reset timer progress to full
    timerProgress.setValue(1);
    
    // Animate thumb to end position
    Animated.spring(swipePosition, {
      toValue: SWIPE_MAX_DISTANCE,
      friction: 7,
      tension: 40,
      useNativeDriver: true
    }).start();
    
    // Animate success background with timing for smooth transition
    Animated.timing(successWidth, {
      toValue: SWIPE_BUTTON_WIDTH,
      duration: 250,
      useNativeDriver: false
    }).start();
    
    // Call onUnlock callback
    if (onUnlock) {
      onUnlock();
    }
  };

  // Function to reset the swipe button with improved animation
  const resetSwipeButton = () => {
    console.log(`[DoorBottomSheet] resetSwipeButton called, doorId: ${doorId}, current isUnlocked: ${isUnlocked}, actual door state: ${doorId ? DoorTimerService.isDoorUnlocked(doorId) : 'unknown'}`);
    
    // Don't reset the UI if the door is still actually unlocked according to DoorTimerService
    if (doorId && DoorTimerService.isDoorUnlocked(doorId) && !visible) {
      console.log(`[DoorBottomSheet] Skipping visual reset because door ${doorId} is still unlocked and sheet is not visible`);
      return;
    }
    
    setIsUnlocked(false);
    setCountdown(UNLOCK_DURATION);
    resetSwipeButton();
  };

  // Swipe to unlock functionality with proper updates to the green progress bar
  const swipeAreaPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isUnlocked,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isUnlocked && gestureState.dx > 1;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        // No haptic feedback on touch - only on success/lock
        swipePosition.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isUnlocked) return;
        
        // Constrain within bounds
        const newPosition = Math.max(0, Math.min(gestureState.dx, SWIPE_MAX_DISTANCE));
        swipePosition.setValue(newPosition);
        
        // Update text opacity
        const opacityValue = Math.max(0, 1 - (newPosition / (SWIPE_MAX_DISTANCE * 0.3)));
        textOpacity.setValue(opacityValue);
        
        // Update success background width - this is critical for the green bar
        const widthProgress = (newPosition / SWIPE_MAX_DISTANCE) * SWIPE_BUTTON_WIDTH;
        successWidth.setValue(widthProgress);
      },
      onPanResponderRelease: (_, gestureState) => {
        swipePosition.flattenOffset();
        setIsDragging(false);
        
        if (isUnlocked) return;
        
        if (gestureState.dx >= SWIPE_UNLOCK_THRESHOLD) {
          handleSuccessfulUnlock();
        } else {
          resetSwipeButton();
        }
      },
      onPanResponderTerminate: () => {
        swipePosition.flattenOffset();
        setIsDragging(false);
        
        if (!isUnlocked) {
          resetSwipeButton();
        }
      }
    });
  }, [isUnlocked, swipePosition, successWidth, textOpacity]);

  // PanResponder for the thumb specifically
  const thumbPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isUnlocked,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isUnlocked && Math.abs(gestureState.dx) > 1;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        // No haptic feedback on touch - just extract offset for position tracking
        swipePosition.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isUnlocked) return;
        
        // Constrain within bounds
        const newPosition = Math.max(0, Math.min(gestureState.dx, SWIPE_MAX_DISTANCE));
        swipePosition.setValue(newPosition);
        
        // Update text opacity
        const opacityValue = Math.max(0, 1 - (newPosition / (SWIPE_MAX_DISTANCE * 0.3)));
        textOpacity.setValue(opacityValue);
        
        // Update success background width - this is critical for the green bar
        const widthProgress = (newPosition / SWIPE_MAX_DISTANCE) * SWIPE_BUTTON_WIDTH;
        successWidth.setValue(widthProgress);
      },
      onPanResponderRelease: (_, gestureState) => {
        swipePosition.flattenOffset();
        setIsDragging(false);
        
        if (isUnlocked) return;
        
        if (gestureState.dx >= SWIPE_UNLOCK_THRESHOLD) {
          handleSuccessfulUnlock();
        } else {
          resetSwipeButton();
        }
      },
      onPanResponderTerminate: () => {
        swipePosition.flattenOffset();
        setIsDragging(false);
        
        if (!isUnlocked) {
          resetSwipeButton();
        }
      }
    });
  }, [isUnlocked, swipePosition, successWidth, textOpacity]);

  const handleFavoriteToggle = (value: boolean) => {
    console.log(`[DoorBottomSheet] handleFavoriteToggle called with value: ${value}`);
    // Update local state immediately
    setLocalIsFavorite(value);
    // Call parent callback
    if (onToggleFavorite) {
      onToggleFavorite(value);
    }
  };

  const handleAlertsToggle = (value: boolean) => {
    console.log(`[DoorBottomSheet] handleAlertsToggle called with value: ${value}`);
    // Update local state immediately
    setLocalShowAlerts(value);
    // Call parent callback
    if (onToggleAlerts) {
      onToggleAlerts(value);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <StatusBar translucent backgroundColor="rgba(19, 21, 21, 0.65)" />
        </Animated.View>
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            transform: [
              { 
                translateY: Animated.add(
                  translateY,
                  pan
                ) 
              }
            ]
          }
        ]}
      >
        {/* Drag handle with aggressive pan responder */}
        <View 
          style={styles.dragBarContainer}
          {...headerPanResponder.panHandlers}
        >
          <View style={styles.dragBar} />
        </View>
        
        {/* The rest of the bottom sheet with a separate pan responder */}
        <View 
          style={{ flex: 1 }}
          {...mainPanResponder.panHandlers}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ChevronLeftIcon size={16} color="#6FDCFA" />
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {doorName}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => setIsDraggingDown(false)}
          >
            {/* Door/Building image - conditionally show appropriate image based on door type */}
            <View style={styles.videoPlaceholder}>
              <View style={styles.doorImageContainer}>
                <Image 
                  source={getDoorImage(doorName)}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="cover"
                />
              </View>
            </View>
            
            {/* Chips container with In Range and Time */}
            <View style={styles.chipContainer}>
              {isInRange && (
                <View style={styles.chip}>
                  <View style={styles.chipIndicator} />
                  <Text style={styles.chipText}>In Range</Text>
                </View>
              )}
              <View style={styles.chip}>
                <Text style={styles.chipText}>{activeHours}</Text>
              </View>
            </View>
            
            {/* Settings Container */}
            <View style={styles.settingsContainer}>
              {/* Show Alerts Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <EmergencyHomeIconSvg size={24} color="#FFFFFF" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingText}>Show Alerts</Text>
                </View>
                <CustomToggle
                  value={localShowAlerts}
                  onValueChange={handleAlertsToggle}
                />
              </View>
              
              {/* Add to Favorites Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <StarIconSvg size={24} color="#FFFFFF" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingText}>Add to Favorites</Text>
                </View>
                <CustomToggle
                  value={localIsFavorite}
                  onValueChange={handleFavoriteToggle}
                />
              </View>
              
              {/* Report Issue Button */}
              <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                <View style={styles.settingIconContainer}>
                  <ErrorIconSvg size={24} color="#FF5A5A" />
                </View>
                <TouchableOpacity 
                  style={styles.settingContent}
                  onPress={onReportIssue}
                >
                  <Text style={styles.reportButtonText}>Report Issue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          {/* Fixed Swipe Button at Bottom */}
          <View style={styles.swipeButtonFooter}>
            <View style={styles.swipeButtonContainer}>
              <View 
                style={[
                  styles.swipeTrack,
                  isUnlocked && styles.swipeTrackUnlocked,
                  isDragging && styles.swipeTrackActive
                ]}
              >
                {!isUnlocked ? (
                  <>
                    {/* Text that fades out during swipe */}
                    <Animated.View
                      style={[
                        styles.swipeTextContainer,
                        { opacity: textOpacity }
                      ]}
                    >
                      <Text style={styles.swipeText}>Swipe to Unlock</Text>
                    </Animated.View>

                    {/* Green progress bar that fills during swipe */}
                    <Animated.View
                      style={[
                        styles.successBackground,
                        { width: successWidth }
                      ]}
                    />

                    {/* Thumb with lock icon */}
                    <Animated.View
                      {...thumbPanResponder.panHandlers}
                      style={[
                        styles.swipeThumb,
                        {
                          transform: [{ translateX: swipePosition }],
                        },
                        isDragging && styles.swipeThumbActive
                      ]}
                    >
                      <LockIconSvg size={32} color="#FFFFFF" />
                    </Animated.View>
                    
                    {/* Track pan responder */}
                    <View 
                      style={styles.swipeTrackTouchable}
                      {...swipeAreaPanResponder.panHandlers} 
                    />
                  </>
                ) : (
                  <>
                    {/* When unlocked - show timer progress bar */}
                    <View style={styles.timerContainerMask}>
                      <Animated.View
                        style={[
                          styles.timerProgressBar,
                          { width: Animated.multiply(timerProgress, SWIPE_BUTTON_WIDTH) }
                        ]}
                      />
                    </View>
                    
                    {/* Unlocked state text */}
                    <View style={styles.unlockTextContainer}>
                      <UnlockIcon width={24} height={24} color="#131515" />
                      <Text style={styles.unlockCountdownText}>
                        Locking in {countdown}s
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19, 21, 21, 0.95)',
    zIndex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#23262D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 2,
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  dragBarContainer: {
    width: '100%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  dragBar: {
    width: 36,
    height: 4,
    backgroundColor: '#404759',
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.2)',
    marginBottom: 0,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 100,
  },
  closeText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_MEDIUM, {
      color: '#6FDCFA',
    }),
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
    letterSpacing: 0.2,
  },
  title: {
    ...applyTypography(UI_TYPOGRAPHY.LABEL_LARGE, {
      color: '#FFFFFF',
    }),
    fontFamily: 'Outfit-Medium',
    textAlign: 'center',
    fontSize: 18,
  },
  placeholder: {
    width: 100,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 16,
  },
  videoPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#1E2021',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    overflow: 'hidden',
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E333D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#717C98',
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
  },
  chipIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6FDCFA',
    marginRight: 8,
  },
  chipText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_SMALL, {
      color: '#FFFFFF',
    }),
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  settingIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: '#FFFFFF',
    }),
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
  },
  toggleSwitch: {
    transform: Platform.OS === 'ios' ? [{ scale: 0.8 }] : [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  reportButtonContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  reportButtonText: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: '#FF5A5A',
    }),
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
  },
  swipeButtonFooter: {
    width: '100%',
    backgroundColor: '#23262D',
  },
  swipeButtonContainer: {
    paddingHorizontal: 17,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#23262D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(70, 78, 97, 0.2)',
  },
  swipeTrack: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(46, 51, 61, 0.35)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(70, 78, 97, 0.35)',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  swipeTrackUnlocked: {
    backgroundColor: 'rgba(195, 255, 121, 0.35)',
    borderColor: 'rgba(195, 255, 121, 0.35)',
  },
  swipeTrackActive: {
    backgroundColor: 'rgba(52, 58, 70, 0.5)',
  },
  swipeTextContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeText: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: '#717C98',
    }),
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  swipeThumb: {
    position: 'absolute',
    left: 2,
    width: 52,
    height: 52,
    backgroundColor: '#1E2021',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  swipeThumbActive: {
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  doorImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  successBackground: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#C3FF79',
    borderRadius: 10,
    left: 0,
    top: 0,
    zIndex: 5,
  },
  timerContainerMask: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    zIndex: 5,
  },
  timerProgressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#C3FF79',
    borderRadius: 0,
    left: 0,
    top: 0,
  },
  unlockTextContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 15,
    gap: 8,
  },
  unlockCountdownText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#131515',
    textAlign: 'center',
  },
  swipeTrackTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
});

export default DoorBottomSheet; 