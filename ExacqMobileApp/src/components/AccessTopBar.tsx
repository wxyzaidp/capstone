import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UI_COLORS, UI_TYPOGRAPHY } from '../design-system';
import Svg, { Path } from 'react-native-svg';
import Constants from 'expo-constants';
import ChevronIcon from './icons/ChevronIcon';

// Building Icon 
const BuildingIcon = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 40 36" fill="none">
      <Path
        d="M2 36C0.895431 36 0 35.1046 0 34V2C0 0.895431 0.895431 0 2 0H18C19.1046 0 20 0.895431 20 2V8H38C39.1046 8 40 8.89543 40 10V34C40 35.1046 39.1046 36 38 36H2ZM4 32H8V28H4V32ZM4 24H8V20H4V24ZM4 16H8V12H4V16ZM4 8H8V4H4V8ZM12 32H16V28H12V32ZM12 24H16V20H12V24ZM12 16H16V12H12V16ZM12 8H16V4H12V8ZM20 32H36V12H20V16H24V20H20V24H24V28H20V32ZM28 20V16H32V20H28ZM28 28V24H32V28H28Z"
        fill={color}
      />
    </Svg>
  );
};

interface AccessTopBarProps {
  title: string;
  onBackPress?: () => void;
  onBuildingPress?: () => void;
}

const STATUSBAR_COLOR = '#23262D';

const AccessTopBar = ({ 
  title = "Access",
  onBackPress,
  onBuildingPress
}: AccessTopBarProps) => {
  return (
    <View style={styles.safeAreaContainer}>
      <StatusBar style="light" backgroundColor={STATUSBAR_COLOR} />
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
        
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.iconButtonTrailing}
            onPress={onBuildingPress}
            activeOpacity={0.7}
          >
            <BuildingIcon size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: STATUSBAR_COLOR,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
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
  rightSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  },
  iconButtonTrailing: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 8,
    width: 40,
    height: 40,
  },
});

export default AccessTopBar; 