/**
 * Success Illustration
 * Shown for successful actions
 */

import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

const SuccessIllustration = ({ size = 200, color = '#27AE60' }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={`scale(${scale})`}>
        {/* Background circles */}
        <Circle cx="100" cy="100" r="85" fill={`${color}10`} />
        <Circle cx="100" cy="100" r="65" fill={`${color}15`} />
        
        {/* Main success circle */}
        <Circle cx="100" cy="100" r="50" fill={color} />
        
        {/* Checkmark */}
        <Path
          d="M75 100 L92 117 L125 84"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Celebration particles */}
        <Circle cx="45" cy="60" r="5" fill={color} opacity="0.4" />
        <Circle cx="155" cy="55" r="6" fill={color} opacity="0.3" />
        <Circle cx="40" cy="130" r="4" fill={color} opacity="0.3" />
        <Circle cx="160" cy="140" r="5" fill={color} opacity="0.4" />
        <Circle cx="70" cy="40" r="3" fill={color} opacity="0.3" />
        <Circle cx="130" cy="160" r="4" fill={color} opacity="0.3" />
        
        {/* Sparkles */}
        <Path
          d="M50 90 L55 85 L50 80 L45 85 Z"
          fill={color}
          opacity="0.5"
        />
        <Path
          d="M150 110 L155 105 L150 100 L145 105 Z"
          fill={color}
          opacity="0.5"
        />
        <Path
          d="M165 75 L168 72 L165 69 L162 72 Z"
          fill={color}
          opacity="0.4"
        />
        <Path
          d="M35 115 L38 112 L35 109 L32 112 Z"
          fill={color}
          opacity="0.4"
        />
      </G>
    </Svg>
  );
};

export default SuccessIllustration;
