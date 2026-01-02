/**
 * Time Display Component
 * Shows remaining time in circular progress format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, SPACING } from '../../constants';
import { formatTimeRemaining, formatMinutesToReadable } from '../../utils/dateUtils';

const TimeDisplay = ({
  remainingMinutes,
  totalMinutes,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
  style,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(1, remainingMinutes / totalMinutes));
  const strokeDashoffset = circumference * (1 - progress);

  // Determine color based on remaining time
  const getProgressColor = () => {
    if (remainingMinutes <= 0) return COLORS.danger;
    if (remainingMinutes <= 5) return COLORS.danger;
    if (remainingMinutes <= 10) return COLORS.warning;
    return COLORS.primary;
  };

  const progressColor = getProgressColor();

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.ultraLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={[styles.timeText, { color: progressColor }]}>
          {formatTimeRemaining(remainingMinutes)}
        </Text>
        {showLabel && (
          <Text style={styles.label}>
            {remainingMinutes > 0 ? 'tersisa' : 'habis'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: FONTS.sizes.xxxl + 8,
    fontWeight: 'bold',
  },
  label: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
});

export default TimeDisplay;
