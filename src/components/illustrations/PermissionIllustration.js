/**
 * Permission Illustration
 * Shown when requesting permissions
 */

import React from 'react';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

const PermissionIllustration = ({ size = 200, color = '#4A90D9' }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={`scale(${scale})`}>
        {/* Background circle */}
        <Circle cx="100" cy="100" r="85" fill={`${color}10`} />
        
        {/* Shield body */}
        <Path
          d="M100 30 L150 50 L150 100 C150 140 125 165 100 175 C75 165 50 140 50 100 L50 50 Z"
          fill={color}
          opacity="0.2"
        />
        <Path
          d="M100 40 L140 57 L140 97 C140 130 120 150 100 160 C80 150 60 130 60 97 L60 57 Z"
          fill={color}
          opacity="0.4"
        />
        <Path
          d="M100 50 L130 64 L130 94 C130 120 115 138 100 145 C85 138 70 120 70 94 L70 64 Z"
          fill={color}
          opacity="0.8"
        />
        
        {/* Checkmark on shield */}
        <Path
          d="M82 95 L95 108 L118 85"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Lock icon */}
        <G transform="translate(135, 35)">
          <Rect x="0" y="12" width="24" height="18" rx="3" fill={color} />
          <Path
            d="M5 12 L5 8 C5 4 8 0 12 0 C16 0 19 4 19 8 L19 12"
            stroke={color}
            strokeWidth="3"
            fill="none"
          />
          <Circle cx="12" cy="21" r="3" fill="white" />
        </G>
        
        {/* Decorative elements */}
        <Circle cx="40" cy="60" r="5" fill={color} opacity="0.3" />
        <Circle cx="35" cy="140" r="4" fill={color} opacity="0.2" />
        <Circle cx="165" cy="130" r="4" fill={color} opacity="0.2" />
        
        {/* Small stars */}
        <Path
          d="M55 45 L57 50 L62 50 L58 54 L60 59 L55 56 L50 59 L52 54 L48 50 L53 50 Z"
          fill={color}
          opacity="0.4"
        />
        <Path
          d="M160 90 L162 95 L167 95 L163 99 L165 104 L160 101 L155 104 L157 99 L153 95 L158 95 Z"
          fill={color}
          opacity="0.3"
        />
      </G>
    </Svg>
  );
};

export default PermissionIllustration;
