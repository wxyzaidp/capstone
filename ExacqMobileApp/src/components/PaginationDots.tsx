import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface PaginationDotsProps {
  total: number;
  active: number;
  onDotPress?: (index: number) => void;
}

const PaginationDots = ({ total, active, onDotPress }: PaginationDotsProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === active ? styles.activeDot : styles.inactiveDot
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4, // Gap between dots (from Figma)
    marginTop: 16,
  },
  dot: {
    borderRadius: 4, // Rounded corners from Figma
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: '#64DCFA', // Active dot color from Figma
  },
  inactiveDot: {
    width: 6,
    height: 6,
    backgroundColor: '#646A78', // Inactive dot color from Figma
  },
});

export default PaginationDots; 