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
  // State to track the active tab
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  
  // State to track whether invite flow is active
  const [inviteFlowActive, setInviteFlowActive] = useState(false);

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

  // Handle tab press/navigation
  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle invite flow state
  const handleInviteFlowStateChange = (isActive) => {
    setInviteFlowActive(isActive);
  };

  // Render the current screen based on the active tab
  const renderScreen = () => {
    switch (activeTab) {
      case TABS.HOME:
        return <HomeScreen />;
      case TABS.DOOR:
        return <AccessScreen onNavigateToHome={() => setActiveTab(TABS.HOME)} />;
      case TABS.VISITOR:
        // Use our VisitorScreen with navigation callback and invite flow state
        return (
          <VisitorScreen 
            onNavigateToHome={() => setActiveTab(TABS.HOME)} 
            onInviteFlowStateChange={handleInviteFlowStateChange}
          />
        );
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
        {!inviteFlowActive && (
          <BottomNavigation 
            activeTab={activeTab} 
            onTabPress={handleTabPress} 
          />
        )}
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