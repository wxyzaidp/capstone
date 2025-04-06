import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface NotificationIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ 
  width = 20, 
  height = 20, 
  color = 'white' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 40" fill="none">
      <Path
        d="M0 34V30H4V16C4 13.2333 4.83333 10.7747 6.5 8.624C8.16667 6.47467 10.3333 5.06667 13 4.4V3C13 2.16667 13.292 1.45867 13.876 0.876C14.4587 0.292 15.1667 0 16 0C16.8333 0 17.5413 0.292 18.124 0.876C18.708 1.45867 19 2.16667 19 3V4.4C21.6667 5.06667 23.8333 6.47467 25.5 8.624C27.1667 10.7747 28 13.2333 28 16V30H32V34H0ZM16 40C14.9 40 13.9587 39.6087 13.176 38.826C12.392 38.042 12 37.1 12 36H20C20 37.1 19.6087 38.042 18.826 38.826C18.042 39.6087 17.1 40 16 40ZM8 30H24V16C24 13.8 23.2167 11.9167 21.65 10.35C20.0833 8.78333 18.2 8 16 8C13.8 8 11.9167 8.78333 10.35 10.35C8.78333 11.9167 8 13.8 8 16V30Z"
        fill={color}
      />
    </Svg>
  );
};

export default NotificationIcon; 