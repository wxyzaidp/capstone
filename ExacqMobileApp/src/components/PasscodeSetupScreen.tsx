import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Pressable,
  AppState,
} from 'react-native';
import { UI_COLORS } from '../design-system/colors';
import { UI_TYPOGRAPHY, applyTypography } from '../design-system/typography';
import BackspaceIcon from './icons/BackspaceIcon';
import ForwardArrowIcon from './icons/ForwardArrowIcon';
import PasscodeDotIcon from './icons/PasscodeDotIcon';
import ChevronIcon from './icons/ChevronIcon';
import EnableFaceIDScreen from './EnableFaceIDScreen';

interface PasscodeSetupScreenProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (passcode: string, useFaceId: boolean) => void;
}

const { width } = Dimensions.get('window');

// Define screen states for clearer transitions
enum ScreenState {
  CreatePasscode,
  ConfirmPasscode,
  FaceIdPrompt
}

const PasscodeSetupScreen: React.FC<PasscodeSetupScreenProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<ScreenState>(ScreenState.CreatePasscode);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const transitionTimer = useRef<NodeJS.Timeout | null>(null);

  // Cancel any ongoing timers when component unmounts
  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  // Reset states when modal is closed
  useEffect(() => {
    if (!visible) {
      // No delay for closing to avoid any flicker
      setPasscode('');
      setConfirmPasscode('');
      setScreenState(ScreenState.CreatePasscode);
      setError(null);
      setIsTransitioning(false);
      
      // Clear any ongoing timers
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    }
  }, [visible]);

  const handleNumberPress = (num: string) => {
    if (isTransitioning) return;
    
    if (screenState === ScreenState.ConfirmPasscode) {
      if (confirmPasscode.length < 6) {
        setConfirmPasscode(confirmPasscode + num);
      }
    } else if (screenState === ScreenState.CreatePasscode) {
      if (passcode.length < 6) {
        setPasscode(passcode + num);
      }
    }
  };

  const handleBackspace = () => {
    if (isTransitioning) return;
    
    if (screenState === ScreenState.ConfirmPasscode) {
      setConfirmPasscode(confirmPasscode.slice(0, -1));
    } else if (screenState === ScreenState.CreatePasscode) {
      setPasscode(passcode.slice(0, -1));
    }
  };

  const handleContinue = () => {
    // Prevent multiple taps
    if (isTransitioning) return;
    
    if (screenState === ScreenState.CreatePasscode) {
      if (passcode.length === 6) {
        setIsTransitioning(true);
        setScreenState(ScreenState.ConfirmPasscode);
        
        // Reset transitioning state after animation completes
        transitionTimer.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 300); // Increased delay for smoother transition
      }
    } else if (screenState === ScreenState.ConfirmPasscode) {
      if (confirmPasscode.length === 6) {
        if (passcode === confirmPasscode) {
          // Go to Face ID prompt screen
          setIsTransitioning(true);
          setScreenState(ScreenState.FaceIdPrompt);
          
          // Reset transitioning state after animation completes
          transitionTimer.current = setTimeout(() => {
            setIsTransitioning(false);
          }, 300); // Increased delay for smoother transition
        } else {
          // Passcodes don't match
          setError('Passcodes don\'t match. Try again.');
          setConfirmPasscode('');
        }
      }
    }
  };

  const handleGoBack = () => {
    // Prevent multiple taps
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Go back to create passcode screen
    setScreenState(ScreenState.CreatePasscode);
    setConfirmPasscode('');
    setError(null);
    
    // Reset transitioning state after animation completes
    transitionTimer.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Increased delay for smoother transition
  };

  const handleEnableFaceId = () => {
    // Add slight delay before completion to ensure proper transition
    setTimeout(() => {
      onComplete(passcode, true);
    }, 300);
  };

  const handleSkipFaceId = () => {
    // Add slight delay before completion to ensure proper transition
    setTimeout(() => {
      onComplete(passcode, false);
    }, 300);
  };

  // Render the dots for the passcode entry
  const renderDots = (code: string, maxLength: number = 6) => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <View key={index} style={styles.dotWrapper}>
            <PasscodeDotIcon
              filled={index < code.length}
              width={15}
              height={15}
            />
          </View>
        ))}
      </View>
    );
  };

  // Generate number pad buttons
  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['backspace', '0', 'continue']
    ];

    const currentPasscode = screenState === ScreenState.ConfirmPasscode ? confirmPasscode : passcode;
    const isComplete = currentPasscode.length === 6;

    return (
      <View style={styles.numbersGrid}>
        {numbers.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.numberRow}>
            {row.map((item, colIndex) => {
              if (item === 'backspace') {
                return (
                  <Pressable
                    key={`backspace-${rowIndex}-${colIndex}`}
                    style={styles.numberButton}
                    onPress={handleBackspace}
                    disabled={isTransitioning}
                  >
                    {({ pressed }) => (
                      <View style={[
                        styles.numberButtonInner,
                        pressed && styles.numberButtonPressed
                      ]}>
                        <BackspaceIcon color={UI_COLORS.TEXT.PRIMARY} />
                      </View>
                    )}
                  </Pressable>
                );
              } else if (item === 'continue') {
                return (
                  <Pressable
                    key={`continue-${rowIndex}-${colIndex}`}
                    style={styles.numberButton}
                    onPress={isComplete ? handleContinue : undefined}
                    disabled={!isComplete || isTransitioning}
                  >
                    {({ pressed }) => (
                      isComplete && (
                        <View
                          style={[
                            styles.continueButton,
                            pressed && styles.continueButtonPressed,
                            isTransitioning && styles.disabledButton
                          ]}
                        >
                          <ForwardArrowIcon color="#131515" />
                        </View>
                      )
                    )}
                  </Pressable>
                );
              } else {
                return (
                  <Pressable
                    key={`number-${rowIndex}-${colIndex}`}
                    style={styles.numberButton}
                    onPress={() => handleNumberPress(item)}
                    disabled={isTransitioning}
                  >
                    {({ pressed }) => (
                      <View style={[
                        styles.numberButtonInner,
                        pressed && styles.numberButtonPressed
                      ]}>
                        <Text style={styles.numberText}>{item}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              }
            })}
          </View>
        ))}
      </View>
    );
  };

  // Render passcode setup screens (create or confirm)
  const renderPasscodeScreen = () => {
    const isConfirmation = screenState === ScreenState.ConfirmPasscode;
    
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.content}>
          {isConfirmation && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
              disabled={isTransitioning}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          )}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {isConfirmation ? 'Confirm Passcode' : 'Create Passcode'}
            </Text>
            <Text style={[styles.subtitle, error && styles.errorText]}>
              {error || 'Passcode should be 6 digits long'}
            </Text>
          </View>

          {renderDots(isConfirmation ? confirmPasscode : passcode)}
        </View>
        
        <View style={styles.numberPadContainer}>
          {renderNumberPad()}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={UI_COLORS.BACKGROUND.PAGE} />
      <SafeAreaView style={styles.container}>
        {/* Switch between passcode screens and Face ID screen */}
        {screenState === ScreenState.FaceIdPrompt ? (
          <EnableFaceIDScreen 
            visible={true}
            onClose={onClose}
            onEnable={handleEnableFaceId}
            onSkip={handleSkipFaceId}
            isEmbedded={true}
          />
        ) : (
          renderPasscodeScreen()
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  fullScreenContainer: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 80, // Increased from design for better spacing
  },
  title: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    color: UI_COLORS.TEXT.PRIMARY,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: UI_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    gap: 8, // Add gap between dots
  },
  dotWrapper: {
    padding: 5, // Add padding around each dot
  },
  numberPadContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
  numbersGrid: {
    width: 315, // Exact width from Figma
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // Spacing between rows
  },
  numberButton: {
    width: 76, // Exact size from Figma
    height: 76, // Exact size from Figma
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  numberButtonInner: {
    width: 76,
    height: 76,
    borderRadius: 76 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonPressed: {
    backgroundColor: '#1E4B5B', // Dark blue background for pressed state
  },
  numberText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 32,
    lineHeight: 40,
    color: UI_COLORS.TEXT.PRIMARY,
    letterSpacing: -1, // Exact letter spacing from Figma
    textAlign: 'center',
  },
  continueButtonContainer: {
    // Keep the same container size as other number buttons
  },
  continueButton: {
    backgroundColor: '#6FDCFA',
    borderRadius: 8,
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonPressed: {
    backgroundColor: '#B2EEFD',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: UI_COLORS.STATUS.ERROR,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 10,
  },
});

export default PasscodeSetupScreen; 