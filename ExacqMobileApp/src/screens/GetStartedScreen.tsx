import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar, Platform, SafeAreaView } from 'react-native';
import { UI_COLORS } from '../design-system/colors';
import { TYPOGRAPHY, applyTypography } from '../design-system/typography';
import { SvgXml } from 'react-native-svg';
import LoginBottomSheet from '../components/LoginBottomSheet';

interface GetStartedScreenProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

const { width, height } = Dimensions.get('window');

// Background color from Figma design - #1E2021
const BACKGROUND_COLOR = UI_COLORS.BACKGROUND.PAGE;

// SVG with blur effect
const glowSvg = `
<svg width="390" height="567" viewBox="0 0 390 567" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.1" x="-87.728" y="0.771973" width="565.456" height="565.456" rx="282.728" fill="url(#paint0_radial_226_5509)"/>
<defs>
<radialGradient id="paint0_radial_226_5509" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(195 283.5) rotate(90) scale(282.728)">
<stop stop-color="#64DCFA"/>
<stop offset="0.514423" stop-color="#4A96AA"/>
<stop offset="1" stop-color="#1E2021"/>
</radialGradient>
</defs>
</svg>
`;

const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  onGetStarted,
  onLearnMore,
}) => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);

  // Configure status bar when component mounts
  useEffect(() => {
    // Set status bar to light content (white text) for dark background
    StatusBar.setBarStyle('light-content', true);
    
    if (Platform.OS === 'android') {
      // For Android, explicitly set status bar background color
      StatusBar.setBackgroundColor(BACKGROUND_COLOR);
      StatusBar.setTranslucent(false);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    // Handle login logic here
    console.log('Login attempt:', { username, password });
  };

  const handleVerify = (otp: string) => {
    console.log('OTP Verified:', otp);
    // Here you would typically make an API call to verify the OTP
    // and handle the response accordingly
  };

  // Handle passcode setup
  const handlePasscodeSet = (passcode: string) => {
    console.log('Passcode set:', passcode);
    // Here you would store the passcode securely and navigate to the app's main screens
    onGetStarted(); // Navigate to the main app
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#171925" barStyle="light-content" />
      <View style={styles.container}>
        {/* Background Glow with SVG */}
        <View style={styles.backgroundContainer}>
          <SvgXml xml={glowSvg} width={width} height={height} />
        </View>

        <View style={styles.contentContainer}>
          {/* Content wrapper for image and text */}
          <View style={styles.contentWrapper}>
            {/* Hand with keycard illustration */}
            <View style={styles.illustrationContainer}>
              <Image 
                source={require('../assets/images/Get Started.png')} 
                style={{width: 360, height: 360}}
                resizeMode="contain"
              />
            </View>
            
            {/* Heading Text */}
            <View style={styles.textContainer}>
              <Text style={styles.headingText}>
                Secure access at{'\n'}
                your fingertips.
              </Text>
              <Text style={styles.subText}>
                Link your device to get started.
              </Text>
            </View>
          </View>
          
          {/* Bottom buttons section */}
          <View style={styles.buttonContainer}>
            {/* Primary Get Started button */}
            <TouchableOpacity 
              style={styles.getStartedButton} 
              onPress={() => setIsLoginVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            {/* Learn more section */}
            <View style={styles.learnMoreContainer}>
              <Text style={styles.accessText}>
                Haven't been granted access?
              </Text>
              <TouchableOpacity
                onPress={onLearnMore}
                activeOpacity={0.8}
              >
                <Text style={styles.learnMoreText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* LoginBottomSheet with OTP verification flow */}
        <LoginBottomSheet
          visible={isLoginVisible}
          onClose={() => setIsLoginVisible(false)}
          onLogin={handleLogin}
          onVerify={handleVerify}
          onPasscodeSet={handlePasscodeSet}
        />
      </View>
      
      {/* iOS home indicator fix */}
      {Platform.OS === 'ios' && (
        <View style={styles.homeIndicatorFix} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contentWrapper: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  illustrationContainer: {
    width: 360,
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 24,
  },
  headingText: {
    color: UI_COLORS.TEXT.PRIMARY,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Outfit',
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 8,
  },
  subText: {
    color: UI_COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '400',
    lineHeight: 24,
  },
  buttonContainer: {
    width: width - 32, // Full width minus padding
    alignItems: 'center',
    gap: 32,
    paddingBottom: 32,
  },
  getStartedButton: {
    backgroundColor: UI_COLORS.PRIMARY.DEFAULT, // #64DCFA - Accent blue
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    ...applyTypography(TYPOGRAPHY.BUTTON_LARGE, {
      color: BACKGROUND_COLOR, // #1E2021 - Dark background color for button text
    }),
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessText: {
    ...applyTypography(TYPOGRAPHY.BODY_MEDIUM, {
      color: UI_COLORS.TEXT.SECONDARY, // #B6BDCD - Light gray text
    }),
  },
  learnMoreText: {
    ...applyTypography(TYPOGRAPHY.BUTTON_SMALL, {
      color: UI_COLORS.PRIMARY.DEFAULT, // #64DCFA - Accent blue
    }),
  },
  homeIndicatorFix: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 34, // Home indicator height
    backgroundColor: BACKGROUND_COLOR,
  },
});

export default GetStartedScreen; 