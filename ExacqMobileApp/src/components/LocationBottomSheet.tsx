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
  PanResponder
} from 'react-native';
import { UI_COLORS, applyTypography, UI_TYPOGRAPHY } from '../design-system';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Svg, { Path } from 'react-native-svg';

// Building Icon for the location items
const BuildingIcon = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 40 36" fill="none">
      <Path
        d="M2 36C0.895431 36 0 35.1046 0 34V2C0 0.895431 0.895431 0 2 0H18C19.1046 0 20 0.895431 20 2V8H38C39.1046 8 40 8.89543 40 10V34C40 35.1046 39.1046 36 38 36H2ZM4 32H8V28H4V32ZM4 24H8V20H4V24ZM4 16H8V12H4V16ZM4 8H8V4H4V8ZM12 32H16V28H12V32ZM12 24H16V20H12V24ZM12 16H16V12H12V16ZM12 8H16V4H12V8ZM20 32H36V12H20V16H24V20H20V24H24V28H20V32ZM28 20V16H32V20H28ZM28 28V24H32V28H28Z"
        fill={color}
      />
    </Svg>
  );
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

interface Location {
  id: string;
  name: string;
  address: string;
}

interface LocationBottomSheetProps {
  visible: boolean;
  locations: Location[];
  selectedLocationId: string;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  visible,
  locations,
  selectedLocationId,
  onClose,
  onSelectLocation
}) => {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Values for swipe-down-to-close
  const pan = useRef(new Animated.Value(0)).current;
  const dismissThreshold = BOTTOM_SHEET_HEIGHT * 0.2;
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);

  useEffect(() => {
    // Only log in dev mode
    if (__DEV__) console.log('[LocationBottomSheet] Effect triggered with visible:', visible);
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
    }
  }, [visible, translateY, opacity, pan]);

  const handleOverlayPress = useCallback(() => {
    onClose();
  }, [onClose]);
  
  // Create a more aggressive panResponder for the drag handle
  const headerPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (__DEV__) console.log('[LocationBottomSheet] Header pan responder granted');
        setIsDraggingHeader(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (__DEV__) console.log('[LocationBottomSheet] Header released', gestureState.dy, 'vs threshold', dismissThreshold);
        setIsDraggingHeader(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          if (__DEV__) console.log('[LocationBottomSheet] Header dismissing');
          // Use a smoother animation when dismissing
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
            // Reset pan after complete
            pan.setValue(0);
          });
        } else {
          if (__DEV__) console.log('[LocationBottomSheet] Header snapping back');
          // Snap back with improved animation
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
        // Only respond to significant downward movement when not scrolling
        return !isDraggingDown && gestureState.dy > 15 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        if (__DEV__) console.log('[LocationBottomSheet] Main pan responder granted');
        setIsDraggingDown(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (__DEV__) console.log('[LocationBottomSheet] Main released', gestureState.dy, 'vs threshold', dismissThreshold);
        setIsDraggingDown(false);
        
        if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
          if (__DEV__) console.log('[LocationBottomSheet] Main dismissing');
          // Use a smoother animation when dismissing
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
            // Reset pan after complete
            pan.setValue(0);
          });
        } else {
          if (__DEV__) console.log('[LocationBottomSheet] Main snapping back');
          // Snap back with improved animation
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

  const renderLocationItem = (location: Location) => {
    const isSelected = location.id === selectedLocationId;
    
    return (
      <TouchableOpacity
        key={location.id}
        style={styles.locationItem}
        onPress={() => onSelectLocation(location)}
      >
        <BuildingIcon size={24} color="#FFFFFF" />
        <View style={styles.locationContent}>
          <Text 
            style={styles.locationTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location.name}
          </Text>
          <Text 
            style={styles.locationAddress}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {location.address}
          </Text>
        </View>
        <View style={styles.radioContainer}>
          {isSelected ? (
            <View style={styles.radioChecked}>
              <View style={styles.radioInner} />
            </View>
          ) : (
            <View style={styles.radioUnchecked} />
          )}
        </View>
      </TouchableOpacity>
    );
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
              { translateY: Animated.add(translateY, pan) }
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
              <Text 
                style={styles.closeText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Close
              </Text>
            </TouchableOpacity>
            <Text 
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Sites
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.locationList}>
            {locations.map(renderLocationItem)}
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
  },
  dragBarContainer: {
    width: '100%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
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
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
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
    fontFamily: 'Outfit',
    fontWeight: '500',
    fontSize: 18,
    textAlign: 'center',
  },
  placeholder: {
    width: 100,
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  locationContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  locationTitle: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_LARGE, {
      color: '#FFFFFF',
    }),
    fontWeight: '500',
    marginBottom: 4,
    flexWrap: 'nowrap',
  },
  locationAddress: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_SMALL, {
      color: '#B6BDCD',
    }),
    fontWeight: '400',
    flexWrap: 'nowrap',
  },
  radioContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#717C98',
  },
  radioChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6FDCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6FDCFA',
  },
});

export default LocationBottomSheet; 