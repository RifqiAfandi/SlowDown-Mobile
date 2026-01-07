/**
 * No Usage Illustration
 * Shown when there's no usage data
 */

import React from 'react';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

const NoUsageIllustration = ({ size = 200, color = '#4A90D9' }) => {
  const scale = size / 200;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <G transform={`scale(${scale})`}>
        {/* Background circle */}
        <Circle cx="100" cy="100" r="85" fill={`${color}10`} />
        
        {/* Phone outline */}
        <Rect
          x="60"
          y="30"
          width="80"
          height="140"
          rx="12"
          fill="white"
          stroke={color}
          strokeWidth="3"
          opacity="0.9"
        />
        
        {/* Phone screen */}
        <Rect
          x="68"
          y="50"
          width="64"
          height="100"
          rx="4"
          fill={`${color}15`}
        />
        
        {/* Phone speaker */}
        <Rect x="90" y="38" width="20" height="4" rx="2" fill={color} opacity="0.3" />
        
        {/* Phone home button */}
        <Circle cx="100" cy="160" r="6" stroke={color} strokeWidth="2" fill="none" opacity="0.3" />
        
        {/* Chart bars (empty) */}
        <Rect x="78" y="120" width="12" height="20" rx="2" fill={color} opacity="0.15" />
        <Rect x="94" y="110" width="12" height="30" rx="2" fill={color} opacity="0.15" />
        <Rect x="110" y="100" width="12" height="40" rx="2" fill={color} opacity="0.15" />
        
        {/* Sleeping Z's */}
        <G transform="translate(130, 45)">
          <Path
            d="M0 0 L15 0 L0 15 L15 15"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
        </G>
        <G transform="translate(145, 30)">
          <Path
            d="M0 0 L10 0 L0 10 L10 10"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.4"
          />
        </G>
        <G transform="translate(155, 20)">
          <Path
            d="M0 0 L7 0 L0 7 L7 7"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.3"
          />
        </G>
        
        {/* Clock icon */}
        <Circle cx="45" cy="80" r="18" fill={color} opacity="0.2" />
        <Circle cx="45" cy="80" r="15" stroke={color} strokeWidth="2" fill="white" />
        <Path
          d="M45 72 L45 80 L52 84"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Checkmark on clock */}
        <Circle cx="55" cy="68" r="8" fill="#27AE60" />
        <Path
          d="M51 68 L54 71 L60 65"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Decorative elements */}
        <Circle cx="35" cy="130" r="4" fill={color} opacity="0.2" />
        <Circle cx="165" cy="100" r="5" fill={color} opacity="0.2" />
      </G>
    </Svg>
  );
};

export default NoUsageIllustration;
