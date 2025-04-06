import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Check Icon for active state
const CheckIcon = ({ color = '#FFFFFF' }) => {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path
        d="M4.5 8L9 3.5L10 4.5L4.5 10L2 7.5L3 6.5L4.5 8Z"
        fill={color}
      />
    </Svg>
  );
};

interface CustomToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const CustomToggle: React.FC<CustomToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  // Keep a local state - this ensures the toggle always visually updates
  const [localValue, setLocalValue] = useState(value);
  
  // Track if component is mounted
  const isMounted = useRef(true);
  
  // Sync with external value when it changes
  useEffect(() => {
    console.log(`[CustomToggle] External value changed to: ${value}`);
    setLocalValue(value);
  }, [value]);
  
  // Animation value - using a ref so it persists between renders
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  
  // Function to animate the toggle
  const animateToggle = (toValue: number) => {
    console.log(`[CustomToggle] Animating to: ${toValue}`);
    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  // Animate whenever local value changes
  useEffect(() => {
    console.log(`[CustomToggle] Local value changed to: ${localValue}`);
    animateToggle(localValue ? 1 : 0);
  }, [localValue]);
  
  // Run on mount and cleanup on unmount
  useEffect(() => {
    console.log(`[CustomToggle] Mounted with value: ${value}`);
    isMounted.current = true;
    
    return () => {
      console.log(`[CustomToggle] Unmounting with value: ${localValue}`);
      isMounted.current = false;
    };
  }, []);

  const handlePress = () => {
    if (disabled) return;
    
    const newValue = !localValue;
    console.log(`[CustomToggle] Press detected: ${localValue} -> ${newValue}`);
    
    // First update local state for immediate visual feedback
    setLocalValue(newValue);
    
    // Then notify parent with callback
    onValueChange(newValue);
  };

  const thumbPosition = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20], // Distance to travel
  });

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <View
        style={[
          styles.track,
          localValue ? styles.trackActive : styles.trackInactive,
          disabled && styles.trackDisabled,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            localValue ? styles.thumbActive : styles.thumbInactive,
            disabled && styles.thumbDisabled,
            { transform: [{ translateX: thumbPosition }] }
          ]}
        >
          {localValue && <CheckIcon />}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0, // Remove padding to eliminate hit area
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 100,
    paddingHorizontal: 2,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(70, 78, 97, 0.35)',
  },
  trackActive: {
    backgroundColor: '#6FDCFA',
    borderColor: 'rgba(70, 78, 97, 0.35)',
  },
  trackInactive: {
    backgroundColor: '#717C98',
    borderColor: 'rgba(70, 78, 97, 0.35)',
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    position: 'absolute',
    left: 2,
    width: 22,
    height: 22,
    borderRadius: 120,
    backgroundColor: '#1E2021',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  thumbActive: {},
  thumbInactive: {},
  thumbDisabled: {
    opacity: 0.5,
  },
});

export default CustomToggle; 