import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CalendarChevronIconProps {
  direction: 'left' | 'right';
  width?: number;
  height?: number;
  fill?: string;
}

const CalendarChevronIcon: React.FC<CalendarChevronIconProps> = ({ 
  direction = 'left', 
  width = 20, 
  height = 20, 
  fill = '#6FDCFA' 
}) => {
  if (direction === 'left') {
    return (
      <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
        <Path d="M13 18L5 10L13 2L14.417 3.417L7.833 10L14.417 16.583L13 18Z" fill={fill} />
      </Svg>
    );
  } else {
    // Flip the chevron for right direction
    return (
      <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
        <Path d="M7 2L15 10L7 18L5.583 16.583L12.167 10L5.583 3.417L7 2Z" fill={fill} />
      </Svg>
    );
  }
};

export default CalendarChevronIcon; 