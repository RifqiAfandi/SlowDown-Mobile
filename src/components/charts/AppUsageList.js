/**
 * App Usage List Component
 * List showing usage per social media app
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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
          <Text style={styles.appName}>{app.name}</Text>
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
  const renderItem = ({ item }) => {
    const minutes = usage?.apps?.[item.id] || 0;
    return <AppUsageItem app={item} minutes={minutes} />;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Detail Penggunaan</Text>
      
      <FlatList
        data={SOCIAL_MEDIA_APPS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
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
  },
  duration: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
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
