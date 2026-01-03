/**
 * Login Screen
 * Google Sign-In and Email authentication screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Button } from '../../components';
import { Logger } from '../../utils/logger';
import { isValidEmail, isValidVerificationCode } from '../../utils/validation';

const logger = Logger.create('LoginScreen');

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { signIn, signInWithEmail, verifyEmailCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

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

  const handleEmailSignIn = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Masukkan alamat email yang valid.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email);
      setPendingEmail(email);
      setShowVerification(true);
      Alert.alert(
        'Kode Verifikasi Terkirim',
        `Kode verifikasi telah dikirim ke ${email}. Silakan cek inbox Anda.`
      );
    } catch (error) {
      logger.error('Email sign in failed', error);
      Alert.alert('Error', 'Gagal mengirim kode verifikasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isValidVerificationCode(verificationCode)) {
      Alert.alert('Error', 'Masukkan kode verifikasi 6 digit.');
      return;
    }

    try {
      setLoading(true);
      await verifyEmailCode(pendingEmail, verificationCode);
      logger.info('Email verification successful');
    } catch (error) {
      logger.error('Verification failed', error);
      Alert.alert('Error', 'Kode verifikasi salah atau sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  const resetEmailLogin = () => {
    setShowEmailLogin(false);
    setShowVerification(false);
    setEmail('');
    setVerificationCode('');
    setPendingEmail('');
  };

  const renderVerificationForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Verifikasi Email</Text>
      <Text style={styles.formDescription}>
        Masukkan kode 6 digit yang dikirim ke {pendingEmail}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="000000"
        placeholderTextColor={COLORS.lightGray}
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
      
      <Button
        title="Verifikasi"
        onPress={handleVerifyCode}
        loading={loading}
        size="large"
        fullWidth
      />
      
      <TouchableOpacity onPress={resetEmailLogin} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Kembali</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmailForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Login dengan Email</Text>
      <Text style={styles.formDescription}>
        Masukkan email Anda untuk menerima kode verifikasi
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="email@gmail.com"
        placeholderTextColor={COLORS.lightGray}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Button
        title="Kirim Kode Verifikasi"
        onPress={handleEmailSignIn}
        loading={loading}
        size="large"
        fullWidth
      />
      
      <TouchableOpacity onPress={resetEmailLogin} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Kembali</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMainContent = () => (
    <>
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
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <Button
          title="Masuk dengan Email"
          onPress={() => setShowEmailLogin(true)}
          variant="outline"
          size="large"
          fullWidth
          icon={<Icon name="email-outline" size={20} color={COLORS.primary} />}
        />
        
        <Text style={styles.terms}>
          Dengan masuk, Anda menyetujui{' '}
          <Text style={styles.link}>Syarat & Ketentuan</Text> dan{' '}
          <Text style={styles.link}>Kebijakan Privasi</Text> kami.
        </Text>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        <View style={styles.header}>
          <Text style={styles.logo}>🐢</Text>
          <Text style={styles.appName}>SlowDown</Text>
          <Text style={styles.tagline}>Kurangi doom scrolling, tingkatkan produktivitas</Text>
        </View>
        
        {showVerification ? renderVerificationForm() : 
         showEmailLogin ? renderEmailForm() : 
         renderMainContent()}
      </ScrollView>
    </KeyboardAvoidingView>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.gray,
    fontSize: FONTS.sizes.sm,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  formTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  formDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  backButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
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
