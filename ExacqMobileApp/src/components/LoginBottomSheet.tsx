import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
  PanResponder,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  KeyboardEvent,
} from 'react-native';
import { UI_COLORS } from '../design-system/colors';
import { UI_TYPOGRAPHY, applyTypography } from '../design-system/typography';
import EyeIcon from './icons/EyeIcon';
import { Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LoginBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

// Custom loading indicator matching the image
const LoadingIndicator = ({ size = 24 }: { size?: number }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200, // Slightly faster rotation to match image
        useNativeDriver: true,
      })
    );
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [spinValue]);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // SVG settings to match the image
  const strokeWidth = size * 0.15; // Thicker stroke width
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * 0.7; // Show 30% of the circle

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Track (background circle) */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(70, 78, 97, 0.35)"
          fill="none"
        />
      </Svg>
      
      {/* Animated indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate: spin }],
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#64DCFA" stopOpacity="1" />
              <Stop offset="1" stopColor="#008BAD" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="url(#grad)"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({
  visible,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'username' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Values for swipe-down-to-close
  const pan = useRef(new Animated.Value(0)).current;
  const dismissThreshold = BOTTOM_SHEET_HEIGHT * 0.2;
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset the pan position
      pan.setValue(0);
      
      // Animate the bottom sheet up
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
          restSpeedThreshold: 0.5,
          restDisplacementThreshold: 0.5,
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Focus the username input after animation completes
        setTimeout(() => {
          usernameInputRef.current?.focus();
        }, 100);
      });
    } else {
      // Animate the bottom sheet down
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
        // Reset pan value and form state after animation
        pan.setValue(0);
        setUsername('');
        setPassword('');
      });
    }
  }, [visible, translateY, opacity, pan]);

  // Add keyboard event monitoring
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        console.log('Keyboard showing:', {
          keyboardHeight: event.endCoordinates.height,
          screenHeight: SCREEN_HEIGHT,
          bottomSheetHeight: BOTTOM_SHEET_HEIGHT,
          platform: Platform.OS,
          keyboardY: event.endCoordinates.screenY,
        });
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        console.log('Keyboard hiding');
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Log layout measurements
  const onBottomSheetLayout = (event: any) => {
    const { height, y } = event.nativeEvent.layout;
    console.log('BottomSheet Layout:', {
      height,
      y,
      bottomSheetHeight: BOTTOM_SHEET_HEIGHT,
      screenHeight: SCREEN_HEIGHT,
    });
  };

  const onButtonSectionLayout = (event: any) => {
    const { height, y } = event.nativeEvent.layout;
    console.log('Button Section Layout:', {
      height,
      y,
      bottomSheetHeight: BOTTOM_SHEET_HEIGHT,
    });
  };

  const handleOverlayPress = () => {
    onClose();
  };

  // Create a panResponder for the drag handle
  const headerPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDraggingHeader(true);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        pan.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      setIsDraggingHeader(false);
      
      if (gestureState.dy > dismissThreshold || gestureState.vy > 0.5) {
        // Dismiss the bottom sheet
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
        // Snap back
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
  });

  const handleLogin = () => {
    if (username && password) {
      setIsLoading(true);
      onLogin(username, password);
    }
  };

  // Add this useEffect to reset loading state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsLoading(false);
    }
  }, [visible]);

  const canLogin = username.length > 0 && password.length > 0;

  const getInputWrapperStyle = (inputName: 'username' | 'password') => {
    const isFocused = focusedInput === inputName;
    return [
      styles.inputWrapper,
      isFocused && styles.inputWrapperFocused,
    ];
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View style={[styles.overlay, { opacity }]} />
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
        {/* Drag handle */}
        <View 
          style={styles.dragBarContainer}
          {...headerPanResponder.panHandlers}
        >
          <View style={styles.dragBar} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 60}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Login</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.scrollContent}>
              <View style={styles.inputContainer}>
                {/* Username input */}
                <View style={getInputWrapperStyle('username')}>
                  <TextInput
                    ref={usernameInputRef}
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={UI_COLORS.TEXT.SECONDARY}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardAppearance="dark"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    blurOnSubmit={false}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    selectionColor={UI_COLORS.PRIMARY.DEFAULT}
                    textAlignVertical="center"
                  />
                </View>

                {/* Password input */}
                <View style={getInputWrapperStyle('password')}>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={UI_COLORS.TEXT.SECONDARY}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardAppearance="dark"
                    returnKeyType="go"
                    onSubmitEditing={() => {
                      if (username && password) {
                        handleLogin();
                      }
                    }}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    selectionColor={UI_COLORS.PRIMARY.DEFAULT}
                    textAlignVertical="center"
                  />
                  <TouchableOpacity 
                    style={styles.visibilityButton}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <EyeIcon color={UI_COLORS.TEXT.SECONDARY} isVisible={isPasswordVisible} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Button Section */}
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={[
                  styles.continueButton,
                  !canLogin && styles.continueButtonDisabled,
                  isLoading && styles.continueButtonLoading
                ]} 
                onPress={handleLogin}
                disabled={!canLogin || isLoading}
              >
                {isLoading ? (
                  <View style={styles.buttonContentContainer}>
                    <LoadingIndicator size={20} />
                    <Text style={styles.continueButtonTextLoading}>Continue</Text>
                  </View>
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  closeButton: {
    width: 100,
  },
  closeText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_MEDIUM, {
      color: '#FF5A5A',
    }),
  },
  title: {
    ...applyTypography(UI_TYPOGRAPHY.LABEL_LARGE, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    textAlign: 'center',
  },
  placeholder: {
    width: 100,
  },
  inputContainer: {
    marginTop: 32,
    gap: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 78, 97, 0.35)',
    borderRadius: 12,
    backgroundColor: 'transparent',
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: UI_COLORS.PRIMARY.DEFAULT,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    color: UI_COLORS.TEXT.PRIMARY,
    ...applyTypography(UI_TYPOGRAPHY.BODY_LARGE),
    textAlignVertical: 'center',
    padding: 0,
  },
  visibilityButton: {
    padding: 16,
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButton: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonLoading: {
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
  },
  continueButtonText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_LARGE, {
      color: UI_COLORS.BACKGROUND.PAGE,
    }),
  },
  continueButtonTextLoading: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_LARGE, {
      color: '#FFFFFF',
    }),
  },
});

export default LoginBottomSheet; 