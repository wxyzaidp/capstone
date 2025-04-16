import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, NavigationContainerRef } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar, Platform, BackHandler, Image } from 'react-native';
import { Asset } from 'expo-asset';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AccessScreen from '../screens/AccessScreen';
import VisitorScreen from '../screens/VisitorScreen';
import MoreScreen from '../screens/MoreScreen';
import CreateInviteScreen from '../screens/CreateInviteScreen';
import GetStartedScreen from '../screens/GetStartedScreen';
import AccessCardScreen from '../screens/AccessCardScreen';

// Import components
import BottomNavigation from '../components/BottomNavigation';

// Import colors
import { UI_COLORS } from '../design-system/colors';

// Define types for navigation parameters
export type RootStackParamList = {
  GetStarted: undefined;
  MainTabs: undefined;
  AccessCard: {
    cardId: string;
    cardName: string;
    cardType: string;
    cardStatus: string;
  };
  CreateInvite: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Access: undefined;
  Visitor: undefined;
  More: undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab constants to match existing code
const TABS = {
  HOME: 'home',
  DOOR: 'door',
  VISITOR: 'visitor',
  MORE: 'more'
} as const;

// Type for tab IDs
type TabId = typeof TABS[keyof typeof TABS];

// Map navigation route names to tab ids
const routeToTabMapping: Record<keyof MainTabParamList, TabId> = {
  'Home': TABS.HOME,
  'Access': TABS.DOOR,
  'Visitor': TABS.VISITOR,
  'More': TABS.MORE
};

// Define the tab navigator
const MainTabNavigator = () => {
  // Keep track of the current tab to handle back button properly
  const lastTabRef = useRef<string>(TABS.HOME);
  
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => {
        // Map the active route name to our tab IDs
        const routeName = getFocusedRouteNameFromRoute(props.state.routes[props.state.index]) || props.state.routes[props.state.index].name;
        const activeRouteName = routeName as keyof MainTabParamList;
        const activeTabId = routeToTabMapping[activeRouteName];
        
        // Update our reference to the current tab
        if (activeTabId) {
          lastTabRef.current = activeTabId;
        }
        
        // Pass activeTab prop to BottomNavigation
        return (
          <BottomNavigation
            activeTab={activeTabId || lastTabRef.current}
            onTabPress={(tabId) => {
              // Map tab ID back to route name for navigation
              const tabToRoute: Record<TabId, keyof MainTabParamList> = {
                [TABS.HOME]: 'Home',
                [TABS.DOOR]: 'Access',
                [TABS.VISITOR]: 'Visitor',
                [TABS.MORE]: 'More'
              };
              const routeName = tabToRoute[tabId as TabId];
              if (routeName) {
                props.navigation.navigate(routeName);
                lastTabRef.current = tabId; // Update our last tab reference
              }
            }}
          />
        );
      }}
      screenOptions={{
        headerShown: false,
      }}
      // @ts-ignore - Ignoring id type mismatch
      id="main-tabs"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Access" 
        component={AccessScreen}
        options={{
          title: 'Access',
        }}
      />
      <Tab.Screen 
        name="Visitor" 
        component={VisitorScreen}
        options={{
          title: 'Visitor',
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{
          title: 'More',
        }}
      />
    </Tab.Navigator>
  );
};

// Create a separate wrapper component for GetStartedScreen
const GetStartedWrapper = ({ navigation }) => (
  <GetStartedScreen
    onGetStarted={() => navigation.navigate('MainTabs')}
    onLearnMore={() => console.log('Learn more pressed')}
  />
);

// --- GIF Preloading Logic --- Start
const GIF_ASSETS_TO_PRELOAD = [
  // Add other globally needed GIFs here if necessary
  require('../../assets/Twist_Phone.gif'), 
];

// Function to preload gif assets
const preloadGifs = async () => {
  try {
    console.log('[AppNavigator] Preloading GIFs...');
    const cacheAssets = GIF_ASSETS_TO_PRELOAD.map(asset => {
      if (Platform.OS === 'web') {
        // For web, resolve the URI and use Asset.fromURI
        const source = Image.resolveAssetSource(asset);
        if (source?.uri) {
          return Asset.fromURI(source.uri).downloadAsync();
        } else {
          console.warn('[AppNavigator] Could not resolve asset source for preloading on web:', asset);
          return Promise.resolve(); // Return resolved promise to avoid breaking Promise.all
        }
      }
      // For native, use Asset.fromModule
      return Asset.fromModule(asset).downloadAsync();
    });
    
    await Promise.all(cacheAssets);
    console.log('[AppNavigator] All specified GIFs preloaded successfully');
  } catch (error) {
    console.error('[AppNavigator] Error preloading GIFs:', error);
  }
};
// --- GIF Preloading Logic --- End

// Define the main app navigator
const AppNavigator = () => {
  // Reference to the navigation container
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // --- Preload GIFs on Mount --- Start
  useEffect(() => {
    preloadGifs();
  }, []);
  // --- Preload GIFs on Mount --- End

  return (
    <Stack.Navigator
      initialRouteName="GetStarted"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: UI_COLORS.BACKGROUND.PAGE },
        // Use proper navigation options supported by React Navigation
        gestureEnabled: true,
        // iOS-specific options
        ...(Platform.OS === 'ios' ? {
          cardOverlayEnabled: true,
          gestureDirection: 'horizontal',
        } : {}),
      }}
      // @ts-ignore - Ignoring id type mismatch
      id="app-stack"
    >
      <Stack.Screen 
        name="GetStarted" 
        options={{ headerShown: false }}
        component={GetStartedWrapper}
      />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="AccessCard" component={AccessCardScreen} />
      <Stack.Screen name="CreateInvite" component={CreateInviteScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 