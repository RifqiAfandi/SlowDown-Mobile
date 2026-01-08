/**
 * App Usage List Component
 * List showing usage per social media app
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, SOCIAL_MEDIA_APPS } from '../../constants';
import { formatMinutesToReadable } from '../../utils/dateUtils';

const AppUsageItem = ({ app, minutes }) => {
  const percentage = minutes > 0 ? Math.min(100, (minutes / 30) * 100) : 0;
  
  return (
    <View style={styles.item}>
      <View style={[styles.iconContainer, { backgroundColor: app.color + '20' }]}>
        <Icon name={app.icon} size={24} color={app.color} />
      </View>
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
          <Text style={styles.duration}>{formatMinutesToReadable(minutes)}</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: app.color },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const AppUsageList = ({
  usage,
  style,
}) => {
  // Get appUsage from usage data - this comes from device native module
  // Format: { "Instagram": 5, "YouTube": 10, ... } where key is app NAME (not id)
  const appUsage = usage?.appUsage || {};
  
  // Map SOCIAL_MEDIA_APPS to include usage minutes by matching app.name with appUsage keys
  const appsWithUsage = SOCIAL_MEDIA_APPS
    .map(app => ({
      ...app,
      minutes: appUsage[app.name] || 0, // Match by name, not id
    }))
    .filter(app => app.minutes > 0) // Only show apps with usage
    .sort((a, b) => b.minutes - a.minutes); // Sort by usage descending
  
  // If no usage data, show first 5 apps with 0 minutes as placeholder
  const displayApps = appsWithUsage.length > 0 
    ? appsWithUsage 
    : SOCIAL_MEDIA_APPS.slice(0, 5).map(app => ({ ...app, minutes: 0 }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Detail Penggunaan</Text>
        {usage?.totalMinutes > 0 && (
          <Text style={styles.totalText}>
            Total: {formatMinutesToReadable(usage.totalMinutes)}
          </Text>
        )}
      </View>
      
      {displayApps.map((app, index) => (
        <View key={app.id}>
          <AppUsageItem app={app} minutes={app.minutes} />
          {index < displayApps.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
      
      {appsWithUsage.length === 0 && (
        <Text style={styles.emptyText}>
          Belum ada penggunaan media sosial hari ini
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  totalText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  appName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.dark,
    flex: 1,
  },
  duration: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginLeft: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.ultraLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.ultraLight,
    marginVertical: SPACING.xs,
  },
});

export default AppUsageList;
