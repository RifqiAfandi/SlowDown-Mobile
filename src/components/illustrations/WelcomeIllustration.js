/**
 * Welcome Illustration
 * Shown on login/welcome screens
 */

import React from 'react';
import Svg, { Circle, Path, G, Rect, Ellipse } from 'react-native-svg';

const WelcomeIllustration = ({ size = 200, color = '#4A90D9' }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={`scale(${scale})`}>
        {/* Background circle */}
        <Circle cx="100" cy="100" r="85" fill={`${color}10`} />
        
        {/* Person body */}
        <Ellipse cx="100" cy="165" rx="35" ry="10" fill={color} opacity="0.2" />
        
        {/* Person - legs */}
        <Rect x="85" y="130" width="12" height="30" rx="6" fill={color} opacity="0.6" />
        <Rect x="103" y="130" width="12" height="30" rx="6" fill={color} opacity="0.6" />
        
        {/* Person - body */}
        <Path
          d="M75 90 C75 70 85 60 100 60 C115 60 125 70 125 90 L125 130 L75 130 Z"
          fill={color}
          opacity="0.7"
        />
        
        {/* Person - arms raised */}
        <Path
          d="M75 90 L55 60"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.6"
        />
        <Path
          d="M125 90 L145 60"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* Person - hands */}
        <Circle cx="55" cy="55" r="10" fill={color} opacity="0.6" />
        <Circle cx="145" cy="55" r="10" fill={color} opacity="0.6" />
        
        {/* Person - head */}
        <Circle cx="100" cy="45" r="22" fill={color} opacity="0.8" />
        
        {/* Smile */}
        <Path
          d="M90 48 Q100 58 110 48"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Eyes */}
        <Circle cx="92" cy="42" r="3" fill="white" />
        <Circle cx="108" cy="42" r="3" fill="white" />
        
        {/* Celebration elements */}
        <Path
          d="M45 35 L48 30 L51 35 L48 40 Z"
          fill="#F1C40F"
        />
        <Path
          d="M155 30 L158 25 L161 30 L158 35 Z"
          fill="#E74C3C"
        />
        <Path
          d="M35 80 L38 75 L41 80 L38 85 Z"
          fill="#27AE60"
        />
        <Path
          d="M165 85 L168 80 L171 85 L168 90 Z"
          fill="#9B59B6"
        />
        
        {/* Confetti dots */}
        <Circle cx="50" cy="50" r="4" fill="#F1C40F" opacity="0.8" />
        <Circle cx="150" cy="45" r="3" fill="#E74C3C" opacity="0.8" />
        <Circle cx="40" cy="100" r="3" fill="#27AE60" opacity="0.8" />
        <Circle cx="160" cy="105" r="4" fill="#9B59B6" opacity="0.8" />
        <Circle cx="60" cy="25" r="3" fill={color} opacity="0.5" />
        <Circle cx="140" cy="20" r="3" fill={color} opacity="0.5" />
      </G>
    </Svg>
  );
};

export default WelcomeIllustration;
