import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { UI_COLORS } from './src/design-system/colors';
import HomeScreen from './src/screens/HomeScreen';
import AccessScreen from './src/screens/AccessScreen';
import VisitorScreen from './src/screens/VisitorScreen';
import MoreScreen from './src/screens/MoreScreen';
import CreateInviteScreen from './src/screens/CreateInviteScreen';
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

// Additional screens
const SCREENS = {
  CREATE_INVITE: 'create_invite'
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  
  // State to track active screen (for non-tab screens)
  const [activeScreen, setActiveScreen] = useState(null);
  
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
    // Clear any non-tab screens
    setActiveScreen(null);
  };

  // Handle invite flow state
  const handleInviteFlowStateChange = (isActive) => {
    setInviteFlowActive(isActive);
  };
  
  // Navigate to create invite screen
  const navigateToCreateInvite = () => {
    console.log('[App] Navigating to CreateInviteScreen');
    setActiveScreen(SCREENS.CREATE_INVITE);
    setInviteFlowActive(true);
  };
  
  // Navigate back from create invite screen
  const navigateBackFromCreateInvite = () => {
    console.log('[App] Navigating back from CreateInviteScreen');
    setActiveScreen(null);
    setInviteFlowActive(false);
  };
  
  // Handle create invite success
  const handleCreateInviteSuccess = (inviteData) => {
    console.log('[App] Create invite success:', inviteData);
    setActiveScreen(null);
    setInviteFlowActive(false);
  };

  // Render the current screen based on the active tab or special screens
  const renderScreen = () => {
    // First check if a special screen is active
    if (activeScreen === SCREENS.CREATE_INVITE) {
      return (
        <CreateInviteScreen 
          onClose={navigateBackFromCreateInvite}
          onCreateInvite={handleCreateInviteSuccess}
        />
      );
    }
    
    // Otherwise render based on the active tab
    switch (activeTab) {
      case TABS.HOME:
        return <HomeScreen onNavigateToCreateInvite={navigateToCreateInvite} />;
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
        // Use our new MoreScreen component
        return <MoreScreen onNavigateToHome={() => setActiveTab(TABS.HOME)} />;
      default:
        return <HomeScreen onNavigateToCreateInvite={navigateToCreateInvite} />;
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