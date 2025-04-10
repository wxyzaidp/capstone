import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BackspaceIconProps {
  color?: string;
  width?: number;
  height?: number;
}

const BackspaceIcon: React.FC<BackspaceIconProps> = ({
  color = '#FFFFFF',
  width = 24,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M21.5 4.2002H7.99995C7.37895 4.2002 6.89295 4.5152 6.56895 4.9922L1.69995 12.3002L6.56895 19.5992C6.89295 20.0762 7.37895 20.4002 7.99995 20.4002H21.5C22.49 20.4002 23.3 19.5902 23.3 18.6002V6.0002C23.3 5.0102 22.49 4.2002 21.5 4.2002ZM21.5 18.6002H8.06295L3.85995 12.3002L8.05395 6.0002H21.5V18.6002ZM11.069 16.8002L14.3 13.5692L17.531 16.8002L18.8 15.5312L15.569 12.3002L18.8 9.0692L17.531 7.8002L14.3 11.0312L11.069 7.8002L9.79995 9.0692L13.031 12.3002L9.79995 15.5312L11.069 16.8002Z"
        fill={color}
      />
    </Svg>
  );
};

export default BackspaceIcon; 