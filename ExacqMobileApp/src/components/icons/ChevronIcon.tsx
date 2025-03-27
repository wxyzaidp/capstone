import React from 'react';
import { Svg, Path, G } from 'react-native-svg';

type Direction = 'up' | 'down' | 'left' | 'right';

interface ChevronIconProps {
  width?: number;
  height?: number;
  fill?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ChevronIcon: React.FC<ChevronIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = '#FFFFFF',
  direction = 'down'
}) => {
  // We'll use a different approach with different path data for each direction
  // This ensures the chevron points in the exact direction we want
  
  let path;
  
  switch (direction) {
    case 'left':
      path = "M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z";
      break;
    case 'right':
      path = "M10.59 7.41L16 12L10.59 16.59L9.17 15.17L13.17 12L9.17 8.83L10.59 7.41Z";
      break;
    case 'up':
      path = "M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z";
      break;
    case 'down':
    default:
      path = "M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z";
      break;
  }
  
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d={path} fill={fill} />
    </Svg>
  );
};

export default ChevronIcon; 