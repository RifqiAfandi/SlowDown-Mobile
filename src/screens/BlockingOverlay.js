/**
 * Blocking Overlay Screen
 * Full-screen overlay displayed when social media is opened and time is up
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING } from '../constants';
import { useTimeTracking } from '../contexts/TimeTrackingContext';

const BlockingOverlay = () => {
  const insets = useSafeAreaInsets();
  const { isBlocked, blockReason, isTimeUp } = useTimeTracking();

  // Prevent back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, []);

  const getMessage = () => {
    if (isBlocked) {
      return {
        title: 'Akses Diblokir',
        subtitle: blockReason || 'Akses Anda telah diblokir oleh admin.',
        icon: 'block-helper',
      };
    }
    
    return {
      title: 'Waktu Habis',
      subtitle: 'Waktu akses media sosial Anda hari ini telah habis. Istirahat sejenak dan kembali besok!',
      icon: 'timer-off',
    };
  };

  const message = getMessage();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.overlay} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name={message.icon} size={80} color={COLORS.white} />
        </View>
        
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.subtitle}>{message.subtitle}</Text>
        
        <View style={styles.infoBox}>
          <Icon name="information" size={24} color={COLORS.primaryLight} />
          <Text style={styles.infoText}>
            Waktu akses akan direset setiap hari pada pukul 00:00 WIB.
            {'\n\n'}
            Gunakan fitur "Minta Waktu Tambahan" jika membutuhkan akses darurat.
          </Text>
        </View>
        
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🐢</Text>
          <Text style={styles.logoText}>SlowDown</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING.xl,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xxl,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  logoText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default BlockingOverlay;
