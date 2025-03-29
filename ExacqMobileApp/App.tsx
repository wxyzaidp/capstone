import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { UI_COLORS } from './src/design-system/colors';
import HomeScreen from './src/screens/HomeScreen';
import AccessScreen from './src/screens/AccessScreen';
import VisitorScreen from './src/screens/VisitorScreen';
import BottomNavigation from './src/components/BottomNavigation';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { 
  useFonts, 
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';
import AudioService from './src/utils/AudioService';

// Tab constants
const TABS = {
  HOME: 'home',
  DOOR: 'door',
  VISITOR: 'visitor',
  MORE: 'more'
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.HOME);

  const [fontsLoaded, fontError] = useFonts({
    'Outfit': Outfit_400Regular,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
  });

  useEffect(() => {
    // Log font loading status
    console.log('Fonts loaded:', fontsLoaded);
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
    
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          // Additional SF Pro Text font could be loaded here if needed
        });
        console.log('Additional fonts loaded successfully');
        
        // Initialize the AudioService
        try {
          await AudioService.initialize();
          console.log('AudioService initialized successfully during app startup');
        } catch (error) {
          console.error('Failed to initialize AudioService:', error);
          // Continue app startup even if audio fails - we'll retry later
        }
      } catch (e) {
        console.warn('Resource loading error:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        console.log('App is ready, appIsReady set to true');
      }
    }

    prepare();
    
    // Clean up AudioService when app unmounts
    return () => {
      AudioService.cleanup();
    };
  }, [fontsLoaded, fontError]);

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

  // Handle tab press/navigation
  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  // Render the current screen based on the active tab
  const renderScreen = () => {
    switch (activeTab) {
      case TABS.HOME:
        return <HomeScreen />;
      case TABS.DOOR:
        return <AccessScreen onNavigateToHome={() => setActiveTab(TABS.HOME)} />;
      case TABS.VISITOR:
        // Use our new VisitorScreen with navigation callback
        return <VisitorScreen onNavigateToHome={() => setActiveTab(TABS.HOME)} />;
      case TABS.MORE:
        // Not implemented yet, show home screen
        return <HomeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  if (!appIsReady || !fontsLoaded) {
    console.log('App not ready yet, showing splash screen', { appIsReady, fontsLoaded });
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#23262D"
        translucent={false}
      />
      <View style={styles.container}>
        {renderScreen()}
        <BottomNavigation 
          activeTab={activeTab} 
          onTabPress={handleTabPress} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#23262D',
  },
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND.PAGE,
  },
});

export default App; 