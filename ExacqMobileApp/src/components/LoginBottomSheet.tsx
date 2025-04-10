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
import PasscodeSetupScreen from './PasscodeSetupScreen';

interface LoginBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
  onVerify: (otp: string) => void;
  onPasscodeSet?: (passcode: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

// Custom loading indicator
const LoadingIndicator = ({ size = 24 }: { size?: number }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
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

  const strokeWidth = size * 0.15;
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * 0.7;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
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

// Completely fresh input field implementation
const FreshTextInput = ({
  label,
  value,
  onChangeText,
  secure = false,
  returnKeyType = 'next',
  onSubmit,
  testID,
  autoFocus = false,
  onToggleVisibility,
  isVisible,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmit?: () => void;
  testID?: string;
  autoFocus?: boolean;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
  autoComplete?: 'username' | 'password' | 'off';
}) => {
  // Local state for this field only
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Clear selection on blur to prevent highlight issues
  const clearSelection = () => {
    if (inputRef.current) {
      inputRef.current.setNativeProps({
        selection: { start: 0, end: 0 }
      });
    }
  };
  
  const handleSubmit = () => {
    clearSelection();
    
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Small delay to ensure proper event order
    if (onSubmit) {
      setTimeout(onSubmit, 50);
    }
  };
  
  // Handle focus styling
  const showFloatingLabel = focused || value.length > 0;
  
  useEffect(() => {
    // Auto focus if needed, but with a delay to ensure component is fully mounted
    if (autoFocus) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <View style={[
      freshStyles.container,
      focused ? freshStyles.containerFocused : null,
    ]}>
      {showFloatingLabel && (
        <Text style={freshStyles.label}>{label}</Text>
      )}
      
      <TextInput
        ref={inputRef}
        style={[
          freshStyles.input,
          showFloatingLabel ? freshStyles.inputWithLabel : null,
        ]}
        placeholder={showFloatingLabel ? '' : label}
        placeholderTextColor="#B6BDCD"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure && !isVisible}
        returnKeyType={returnKeyType}
        blurOnSubmit={true}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance="dark"
        textContentType={secure ? 'password' : 'username'}
        autoComplete={autoComplete}
        testID={testID}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          clearSelection();
        }}
        onSubmitEditing={handleSubmit}
        selectionColor={UI_COLORS.PRIMARY.DEFAULT}
      />
      
      {secure && onToggleVisibility && (
        <TouchableOpacity 
          style={freshStyles.visibilityToggle} 
          onPress={onToggleVisibility} 
          activeOpacity={0.7}
        >
          <EyeIcon color="#B6BDCD" isVisible={isVisible || false} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const freshStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#717C98',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  containerFocused: {
    borderColor: UI_COLORS.PRIMARY.DEFAULT,
  },
  label: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#B6BDCD',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    paddingVertical: 0,
  },
  inputWithLabel: {
    paddingTop: 16,
  },
  visibilityToggle: {
    padding: 8,
  },
});

const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({
  visible,
  onClose,
  onLogin,
  onVerify,
  onPasscodeSet,
}) => {
  // ====== COMPLETELY FRESH IMPLEMENTATION ======
  // Core state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP state
  const [isOtpView, setIsOtpView] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
  
  // Passcode setup state
  const [isPasscodeSetupVisible, setIsPasscodeSetupVisible] = useState(false);

  // Animation values
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const dismissThreshold = BOTTOM_SHEET_HEIGHT * 0.2;
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);

  // Reset state when sheet is closed
  useEffect(() => {
    if (!visible) {
      // Reset all states when closing
      setIsOtpView(false);
      setIsLoading(false);
      setIsVerifyLoading(false);
      setOtp(Array(6).fill(''));
      setActiveIndex(0);
      setIsPasscodeSetupVisible(false);
    }
  }, [visible]);

  // Animation for showing/hiding the bottom sheet
  useEffect(() => {
    if (visible) {
      pan.setValue(0);
      
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
      ]).start();
    } else {
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
        pan.setValue(0);
        setUsername('');
        setPassword('');
      });
    }
  }, [visible, translateY, opacity, pan]);

  // Focus OTP input when entering OTP view
  useEffect(() => {
    if (isOtpView && visible) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    }
  }, [isOtpView, visible]);

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
      
      // Simulate login API call
      setTimeout(() => {
        setIsLoading(false);
        onLogin(username, password);
        
        requestAnimationFrame(() => {
          setIsOtpView(true);
        });
      }, 1500);
    }
  };

  const handleVerify = () => {
    if (otp.every(digit => digit !== '')) {
      setIsVerifyLoading(true);
      
      // Simulate verification process
      setTimeout(() => {
        setIsVerifyLoading(false);
        onVerify(otp.join(''));
        
        // First close the bottom sheet
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
          // After animations complete, close the bottom sheet and show passcode screen
          onClose();
          
          // Wait for the animation to finish before showing passcode
          setTimeout(() => {
            setIsPasscodeSetupVisible(true);
          }, 50);
        });
      }, 1500);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    // Sanitize input to only allow digits
    const sanitizedText = text.replace(/[^0-9]/g, '');
    
    if (sanitizedText.length > 1) {
      // Handle paste of the entire code
      const pastedText = sanitizedText.slice(0, 6);
      const newOtp = [...otp];
      
      for (let i = 0; i < pastedText.length; i++) {
        if (i < 6) {
          newOtp[i] = pastedText[i];
        }
      }
      
      setOtp(newOtp);
      
      // Stay on the last field after pasting
      if (pastedText.length >= 6) {
        setActiveIndex(5);
        setTimeout(() => {
          inputRefs.current[5]?.focus();
        }, 10);
      } else {
        const nextIndex = Math.min(pastedText.length, 5);
        setActiveIndex(nextIndex);
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 50);
      }
    } else {
      // Handle single character input
      const newOtp = [...otp];
      
      // Always update the current field
      newOtp[index] = sanitizedText;
      setOtp(newOtp);
      
      if (sanitizedText !== '') {
        if (index < 5) {
          // Move to next input
          setActiveIndex(index + 1);
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus();
          }, 10);
        } else if (index === 5) {
          // Last digit entered - keep focus on last field
          setActiveIndex(5);
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Move to previous input when backspace is pressed on an empty input
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
      
      // Clear previous input
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleResendCode = () => {
    // Logic to resend code
    console.log('Resending code to', username);
  };

  // Handle passcode setup completion
  const handlePasscodeComplete = (passcode: string) => {
    if (onPasscodeSet) {
      onPasscodeSet(passcode);
    }
    setIsPasscodeSetupVisible(false);
    onClose();
  };

  const canLogin = username.length > 0 && password.length > 0;
  const canVerify = otp.every(digit => digit !== '') && !isVerifyLoading;

  // Button text based on view state
  const getButtonText = () => isOtpView ? 'Verify' : 'Continue';

  // Button action based on view state
  const handleButtonPress = () => isOtpView ? handleVerify() : handleLogin();

  // Button disabled state
  const isButtonDisabled = isOtpView ? !canVerify : !canLogin || isLoading;

  // Button style
  const getButtonStyle = () => {
    if (isOtpView) {
      if (isVerifyLoading) {
        return styles.continueButtonLoading;
      }
      return !canVerify ? styles.continueButtonDisabled : styles.continueButton;
    } else {
      if (isLoading) {
        return styles.continueButtonLoading;
      }
      return !canLogin ? styles.continueButtonDisabled : styles.continueButton;
    }
  };

  return (
    <>
      <Modal transparent visible={visible} animationType="none">
        <TouchableWithoutFeedback onPress={onClose}>
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
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 80}
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
                {isOtpView ? (
                  // OTP Verification View
                  <View style={styles.otpContent}>
                    <View style={styles.otpTitleContainer}>
                      <Text style={styles.verifyTitle}>Verify your email</Text>
                      <Text style={styles.verifySubtitle}>
                        Enter the code sent to user@example.com
                      </Text>
                    </View>

                    <View style={styles.otpContainer}>
                      {otp.map((digit, index) => (
                        <View key={index} style={styles.otpInputWrapper}>
                          <TextInput
                            ref={(ref: TextInput | null) => {
                              inputRefs.current[index] = ref;
                            }}
                            style={[
                              styles.otpInput,
                              activeIndex === index && styles.otpInputActive
                            ]}
                            value={digit}
                            onChangeText={(text) => handleChangeText(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus={index === 0 && isOtpView}
                            selectionColor={UI_COLORS.PRIMARY.DEFAULT}
                          />
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendCode}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.resendText}>Resend code</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // COMPLETELY NEW LOGIN VIEW
                  <View style={styles.loginContent}>
                    <View style={styles.inputContainer}>
                      {/* Username input with fresh implementation */}
                      <FreshTextInput
                        label="Username"
                        value={username}
                        onChangeText={setUsername}
                        returnKeyType="next"
                        autoFocus={true}
                        onSubmit={() => {}} // Intentionally empty
                        testID="fresh-username-input"
                        autoComplete="username"
                      />

                      {/* Password input with fresh implementation */}
                      <FreshTextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secure={true}
                        returnKeyType="go"
                        onSubmit={() => {
                          if (canLogin) {
                            handleLogin();
                          }
                        }}
                        onToggleVisibility={() => setShowPassword(!showPassword)}
                        isVisible={showPassword}
                        testID="fresh-password-input"
                        autoComplete="password"
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Button Section */}
              <View style={styles.buttonSection}>
                <TouchableOpacity 
                  style={getButtonStyle()} 
                  onPress={handleButtonPress}
                  disabled={isButtonDisabled}
                >
                  {isOtpView ? (
                    isVerifyLoading ? (
                      <View style={styles.buttonContentContainer}>
                        <LoadingIndicator size={20} />
                        <Text style={styles.continueButtonTextLoading}>Verifying</Text>
                      </View>
                    ) : (
                      <Text style={styles.continueButtonText}>{getButtonText()}</Text>
                    )
                  ) : (
                    isLoading ? (
                      <View style={styles.buttonContentContainer}>
                        <LoadingIndicator size={20} />
                        <Text style={styles.continueButtonTextLoading}>{getButtonText()}</Text>
                      </View>
                    ) : (
                      <Text style={styles.continueButtonText}>{getButtonText()}</Text>
                    )
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
      
      {/* Passcode Setup Screen */}
      <PasscodeSetupScreen
        visible={isPasscodeSetupVisible}
        onClose={() => setIsPasscodeSetupVisible(false)}
        onComplete={handlePasscodeComplete}
      />
    </>
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
    paddingTop: 16,
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
  loginContent: {
    flex: 1,
  },
  otpContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  inputContainer: {
    marginTop: 32,
    gap: 24,
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: UI_COLORS.BACKGROUND.CARD,
  },
  continueButton: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonDisabled: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    opacity: 0.5,
  },
  continueButtonLoading: {
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    marginLeft: 8,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otpTitleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verifyTitle: {
    ...applyTypography(UI_TYPOGRAPHY.SECTION_TITLE, {
      color: UI_COLORS.TEXT.PRIMARY,
    }),
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  verifySubtitle: {
    ...applyTypography(UI_TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.SECONDARY,
    }),
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  otpInputWrapper: {
    width: 48,
    height: 56,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#717C98',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Outfit-Regular',
    color: UI_COLORS.TEXT.PRIMARY,
  },
  otpInputActive: {
    borderColor: UI_COLORS.PRIMARY.DEFAULT,
  },
  resendButton: {
    alignSelf: 'center',
  },
  resendText: {
    ...applyTypography(UI_TYPOGRAPHY.BUTTON_SMALL, {
      color: UI_COLORS.PRIMARY.DEFAULT,
    }),
  },
});

export default LoginBottomSheet; 