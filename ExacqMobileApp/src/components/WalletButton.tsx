import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSVG } from '../hooks/useSVG';

interface WalletButtonProps {
  onPress: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ onPress }) => {
  // Load the SVG from file
  const walletSvg = useSVG(require('../assets/wallet-icon.svg'));
  
  return (
    <TouchableOpacity 
      style={styles.button} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {walletSvg && <SvgXml xml={walletSvg} width={30} height={23} />}
        <Text style={styles.buttonText}>Add to Apple Wallet</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    // Shadow for iOS
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    // Shadow for Android
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Gap between icon and text
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    lineHeight: 24, // 1.5em based on Figma
  },
});

export default WalletButton; 