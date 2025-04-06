import React from 'react';
import { SvgXml } from 'react-native-svg';

interface DoorIconProps {
  width?: number;
  height?: number;
  color?: string;
  isOpen?: boolean;
}

const DoorIcon: React.FC<DoorIconProps> = ({ 
  width = 24, 
  height = 24, 
  color = '#FFFFFF',
  isOpen = false
}) => {
  // Door closed SVG (default)
  const closedDoorSvg = `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21V19H19V5C19 4.45 18.804 3.979 18.412 3.587C18.0207 3.19567 17.55 3 17 3H7C6.45 3 5.979 3.19567 5.587 3.587C5.19567 3.979 5 4.45 5 5V19H3V21H21ZM17 19H7V5H17V19Z" fill="${color}"/>
    <path d="M15.124 13.0581C14.8327 13.3501 14.4787 13.4961 14.062 13.4961C13.6453 13.4961 13.2913 13.3501 13 13.0581C12.708 12.7667 12.562 12.4127 12.562 11.9961C12.562 11.5794 12.708 11.2254 13 10.9341C13.2913 10.6421 13.6453 10.4961 14.062 10.4961C14.4787 10.4961 14.8327 10.6421 15.124 10.9341C15.416 11.2254 15.562 11.5794 15.562 11.9961C15.562 12.4127 15.416 12.7667 15.124 13.0581Z" fill="${color}"/>
  </svg>`;

  // Door open SVG
  const openDoorSvg = `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 21V19H5V5C5 4.43333 5.19583 3.95833 5.5875 3.575C5.97917 3.19167 6.45 3 7 3H17C17.5667 3 18.0417 3.19167 18.425 3.575C18.8083 3.95833 19 4.43333 19 5V19H21V21H3ZM13 6.875V18L7 19V5L12.2 5.85C12.4333 5.88333 12.625 6 12.775 6.2C12.925 6.4 13 6.625 13 6.875ZM11 13C11.2833 13 11.5208 12.9042 11.7125 12.7125C11.9042 12.5208 12 12.2833 12 12C12 11.7167 11.9042 11.4792 11.7125 11.2875C11.5208 11.0958 11.2833 11 11 11C10.7167 11 10.4792 11.0958 10.2875 11.2875C10.0958 11.4792 10 11.7167 10 12C10 12.2833 10.0958 12.5208 10.2875 12.7125C10.4792 12.9042 10.7167 13 11 13Z" fill="${color}"/>
  </svg>`;

  // Select the appropriate SVG based on the door state
  const svgXml = isOpen ? openDoorSvg : closedDoorSvg;

  return <SvgXml xml={svgXml} width={width} height={height} />;
};

export default DoorIcon; 