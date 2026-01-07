/**
 * Loading Screen
 * Displayed while checking authentication state
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Icon name="timer-sand" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>SlowDown</Text>
      </View>
      
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
      
      <Text style={styles.loadingText}>Memuat...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  spinner: {
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
  },
});

export default LoadingScreen;
