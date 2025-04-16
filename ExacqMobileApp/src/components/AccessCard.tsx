import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define role colors for different user types
const roleColors = {
  Guest: '#8C8FA1',
  Admin: '#B18AFF',
  Employee: '#73A7F2',
  Security: '#47CAD1',
};

interface AccessCardProps {
  cardId: string;
  name: string;
  role: string;
  index: number;
  onPress: () => void;
  isInteractive?: boolean;
}

export default function AccessCard({ 
  cardId, 
  name, 
  role, 
  index, 
  onPress,
  isInteractive = true 
}: AccessCardProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress}
      style={styles.touchable}
      disabled={!isInteractive}
    >
      <LinearGradient
        colors={['#64DCFA', 'transparent', 'transparent', '#64DCFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.card}>
          {/* Using direct Image instead of ImageBackground for better compatibility */}
          <Image 
            source={require('../assets/Card_background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 20,
    marginRight: 16,
  },
  gradientBorder: {
    padding: 1.5,
    borderRadius: 19.6,
    shadowColor: 'rgba(35, 38, 45, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    width: 300,
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#101217',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  }
}); 