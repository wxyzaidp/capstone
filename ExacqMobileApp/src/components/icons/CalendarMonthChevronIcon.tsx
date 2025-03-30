import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CalendarMonthChevronIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const CalendarMonthChevronIcon: React.FC<CalendarMonthChevronIconProps> = ({ 
  width = 16, 
  height = 16, 
  fill = "#B6BDCD" 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.6001 5.59747L8.0001 11.9975L14.4001 5.59747L13.2665 4.46387L8.0001 9.73107L2.7337 4.46387L1.6001 5.59747Z"
        fill={fill}
      />
    </Svg>
  );
};

export default CalendarMonthChevronIcon; 