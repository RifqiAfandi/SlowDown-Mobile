/**
 * Avatar Component
 * Display user avatar with fallback
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../constants';

const Avatar = ({
  source,
  name,
  size = 'medium',
  style,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'xlarge':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 24;
      case 'xlarge':
        return 36;
      default:
        return 18;
    }
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();

  // Get initials from name
  const getInitials = () => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color from name
  const getBackgroundColor = () => {
    if (!name) return COLORS.gray;
    
    const colors = [
      COLORS.primary,
      COLORS.secondary,
      COLORS.success,
      COLORS.info,
      COLORS.warning,
      '#E17055',
      '#00B894',
      '#6C5CE7',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: getBackgroundColor(),
    },
    style,
  ];

  if (source && source.uri) {
    return (
      <Image
        source={source}
        style={[
          containerStyle,
          styles.image,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default Avatar;
