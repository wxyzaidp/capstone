import React, { useCallback, useEffect, useState } from 'react';
import { /* SafeAreaView, */ StyleSheet, View, Platform } from 'react-native';
import { UI_COLORS } from './src/design-system/colors';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts, 
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';
import AudioService from './src/utils/AudioService';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define consistent background colors
const BACKGROUND_COLOR = UI_COLORS.BACKGROUND.PAGE; // #1E2021 - Main screens background
const TOPBAR_COLOR = UI_COLORS.BACKGROUND.CARD; // #23262D - Card/Navbar background

// Create a custom theme based on DarkTheme
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: BACKGROUND_COLOR, // Use our specific page background
    card: BACKGROUND_COLOR, // Use page background for cards too, ensuring consistency
    // Keep other dark theme colors (text, border, etc.)
  },
};

const App = () => {
  const insets = useSafeAreaInsets();
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Outfit': Outfit_400Regular,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
  });

  // State to track app ready state
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize audio service
  useEffect(() => {
    // Load sound resources
    const initAudio = async () => {
      try {
        await AudioService.initialize();
        console.log('Audio service initialized');
      } catch (error) {
        console.error('Failed to initialize AudioService:', error);
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      AudioService.cleanup();
      console.log('Audio service cleaned up');
    };
  }, []);

  // Prepare other resources
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        console.log('Preparing app resources...');
        
        // Artificially delay for a smoother splash screen experience
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error preparing app resources:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        console.log('App ready!');
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
      console.log('Splash screen hidden, app rendering');
      
      // Log available fonts for debugging
      console.log('Available font families:');
      console.log('Outfit font loaded as:', {
        'Outfit': Outfit_400Regular !== undefined,
        'Outfit-Regular': Outfit_400Regular !== undefined,
        'Outfit-Medium': Outfit_500Medium !== undefined,
        'Outfit-SemiBold': Outfit_600SemiBold !== undefined,
        'Outfit-Bold': Outfit_700Bold !== undefined,
      });
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    console.log('App not ready yet, showing splash screen', { appIsReady, fontsLoaded });
    return null;
  }

  return (
    <NavigationContainer theme={CustomDarkTheme}>
      <View style={styles.root}>
        {/* Re-add explicit background view for Status Bar area */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: BACKGROUND_COLOR, zIndex: -1 }} />
        
        {/* Main content area - use SAContext SafeAreaView with edges */}
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <View style={styles.content} onLayout={onLayoutRootView}>
            <AppNavigator />
          </View>
        </SafeAreaView>

        {/* Re-add explicit background view for Home Indicator area */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: BACKGROUND_COLOR, zIndex: -1 }} />
      </View>
    </NavigationContainer>
  );
};

// Root provider needs to be outside NavigationContainer
const RootApp = () => (
  <SafeAreaProvider>
    {/* Wrap the entire app content with GestureHandlerRootView */}
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Re-add global StatusBar */}
      <StatusBar style="light" backgroundColor={BACKGROUND_COLOR} />
      <App />
    </GestureHandlerRootView>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent', // Set back to transparent
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Set back to transparent
  },
  content: {
    flex: 1,
    // Background comes from navigator/theme
  },
});

export default RootApp; 