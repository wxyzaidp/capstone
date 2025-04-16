import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { UI_COLORS, UI_TYPOGRAPHY } from '../design-system';
import Constants from 'expo-constants';
import ChevronIcon from './icons/ChevronIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MoreTopBarProps {
  title: string;
  onBackPress?: () => void;
}

const TOPBAR_COLOR = UI_COLORS.BACKGROUND.CARD;

const MoreTopBar: React.FC<MoreTopBarProps> = ({ 
  title = "Settings & More",
  onBackPress
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TOPBAR_COLOR,
    paddingBottom: 12,
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
    marginLeft: 12,
    textAlign: 'left',
  },
});

export default MoreTopBar; 