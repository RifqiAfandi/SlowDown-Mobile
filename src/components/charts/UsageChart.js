/**
 * Usage Chart Component
 * Bar chart showing app usage statistics
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SPACING, SOCIAL_MEDIA_APPS } from '../../constants';
import { getDayName } from '../../utils/dateUtils';

const screenWidth = Dimensions.get('window').width;

const UsageChart = ({
  data,
  type = 'daily', // 'daily' or 'weekly'
  style,
}) => {
  // Prepare chart data based on type
  const prepareChartData = () => {
    if (type === 'daily' && data) {
      // Daily chart - show usage per app
      // Data format: { appUsage: { "Instagram": 5, "YouTube": 10 }, totalMinutes: 15 }
      const appUsage = data.appUsage || data.apps || {};
      const labels = [];
      const values = [];
      
      // Get apps with usage, sorted by usage descending
      const appsWithUsage = SOCIAL_MEDIA_APPS
        .filter(app => (appUsage[app.name] || 0) > 0)
        .sort((a, b) => (appUsage[b.name] || 0) - (appUsage[a.name] || 0))
        .slice(0, 5); // Show top 5 apps
      
      if (appsWithUsage.length > 0) {
        appsWithUsage.forEach(app => {
          labels.push(app.name.substring(0, 3));
          values.push(appUsage[app.name] || 0);
        });
      } else {
        // Show placeholder if no usage
        SOCIAL_MEDIA_APPS.slice(0, 4).forEach(app => {
          labels.push(app.name.substring(0, 3));
          values.push(0);
        });
      }
      
      return {
        labels,
        datasets: [{ data: values.length > 0 ? values : [0] }],
      };
    } else if (type === 'weekly' && Array.isArray(data)) {
      // Weekly chart - show total usage per day
      const labels = data.map(day => getDayName(day.date || day.dateKey));
      const values = data.map(day => day.totalMinutes || 0);
      
      return {
        labels,
        datasets: [{ data: values.length > 0 ? values : [0] }],
      };
    }
    
    return {
      labels: ['N/A'],
      datasets: [{ data: [0] }],
    };
  };

  const chartData = prepareChartData();
  const chartWidth = screenWidth - SPACING.lg * 2;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 217, ${opacity})`,
    labelColor: () => COLORS.gray,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLORS.ultraLight,
    },
    barPercentage: 0.6,
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>
        {type === 'daily' ? 'Penggunaan Hari Ini' : 'Penggunaan Minggu Ini'}
      </Text>
      
      <BarChart
        data={chartData}
        width={chartWidth}
        height={200}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
        yAxisSuffix=" m"
      />
      
      <Text style={styles.subtitle}>
        {type === 'daily' ? '(menit per aplikasi)' : '(total menit per hari)'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default UsageChart;
