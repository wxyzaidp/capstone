import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
  Vibration
} from 'react-native';
import { UI_RADIUS } from '../design-system';
import * as Haptics from 'expo-haptics';

interface ToastProps {
  visible: boolean;
  message: string;
  onDismiss?: () => void; 
  duration?: number; // Auto-hide duration in ms, if not provided toast will stay until dismissed
  showDismissButton?: boolean;
  hapticFeedback?: boolean; // Flag to enable/disable haptic feedback
  hapticType?: 'success' | 'warning' | 'error'; // Type of haptic feedback
}

const Toast: React.FC<ToastProps> = ({ 
  visible, 
  message, 
  onDismiss, 
  duration = 3000, // Default 3 seconds
  showDismissButton = true,
  hapticFeedback = true,
  hapticType = 'success'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;
  const hasTriggeredHaptic = useRef(false);
  
  // Reset the haptic trigger ref when visibility changes to false
  useEffect(() => {
    if (!visible) {
      hasTriggeredHaptic.current = false;
    }
  }, [visible]);
  
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Trigger haptic feedback when toast becomes visible
      if (hapticFeedback && !hasTriggeredHaptic.current) {
        triggerHapticFeedback();
        hasTriggeredHaptic.current = true;
      }
      
      // Auto-hide after duration if set
      if (duration > 0 && onDismiss) {
        const timer = setTimeout(() => {
          handleHide();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations when not visible
      fadeAnim.setValue(0);
      translateY.setValue(100);
    }
  }, [visible]);
  
  const triggerHapticFeedback = () => {
    try {
      // Try using Expo Haptics first
      try {
        switch (hapticType) {
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          default:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (hapticError) {
        console.log('Expo Haptics failed, falling back to Vibration API:', hapticError);
        // Fall back to basic vibration if Haptics fails
        switch (hapticType) {
          case 'success':
            Vibration.vibrate(40); // Short vibration for success
            break;
          case 'warning':
            Vibration.vibrate([40, 30, 40]); // Pattern for warning
            break;
          case 'error':
            Vibration.vibrate([40, 30, 40, 30, 40]); // Longer pattern for error
            break;
          default:
            Vibration.vibrate(40);
        }
      }
    } catch (error) {
      console.log('Haptic feedback failed:', error);
    }
  };
  
  const handleHide = () => {
    // Hide animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateY }]
        }
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconTextWrapper}>
          <Text style={styles.message}>{message}</Text>
        </View>
        
        {showDismissButton && (
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleHide}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    width: width - 32, // 16px padding on each side
    shadowColor: 'rgba(35, 38, 45, 0.35)',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#23262D',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  iconTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  message: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    flex: 1,
  },
  dismissButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#64DCFA',
    fontSize: 12,
    fontFamily: 'Outfit-SemiBold',
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  }
});

export default Toast; 