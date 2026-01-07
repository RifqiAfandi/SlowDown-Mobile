/**
 * Empty State Component
 * Display when no data is available with beautiful SVG illustrations
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../../constants';
import Button from './Button';
import { 
  EmptyDataIllustration, 
  NoUsageIllustration,
  TimeUpIllustration,
  SuccessIllustration,
} from '../illustrations';

const EmptyState = ({
  icon = 'inbox-outline',
  illustration = null, // 'empty-data', 'no-usage', 'time-up', 'success'
  title = 'Tidak ada data',
  message,
  actionText,
  onAction,
  style,
  color = COLORS.primary,
}) => {
  const renderIllustration = () => {
    switch (illustration) {
      case 'empty-data':
        return <EmptyDataIllustration size={160} color={color} />;
      case 'no-usage':
        return <NoUsageIllustration size={160} color={color} />;
      case 'time-up':
        return <TimeUpIllustration size={160} color={COLORS.danger} />;
      case 'success':
        return <SuccessIllustration size={160} color={COLORS.success} />;
      default:
        return <Icon name={icon} size={64} color={COLORS.lightGray} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        {renderIllustration()}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionText && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          variant="outline"
          size="small"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  illustrationContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.lg,
  },
});

export default EmptyState;
