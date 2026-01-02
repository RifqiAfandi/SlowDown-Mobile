/**
 * User List Item Component
 * Display user info in admin user list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import Avatar from '../common/Avatar';
import { formatMinutesToReadable } from '../../utils/dateUtils';

const UserListItem = ({
  user,
  onPress,
  style,
}) => {
  const {
    displayName,
    email,
    photoURL,
    todayUsedMinutes = 0,
    dailyLimitMinutes = 30,
    bonusMinutes = 0,
    isBlocked = false,
    pendingTimeRequest,
  } = user;

  const totalAllowed = dailyLimitMinutes + bonusMinutes;
  const remaining = Math.max(0, totalAllowed - todayUsedMinutes);
  const isTimeUp = remaining <= 0;

  // Determine status
  const getStatus = () => {
    if (isBlocked) {
      return { text: 'Diblokir', color: COLORS.danger, icon: 'block-helper' };
    }
    if (pendingTimeRequest) {
      return { text: 'Permintaan', color: COLORS.warning, icon: 'clock-alert' };
    }
    if (isTimeUp) {
      return { text: 'Habis', color: COLORS.danger, icon: 'timer-off' };
    }
    return { text: 'Aktif', color: COLORS.success, icon: 'check-circle' };
  };

  const status = getStatus();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar
        source={photoURL ? { uri: photoURL } : null}
        name={displayName}
        size="medium"
      />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
        
        <View style={styles.timeInfo}>
          <Icon name="clock-outline" size={14} color={COLORS.gray} />
          <Text style={styles.timeText}>
            {formatMinutesToReadable(remaining)} tersisa
          </Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Icon name={status.icon} size={14} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
        
        <Icon name="chevron-right" size={20} color={COLORS.lightGray} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  email: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  timeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default UserListItem;
