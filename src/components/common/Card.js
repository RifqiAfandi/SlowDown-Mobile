/**
 * Card Component
 * Reusable card container with shadow
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
  ...props
}) => {
  const getPaddingSize = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return SPACING.sm;
      case 'large':
        return SPACING.lg;
      default:
        return SPACING.md;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      default:
        return styles.default;
    }
  };

  const cardStyle = [
    styles.container,
    getVariantStyle(),
    { padding: getPaddingSize() },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
  },
  default: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.ultraLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default Card;
