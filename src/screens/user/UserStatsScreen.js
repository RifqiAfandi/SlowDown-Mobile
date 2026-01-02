/**
 * User Stats Screen
 * Shows detailed usage statistics
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';
import { COLORS, FONTS, SPACING, SOCIAL_MEDIA_APPS } from '../../constants';
import { Card, Header } from '../../components/common';
import { UsageChart, AppUsageList } from '../../components/charts';
import { formatMinutesToReadable } from '../../utils/dateUtils';

const UserStatsScreen = () => {
  const insets = useSafeAreaInsets();
  const { todayUsage, weeklyUsage, usedMinutes, refreshUsage } = useTimeTracking();
  
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState('daily'); // 'daily' or 'weekly'

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUsage();
    setRefreshing(false);
  }, [refreshUsage]);

  // Calculate weekly totals
  const weeklyTotal = weeklyUsage.reduce((sum, day) => sum + (day.totalMinutes || 0), 0);
  const dailyAverage = weeklyTotal / 7;

  // Find most used app this week
  const appTotals = {};
  SOCIAL_MEDIA_APPS.forEach(app => {
    appTotals[app.id] = 0;
  });
  
  weeklyUsage.forEach(day => {
    Object.entries(day.apps || {}).forEach(([appId, minutes]) => {
      if (appTotals[appId] !== undefined) {
        appTotals[appId] += minutes;
      }
    });
  });

  let mostUsedApp = null;
  let maxUsage = 0;
  Object.entries(appTotals).forEach(([appId, total]) => {
    if (total > maxUsage) {
      maxUsage = total;
      mostUsedApp = SOCIAL_MEDIA_APPS.find(app => app.id === appId);
    }
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Statistik" subtitle="Pantau penggunaan media sosial Anda" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Icon name="clock-outline" size={28} color={COLORS.primary} />
            <Text style={styles.summaryValue}>{formatMinutesToReadable(usedMinutes)}</Text>
            <Text style={styles.summaryLabel}>Hari Ini</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Icon name="calendar-week" size={28} color={COLORS.secondary} />
            <Text style={styles.summaryValue}>{formatMinutesToReadable(weeklyTotal)}</Text>
            <Text style={styles.summaryLabel}>Minggu Ini</Text>
          </Card>
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Icon name="chart-timeline-variant" size={28} color={COLORS.success} />
            <Text style={styles.summaryValue}>{formatMinutesToReadable(dailyAverage)}</Text>
            <Text style={styles.summaryLabel}>Rata-rata/Hari</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            {mostUsedApp ? (
              <>
                <Icon name={mostUsedApp.icon} size={28} color={mostUsedApp.color} />
                <Text style={styles.summaryValue} numberOfLines={1}>{mostUsedApp.name}</Text>
                <Text style={styles.summaryLabel}>Paling Sering</Text>
              </>
            ) : (
              <>
                <Icon name="help-circle" size={28} color={COLORS.gray} />
                <Text style={styles.summaryValue}>-</Text>
                <Text style={styles.summaryLabel}>Paling Sering</Text>
              </>
            )}
          </Card>
        </View>

        {/* Chart Toggle */}
        <View style={styles.chartToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              chartType === 'daily' && styles.toggleButtonActive,
            ]}
            onPress={() => setChartType('daily')}
          >
            <Text
              style={[
                styles.toggleText,
                chartType === 'daily' && styles.toggleTextActive,
              ]}
            >
              Harian
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              chartType === 'weekly' && styles.toggleButtonActive,
            ]}
            onPress={() => setChartType('weekly')}
          >
            <Text
              style={[
                styles.toggleText,
                chartType === 'weekly' && styles.toggleTextActive,
              ]}
            >
              Mingguan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Usage Chart */}
        <Card style={styles.chartCard} padding="small">
          <UsageChart
            data={chartType === 'daily' ? todayUsage : weeklyUsage}
            type={chartType}
          />
        </Card>

        {/* Today's Usage Detail */}
        <AppUsageList usage={todayUsage} style={styles.usageList} />

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Icon name="information-outline" size={24} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Tentang Statistik</Text>
            <Text style={styles.infoText}>
              Data penggunaan dihitung berdasarkan waktu akses ke aplikasi media sosial.
              Statistik direset setiap hari pada pukul 00:00 WIB.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  summaryValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.ultraLight,
    borderRadius: 12,
    padding: 4,
    marginVertical: SPACING.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  usageList: {
    marginBottom: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 20,
  },
});

export default UserStatsScreen;
