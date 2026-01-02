/**
 * Header Component
 * Screen header with title and optional actions
 */

import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../../constants';

const Header = ({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  rightComponent,
  variant = 'default',
  style,
}) => {
  const insets = useSafeAreaInsets();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          title: styles.primaryTitle,
          subtitle: styles.primarySubtitle,
          iconColor: COLORS.white,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          title: styles.secondaryTitle,
          subtitle: styles.secondarySubtitle,
          iconColor: COLORS.white,
        };
      case 'transparent':
        return {
          container: styles.transparentContainer,
          title: styles.defaultTitle,
          subtitle: styles.defaultSubtitle,
          iconColor: COLORS.dark,
        };
      default:
        return {
          container: styles.defaultContainer,
          title: styles.defaultTitle,
          subtitle: styles.defaultSubtitle,
          iconColor: COLORS.dark,
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.container,
        variantStyle.container,
        { paddingTop: insets.top + SPACING.sm },
        style,
      ]}
    >
      <StatusBar
        barStyle={variant === 'default' || variant === 'transparent' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.content}>
        {leftIcon && (
          <TouchableOpacity
            style={styles.leftButton}
            onPress={onLeftPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={leftIcon} size={24} color={variantStyle.iconColor} />
          </TouchableOpacity>
        )}
        
        <View style={[styles.titleContainer, !leftIcon && styles.titleContainerNoLeft]}>
          <Text style={[styles.title, variantStyle.title]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, variantStyle.subtitle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {rightComponent ? (
          <View style={styles.rightButton}>{rightComponent}</View>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={rightIcon} size={24} color={variantStyle.iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  titleContainerNoLeft: {
    marginLeft: 0,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  leftButton: {
    padding: SPACING.xs,
  },
  rightButton: {
    padding: SPACING.xs,
  },
  placeholder: {
    width: 32,
  },
  
  // Variants
  defaultContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ultraLight,
  },
  defaultTitle: {
    color: COLORS.dark,
  },
  defaultSubtitle: {
    color: COLORS.gray,
  },
  primaryContainer: {
    backgroundColor: COLORS.primary,
  },
  primaryTitle: {
    color: COLORS.white,
  },
  primarySubtitle: {
    color: COLORS.primaryLight,
  },
  secondaryContainer: {
    backgroundColor: COLORS.secondary,
  },
  secondaryTitle: {
    color: COLORS.white,
  },
  secondarySubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
});

export default Header;
