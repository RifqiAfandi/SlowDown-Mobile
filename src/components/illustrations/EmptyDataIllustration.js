/**
 * Empty Data Illustration
 * Shown when there's no data to display
 */

import React from 'react';
import Svg, { Circle, Path, G, Rect, Ellipse } from 'react-native-svg';

const EmptyDataIllustration = ({ size = 200, color = '#4A90D9' }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={`scale(${scale})`}>
        {/* Background circle */}
        <Circle cx="100" cy="100" r="80" fill={`${color}15`} />
        
        {/* Folder base */}
        <Path
          d="M50 70 L50 140 C50 145 54 150 60 150 L140 150 C146 150 150 145 150 140 L150 80 C150 75 146 70 140 70 L100 70 L90 55 L60 55 C54 55 50 60 50 65 L50 70 Z"
          fill={color}
          opacity="0.3"
        />
        
        {/* Folder front */}
        <Path
          d="M45 85 L45 145 C45 150 50 155 55 155 L145 155 C150 155 155 150 155 145 L155 95 C155 90 150 85 145 85 Z"
          fill={color}
          opacity="0.6"
        />
        
        {/* Document 1 */}
        <Rect x="70" y="95" width="35" height="45" rx="3" fill="white" opacity="0.9" />
        <Rect x="75" y="105" width="25" height="3" rx="1" fill={color} opacity="0.4" />
        <Rect x="75" y="112" width="20" height="3" rx="1" fill={color} opacity="0.4" />
        <Rect x="75" y="119" width="22" height="3" rx="1" fill={color} opacity="0.4" />
        
        {/* Document 2 */}
        <Rect x="95" y="100" width="35" height="45" rx="3" fill="white" opacity="0.95" />
        <Rect x="100" y="110" width="25" height="3" rx="1" fill={color} opacity="0.4" />
        <Rect x="100" y="117" width="20" height="3" rx="1" fill={color} opacity="0.4" />
        <Rect x="100" y="124" width="22" height="3" rx="1" fill={color} opacity="0.4" />
        
        {/* Question mark */}
        <Circle cx="130" cy="75" r="18" fill={color} />
        <Path
          d="M125 68 C125 63 128 60 133 60 C138 60 141 64 141 68 C141 72 138 74 135 76 L135 80"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx="135" cy="86" r="2" fill="white" />
        
        {/* Decorative dots */}
        <Circle cx="55" cy="55" r="4" fill={color} opacity="0.3" />
        <Circle cx="145" cy="50" r="3" fill={color} opacity="0.3" />
        <Circle cx="160" cy="130" r="5" fill={color} opacity="0.2" />
      </G>
    </Svg>
  );
};

export default EmptyDataIllustration;
