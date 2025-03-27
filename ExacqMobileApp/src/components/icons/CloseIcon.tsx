import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface CloseIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({
  width = 16, 
  height = 16, 
  fill = "#FFFFFF"
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <G id="close">
        <Path 
          d="M12 4L4 12M4 4L12 12" 
          stroke={fill} 
          strokeWidth={1.5} 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default CloseIcon; 