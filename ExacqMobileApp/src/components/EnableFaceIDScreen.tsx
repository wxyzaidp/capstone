import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { UI_COLORS } from '../design-system/colors';
import * as LocalAuthentication from 'expo-local-authentication';

// Use require for local images
const faceIdImage = require('../../assets/images/face-id-recognition.png');

interface EnableFaceIDScreenProps {
  visible: boolean;
  onClose: () => void;
  onEnable: () => void;
  onSkip: () => void;
  // Optional prop to indicate if this component is embedded in another screen
  isEmbedded?: boolean;
}

const { height } = Dimensions.get('window');

// Set this to false to ensure real biometric authentication happens
const FORCE_ENABLE_BIOMETRIC = false;

const EnableFaceIDScreen: React.FC<EnableFaceIDScreenProps> = ({
  visible,
  onClose,
  onEnable,
  onSkip,
  isEmbedded = false,
}) => {
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if biometric authentication is available on this device
    if (visible) {
      checkBiometricSupport();
    }
  }, [visible]);

  const checkBiometricSupport = async () => {
    try {
      // In development mode with forced enable, pretend biometrics are supported
      if (__DEV__ && FORCE_ENABLE_BIOMETRIC) {
        setBiometricSupported(true);
        setBiometricType('Face ID');
        return;
      }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        
        setBiometricSupported(enrolled);
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
      } else {
        setBiometricSupported(false);
      }
    } catch (error) {
      console.log('Error checking biometric support:', error);
      setBiometricSupported(false);
    }
  };

  const handleEnable = async () => {
    // Prevent multiple taps
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (!biometricSupported) {
      Alert.alert(
        `${biometricType} Not Available`,
        `${biometricType} is not set up on your device. Please set it up in your device settings.`,
        [{ 
          text: 'OK', 
          onPress: () => {
            onSkip();
            setIsTransitioning(false);
          }
        }]
      );
      return;
    }

    // Show the permission modal instead of authenticating
    setShowPermissionModal(true);
    setIsTransitioning(false);
  };

  const handlePermissionResponse = (granted: boolean) => {
    setShowPermissionModal(false);
    
    if (granted) {
      onEnable();
    } else {
      onSkip();
    }
  };

  const handleSkip = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Increased delay to prevent screen flicker and match other transitions
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  // Content for the Face ID setup screen
  const renderContent = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={faceIdImage}
            style={styles.faceIdImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{`Enable ${biometricType}`}</Text>
          <Text style={styles.subtitle}>
            {`${biometricType} is a convenient method of signing into your account`}
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.enableButton, isTransitioning && styles.disabledButton]} 
          onPress={handleEnable}
          disabled={isTransitioning}
        >
          <Text style={styles.enableButtonText}>Enable</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.laterButton} 
          onPress={handleSkip}
          disabled={isTransitioning}
        >
          <Text style={[
            styles.laterButtonText, 
            isTransitioning && styles.disabledText
          ]}>Maybe later</Text>
        </TouchableOpacity>
      </View>

      {/* System-like permission modal */}
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.systemModal}>
            <View style={styles.systemModalContent}>
              <Text style={styles.systemModalTitle}>
                Do you want to allow{'\n'}"Exacq" to use Face ID?
              </Text>
              <Text style={styles.systemModalSubtitle}>
                Use Face ID instead of a{'\n'}password to access your{'\n'}account.
              </Text>
            </View>
            <View style={styles.systemModalButtonsContainer}>
              <TouchableOpacity 
                style={styles.dontAllowButton} 
                onPress={() => handlePermissionResponse(false)}
              >
                <Text style={styles.dontAllowText}>Don't Allow</Text>
              </TouchableOpacity>
              <View style={styles.buttonDivider} />
              <TouchableOpacity 
                style={styles.allowButton} 
                onPress={() => handlePermissionResponse(true)}
              >
                <Text style={styles.allowText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  // If this component is embedded, render the content directly
  if (isEmbedded) {
    return visible ? renderContent() : null;
  }

  // Otherwise, wrap the content in a modal
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleSkip}
    >
      <StatusBar barStyle="light-content" backgroundColor={UI_COLORS.BACKGROUND.PAGE} />
      {renderContent()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  faceIdImage: {
    width: 360,
    height: 360,
  },
  textContainer: {
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#B6BDCD',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 32,
  },
  enableButton: {
    backgroundColor: '#6FDCFA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  enableButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#131515',
  },
  laterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  laterButtonText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#6FDCFA',
    letterSpacing: 0.2,
  },
  disabledText: {
    opacity: 0.7,
  },
  // System modal styles - Dark mode
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemModal: {
    width: 273,
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  systemModalContent: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  systemModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  systemModalSubtitle: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  systemModalButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(90, 90, 90, 0.75)',
  },
  dontAllowButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAllowText: {
    color: '#0a84ff',
    fontSize: 17,
    fontWeight: '400',
  },
  buttonDivider: {
    width: 0.5,
    backgroundColor: 'rgba(90, 90, 90, 0.75)',
  },
  allowButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allowText: {
    color: '#0a84ff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default EnableFaceIDScreen; 