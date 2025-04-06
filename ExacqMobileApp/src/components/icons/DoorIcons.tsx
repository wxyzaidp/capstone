import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';

interface DoorIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

// Door Locked Icon
export const DoorLockedIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = "#FFFFFF" 
}) => {
  const doorLockedXml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V19C20 20.1 19.1 21 18 21ZM6 5V19H18V5H6Z" fill="${fill}"/>
      <path d="M16 12L14 10V8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8V10L8 12H10V16H14V12H16ZM12 8C12 7.45 12.45 7 13 7C13.55 7 14 7.45 14 8V9.6L13 8.6V12H11V8.6L10 9.6V8C10 7.45 10.45 7 11 7C11.55 7 12 7.45 12 8Z" fill="${fill}"/>
    </svg>
  `;
  
  return <SvgXml xml={doorLockedXml} width={width} height={height} />;
};

// Door Unlocked Icon
export const DoorUnlockedIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = "#FFFFFF" 
}) => {
  const doorUnlockedXml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V19C20 20.1 19.1 21 18 21ZM6 5V19H18V5H6Z" fill="${fill}"/>
      <path d="M16 12L14 10V8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8H8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V10L14 12H16ZM12 18C10.9 18 10 17.1 10 16V12H14V16C14 17.1 13.1 18 12 18Z" fill="${fill}"/>
    </svg>
  `;
  
  return <SvgXml xml={doorUnlockedXml} width={width} height={height} />;
};

// Door Restricted Icon
export const DoorRestrictedIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = "#404759" 
}) => {
  const doorRestrictedXml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V19C20 20.1 19.1 21 18 21ZM6 5V19H18V5H6Z" fill="${fill}"/>
      <path d="M16 12L14 10V8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8V10L8 12H10V16H14V12H16ZM12 8C12 7.45 12.45 7 13 7C13.55 7 14 7.45 14 8V9.6L13 8.6V12H11V8.6L10 9.6V8C10 7.45 10.45 7 11 7C11.55 7 12 7.45 12 8Z" fill="${fill}"/>
      <circle cx="12" cy="12" r="9" stroke="${fill}" stroke-width="2" stroke-dasharray="2 2"/>
    </svg>
  `;
  
  return <SvgXml xml={doorRestrictedXml} width={width} height={height} />;
};

// Door Disabled Icon
export const DoorDisabledIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = "#404759" 
}) => {
  const doorDisabledXml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V19C20 20.1 19.1 21 18 21ZM6 5V19H18V5H6Z" fill="${fill}"/>
      <path d="M16 12L14 10V8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8V10L8 12H10V16H14V12H16ZM12 8C12 7.45 12.45 7 13 7C13.55 7 14 7.45 14 8V9.6L13 8.6V12H11V8.6L10 9.6V8C10 7.45 10.45 7 11 7C11.55 7 12 7.45 12 8Z" fill="${fill}"/>
      <line x1="4" y1="4" x2="20" y2="20" stroke="${fill}" stroke-width="2"/>
    </svg>
  `;
  
  return <SvgXml xml={doorDisabledXml} width={width} height={height} />;
};

// Lock Icon for Swipe Indicator
export const LockIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = "#FFFFFF" 
}) => {
  const lockIconXml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z" fill="${fill}"/>
    </svg>
  `;
  
  return <SvgXml xml={lockIconXml} width={width} height={height} />;
};

// Unlock Icon for Unlocked State
export const UnlockIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  fill = "#FFFFFF" 
}) => {
  const unlockIconXml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6H9C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z" fill="${fill}"/>
    </svg>
  `;
  
  return <SvgXml xml={unlockIconXml} width={width} height={height} />;
}; 