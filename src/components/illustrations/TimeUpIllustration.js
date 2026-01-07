/**
 * Time Up Illustration
 * Shown when user's time limit is reached
 */

import React from 'react';
import Svg, { Circle, Path, G, Rect, Line } from 'react-native-svg';

const TimeUpIllustration = ({ size = 200, color = '#E74C3C' }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={`scale(${scale})`}>
        {/* Background circle */}
        <Circle cx="100" cy="100" r="85" fill={`${color}10`} />
        
        {/* Hourglass top */}
        <Path
          d="M60 40 L140 40 L140 50 C140 50 130 70 100 85 C70 70 60 50 60 50 L60 40 Z"
          fill={color}
          opacity="0.3"
        />
        
        {/* Hourglass bottom - filled (time's up) */}
        <Path
          d="M60 160 L140 160 L140 150 C140 150 130 130 100 115 C70 130 60 150 60 150 L60 160 Z"
          fill={color}
          opacity="0.8"
        />
        
        {/* Hourglass frame */}
        <Path
          d="M55 35 L145 35 M55 165 L145 165"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Hourglass glass outline */}
        <Path
          d="M60 40 L60 55 C60 55 60 75 100 100 C140 75 140 55 140 55 L140 40"
          stroke={color}
          strokeWidth="3"
          fill="none"
          opacity="0.6"
        />
        <Path
          d="M60 160 L60 145 C60 145 60 125 100 100 C140 125 140 145 140 145 L140 160"
          stroke={color}
          strokeWidth="3"
          fill="none"
          opacity="0.6"
        />
        
        {/* Warning icon */}
        <Circle cx="155" cy="55" r="22" fill={color} />
        <Path
          d="M155 42 L155 58"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx="155" cy="66" r="3" fill="white" />
        
        {/* Sand particles */}
        <Circle cx="100" cy="140" r="2" fill={color} opacity="0.6" />
        <Circle cx="95" cy="145" r="1.5" fill={color} opacity="0.5" />
        <Circle cx="105" cy="148" r="1.5" fill={color} opacity="0.5" />
        <Circle cx="92" cy="150" r="2" fill={color} opacity="0.4" />
        <Circle cx="108" cy="152" r="1.5" fill={color} opacity="0.4" />
        
        {/* Decorative elements */}
        <Circle cx="45" cy="80" r="4" fill={color} opacity="0.2" />
        <Circle cx="160" cy="130" r="3" fill={color} opacity="0.2" />
      </G>
    </Svg>
  );
};

export default TimeUpIllustration;
