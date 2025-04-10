import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface PasscodeDotIconProps {
  filled: boolean;
  width?: number;
  height?: number;
}

/**
 * Icon component that displays either a filled or empty circle to represent passcode input
 * @param filled - Boolean indicating whether the dot should be filled (completed input) or empty
 * @param width - Width of the component
 * @param height - Height of the component
 */
export const PasscodeDotIcon: React.FC<PasscodeDotIconProps> = ({
  filled,
  width = 24,
  height = 24,
}) => {
  const radius = Math.min(width, height) / 2.5;
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {filled ? (
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="white"
        />
      ) : (
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="white"
          strokeWidth={2}
          fill="transparent"
        />
      )}
    </Svg>
  );
};

export default PasscodeDotIcon; 