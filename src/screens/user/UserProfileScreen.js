/**
 * User Profile Screen
 * User settings and profile information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';
import { COLORS, FONTS, SPACING, DEFAULT_DAILY_LIMIT } from '../../constants';
import { Card, Button, Avatar, Header } from '../../components/common';
import { formatMinutesToReadable, formatDate } from '../../utils/dateUtils';
import { Logger } from '../../utils/logger';

const logger = Logger.create('UserProfile');

const UserProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData, signOut } = useAuth();
  const { totalAllowedMinutes, bonusMinutes } = useTimeTracking();
  
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
              logger.info('User signed out');
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
      <Header title="Profil" subtitle="Pengaturan akun" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <Avatar
            source={userData?.photoURL ? { uri: userData.photoURL } : null}
            name={userData?.displayName || userData?.email}
            size="xlarge"
          />
          <Text style={styles.userName}>
            {userData?.displayName || userData?.email?.split('@')[0] || 'User'}
          </Text>
          {userData?.displayName && (
            <Text style={styles.userEmail}>{userData?.email}</Text>
          )}
          {!userData?.displayName && (
            <Text style={styles.userEmailOnly}>{userData?.email}</Text>
          )}
          
          <View style={styles.memberInfo}>
            <Icon name="calendar-check" size={16} color={COLORS.gray} />
            <Text style={styles.memberText}>Bergabung sejak {memberSince}</Text>
          </View>
        </Card>

        {/* Time Info Card */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Waktu Akses</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Batas Harian</Text>
              <Text style={styles.infoValue}>
                {formatMinutesToReadable(DEFAULT_DAILY_LIMIT)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bonus</Text>
              <Text style={[styles.infoValue, { color: COLORS.success }]}>
                +{formatMinutesToReadable(bonusMinutes)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                {formatMinutesToReadable(totalAllowedMinutes)}
              </Text>
            </View>
          </View>
        </Card>

        {/* App Info */}
        <Card style={styles.sectionCard}>
          <View style={styles.appInfoContainer}>
            <View style={styles.appIconContainer}>
              <Icon name="timer-sand" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.appInfoTextContainer}>
              <Text style={styles.appInfoText}>SlowDown</Text>
              <Text style={styles.appInfoVersion}>Versi 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.appInfoSubtext}>
            Kurangi doom scrolling, tingkatkan produktivitas dan kesehatan mental Anda.
          </Text>
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
  userEmailOnly: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 2,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  appInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  appInfoTextContainer: {
    flex: 1,
  },
  appInfoText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.dark,
  },
  appInfoVersion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  appInfoSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 20,
  },
  signOutButton: {
    marginTop: SPACING.md,
  },
});

export default UserProfileScreen;
