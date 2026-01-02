/**
 * Admin Profile Screen
 * Admin settings and profile information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING, ADMIN_EMAIL } from '../../constants';
import { Card, Button, Avatar, Header } from '../../components/common';
import { formatDate } from '../../utils/dateUtils';
import { Logger } from '../../utils/logger';

const logger = Logger.create('AdminProfile');

const AdminProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              await signOut();
              logger.info('Admin signed out');
            } catch (error) {
              logger.error('Sign out failed', error);
              Alert.alert('Gagal', 'Gagal keluar. Silakan coba lagi.');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const memberSince = userData?.createdAt?.toDate
    ? formatDate(userData.createdAt.toDate(), 'dd MMMM yyyy')
    : '-';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Profil Admin" subtitle="Pengaturan akun" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.adminBadge}>
            <Icon name="shield-crown" size={16} color={COLORS.secondary} />
            <Text style={styles.adminBadgeText}>Administrator</Text>
          </View>
          
          <Avatar
            source={userData?.photoURL ? { uri: userData.photoURL } : null}
            name={userData?.displayName}
            size="xlarge"
          />
          <Text style={styles.userName}>{userData?.displayName || 'Admin'}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
          
          <View style={styles.memberInfo}>
            <Icon name="calendar-check" size={16} color={COLORS.gray} />
            <Text style={styles.memberText}>Admin sejak {memberSince}</Text>
          </View>
        </Card>

        {/* Admin Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hak Akses Admin</Text>
          
          <View style={styles.accessItem}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.accessText}>Melihat semua data pengguna</Text>
          </View>
          <View style={styles.accessItem}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.accessText}>Mengelola waktu akses pengguna</Text>
          </View>
          <View style={styles.accessItem}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.accessText}>Memblokir/membuka blokir pengguna</Text>
          </View>
          <View style={styles.accessItem}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.accessText}>Menyetujui permintaan waktu tambahan</Text>
          </View>
          <View style={styles.accessItem}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.accessText}>Melihat statistik penggunaan</Text>
          </View>
        </Card>

        {/* Important Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="information" size={24} color={COLORS.info} />
            <Text style={styles.infoTitle}>Informasi Penting</Text>
          </View>
          <Text style={styles.infoText}>
            Akun admin ditentukan berdasarkan email:{'\n'}
            <Text style={styles.emailHighlight}>{ADMIN_EMAIL}</Text>
            {'\n\n'}
            Hanya email ini yang memiliki akses admin. Pengguna lain yang login dengan email berbeda akan otomatis terdaftar sebagai user biasa.
          </Text>
        </Card>

        {/* App Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
          
          <View style={styles.appInfo}>
            <Text style={styles.appLogo}>🐢</Text>
            <Text style={styles.appName}>SlowDown</Text>
            <Text style={styles.appVersion}>v1.0.0</Text>
            <Text style={styles.appDescription}>
              Aplikasi untuk mengurangi penggunaan media sosial berlebihan
            </Text>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Keluar"
          onPress={handleSignOut}
          variant="danger"
          size="large"
          fullWidth
          loading={signingOut}
          icon={<Icon name="logout" size={20} color={COLORS.white} />}
          style={styles.signOutButton}
        />
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
  profileCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  adminBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: SPACING.md,
  },
  userEmail: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    marginTop: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.ultraLight,
  },
  memberText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  accessText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
  },
  infoCard: {
    backgroundColor: COLORS.info + '10',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.info,
    marginLeft: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '600',
    color: COLORS.secondary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  appLogo: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  appName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  appDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  signOutButton: {
    marginTop: SPACING.md,
  },
});

export default AdminProfileScreen;
