import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Import SVG files as React components
import HomeDefault from '../assets/Home-default.svg';
import HomeActive from '../assets/Home-active.svg';
import DoorDefault from '../assets/Access-default.svg';
import DoorActive from '../assets/Access-active.svg';
import VisitorDefault from '../assets/Vistior-default.svg';
import VisitorActive from '../assets/Visitor-Active.svg';
import MoreDefault from '../assets/More-default.svg';
import MoreActive from '../assets/More-active.svg';

// Create constants for the tab items to improve readability
const TABS = {
  HOME: 'home',
  DOOR: 'door',
  VISITOR: 'visitor',
  MORE: 'more'
};

interface BottomNavigationProps {
  onTabPress?: (tabId: string) => void;
  activeTab?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  onTabPress, 
  activeTab: propActiveTab 
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(TABS.HOME);
  
  // Use the prop active tab if provided, otherwise use internal state
  const activeTab = propActiveTab || internalActiveTab;

  const tabs = [
    { id: TABS.HOME, label: 'Home' },
    { id: TABS.DOOR, label: 'Access' },
    { id: TABS.VISITOR, label: 'Visitor' },
    { id: TABS.MORE, label: 'More' }
  ];

  // Function to render the proper icon based on tab and active state
  const renderIcon = (tabId, isActive) => {
    // Updated icon size to match Figma design (32px width/height)
    const iconProps = { width: 32, height: 32 };
    
    switch(tabId) {
      case TABS.HOME:
        return isActive ? <HomeActive {...iconProps} /> : <HomeDefault {...iconProps} />;
      case TABS.DOOR:
        return isActive ? <DoorActive {...iconProps} /> : <DoorDefault {...iconProps} />;
      case TABS.VISITOR:
        return isActive ? <VisitorActive {...iconProps} /> : <VisitorDefault {...iconProps} />;
      case TABS.MORE:
        return isActive ? <MoreActive {...iconProps} /> : <MoreDefault {...iconProps} />;
      default:
        return null;
    }
  };

  // Handle tab press
  const handleTabPress = (tabId) => {
    setInternalActiveTab(tabId);
    
    // Call the callback if provided
    if (onTabPress) {
      onTabPress(tabId);
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => handleTabPress(tab.id)}
          >
            <View 
              style={[
                styles.iconContainer,
                isActive && styles.selectedIconContainer
              ]}
            >
              {renderIcon(tab.id, isActive)}
            </View>
            <Text 
              style={[
                styles.tabText,
                isActive && styles.selectedTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#23262D',
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 0,
    position: 'relative',
    borderTopWidth: 0,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(70, 78, 97, 0.35)',
  },
  tabText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
    color: '#B6BDCD',
    marginTop: 4,
  },
  selectedTabText: {
    color: '#FFFFFF',
  }
});

export default BottomNavigation; 