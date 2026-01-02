/**
 * Loading Screen
 * Displayed while checking authentication state
 */

import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🐢</Text>
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
  logo: {
    fontSize: 72,
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
