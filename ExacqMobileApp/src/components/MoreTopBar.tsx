import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UI_COLORS, UI_TYPOGRAPHY } from '../design-system';
import Constants from 'expo-constants';
import ChevronIcon from './icons/ChevronIcon';

interface MoreTopBarProps {
  title: string;
  onBackPress?: () => void;
}

const STATUSBAR_COLOR = '#23262D';

// Get the status bar height safely
const getStatusBarHeight = () => {
  if (Platform.OS === 'android') {
    return RNStatusBar.currentHeight || 0;
  }
  return 0;
};

const MoreTopBar: React.FC<MoreTopBarProps> = ({ 
  title = "Settings & More",
  onBackPress
}) => {
  return (
    <View style={styles.safeAreaContainer}>
      {/* Set the StatusBar color using React Native's StatusBar for Android */}
      {Platform.OS === 'android' && (
        <RNStatusBar
          backgroundColor={STATUSBAR_COLOR}
          barStyle="light-content"
        />
      )}
      {/* Use Expo's StatusBar for consistent behavior */}
      <StatusBar style="light" />
      
      <View style={styles.container}>
        <View style={styles.leftContent}>
          <TouchableOpacity 
            style={styles.iconButtonLeading}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <ChevronIcon 
              width={24} 
              height={24} 
              fill="#FFFFFF" 
              direction="left" 
            />
          </TouchableOpacity>
          
          <Text 
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        
        {/* No right section - building icon removed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: STATUSBAR_COLOR,
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: STATUSBAR_COLOR,
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(70, 78, 97, 0.35)',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonLeading: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: 'Outfit-Medium',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    letterSpacing: 0.1,
    marginLeft: 12, // 12px spacing between back button and title
    textAlign: 'left',
  }
});

export default MoreTopBar; 