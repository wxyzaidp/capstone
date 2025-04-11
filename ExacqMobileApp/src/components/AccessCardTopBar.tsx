import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface AccessCardTopBarProps {
  onBackPress?: () => void;
}

// The background color for AccessCard screen must match the Stack.Screen options
const STATUSBAR_COLOR = '#131515';

// Get the status bar height safely
const getStatusBarHeight = () => {
  return Platform.OS === 'ios' ? Constants.statusBarHeight || 47 : Constants.statusBarHeight || 0;
};

/**
 * TopBar component for the AccessCard screen
 * Handles back button
 */
const AccessCardTopBar = ({ onBackPress }: AccessCardTopBarProps) => {
  return (
    <View style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: STATUSBAR_COLOR,
    paddingTop: getStatusBarHeight(),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: STATUSBAR_COLOR,
    padding: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: 40,
    height: 40,
  }
});

export default AccessCardTopBar; 