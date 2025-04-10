import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface FaceIDIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const FaceIDIcon: React.FC<FaceIDIconProps> = ({
  width = 80,
  height = 80,
  color = '#7EE2FB',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 8H7C7 9.10457 6.10457 10 5 10V12C7.20914 12 9 10.2091 9 8Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 16H7C7 14.8954 6.10457 14 5 14V12C7.20914 12 9 13.7909 9 16Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 8H17C17 9.10457 17.8954 10 19 10V12C16.7909 12 15 10.2091 15 8Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 16H17C17 14.8954 17.8954 14 19 14V12C16.7909 12 15 13.7909 15 16Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8C11.4477 8 11 8.44772 11 9C11 9.55228 11.4477 10 12 10Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 15.5H14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default FaceIDIcon; 