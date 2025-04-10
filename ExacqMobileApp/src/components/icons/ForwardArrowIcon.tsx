import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ForwardArrowIconProps {
  color?: string;
  width?: number;
  height?: number;
}

const ForwardArrowIcon: React.FC<ForwardArrowIconProps> = ({
  color = '#131515',
  width = 24,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 13L16.175 13L10.575 18.6L12 20L20 12L12 4L10.575 5.4L16.175 11L4 11L4 13Z"
        fill={color}
      />
    </Svg>
  );
};

export default ForwardArrowIcon; 