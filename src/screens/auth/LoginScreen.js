/**
 * Login Screen
 * Google Sign-In authentication screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Button } from '../../components';
import { Logger } from '../../utils/logger';

const logger = Logger.create('LoginScreen');

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
      logger.info('User signed in successfully');
    } catch (error) {
      logger.error('Sign in failed', error);
      
      let message = 'Terjadi kesalahan saat login. Silakan coba lagi.';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        message = 'Login dibatalkan.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        message = 'Google Play Services tidak tersedia. Pastikan perangkat Anda mendukung Google Play Services.';
      }
      
      Alert.alert('Login Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.logo}>🐢</Text>
        <Text style={styles.appName}>SlowDown</Text>
        <Text style={styles.tagline}>Kurangi doom scrolling, tingkatkan produktivitas</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.featureList}>
          <FeatureItem
            icon="timer-outline"
            title="Batasi Waktu"
            description="Batasi penggunaan media sosial 30 menit per hari"
          />
          <FeatureItem
            icon="chart-line"
            title="Pantau Penggunaan"
            description="Lihat statistik penggunaan harian dan mingguan"
          />
          <FeatureItem
            icon="shield-check"
            title="Blokir Otomatis"
            description="Media sosial diblokir saat waktu habis"
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Masuk dengan Google"
          onPress={handleGoogleSignIn}
          loading={loading}
          size="large"
          fullWidth
          icon={<Icon name="google" size={20} color={COLORS.white} />}
        />
        
        <Text style={styles.terms}>
          Dengan masuk, Anda menyetujui{' '}
          <Text style={styles.link}>Syarat & Ketentuan</Text> dan{' '}
          <Text style={styles.link}>Kebijakan Privasi</Text> kami.
        </Text>
      </View>
    </View>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Icon name={icon} size={24} color={COLORS.primary} />
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONTS.sizes.xxxl + 8,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  featureList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  footer: {
    paddingVertical: SPACING.xl,
  },
  terms: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
