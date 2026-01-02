/**
 * Admin Dashboard Screen
 * Overview of all users and system stats
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { timeRequestService } from '../../services/timeRequestService';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Card, Avatar, Header } from '../../components/common';
import { Logger } from '../../utils/logger';

const logger = Logger.create('AdminDashboard');

const AdminDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to users
  useEffect(() => {
    const unsubscribe = userService.subscribeToAllUsers((usersList) => {
      setUsers(usersList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Subscribe to pending requests
  useEffect(() => {
    const unsubscribe = timeRequestService.subscribeToPendingRequests((requests) => {
      setPendingRequests(requests);
    });

    return unsubscribe;
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Data will refresh automatically via subscriptions
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isBlocked && (u.todayUsedMinutes || 0) > 0).length;
  const blockedUsers = users.filter(u => u.isBlocked).length;
  const timeUpUsers = users.filter(u => {
    const total = (u.dailyLimitMinutes || 30) + (u.bonusMinutes || 0);
    const remaining = total - (u.todayUsedMinutes || 0);
    return remaining <= 0 && !u.isBlocked;
  }).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Dashboard Admin"
        subtitle={`Selamat datang, ${userData?.displayName || 'Admin'}!`}
        variant="secondary"
        rightComponent={
          <Avatar
            source={userData?.photoURL ? { uri: userData.photoURL } : null}
            name={userData?.displayName}
            size="small"
          />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Icon name="account-group" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total User</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Icon name="account-check" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{activeUsers}</Text>
            <Text style={styles.statLabel}>Aktif Hari Ini</Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Icon name="timer-off" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>{timeUpUsers}</Text>
            <Text style={styles.statLabel}>Waktu Habis</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.danger + '20' }]}>
              <Icon name="block-helper" size={24} color={COLORS.danger} />
            </View>
            <Text style={styles.statValue}>{blockedUsers}</Text>
            <Text style={styles.statLabel}>Diblokir</Text>
          </Card>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name="clock-alert" size={24} color={COLORS.warning} />
              <Text style={styles.alertTitle}>Permintaan Menunggu</Text>
            </View>
            <Text style={styles.alertText}>
              Ada {pendingRequests.length} permintaan waktu tambahan yang perlu diproses.
            </Text>
          </Card>
        )}

        {/* Recent Activity */}
        <Card style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          </View>
          
          {users.slice(0, 5).map((user, index) => (
            <View key={user.id} style={styles.activityItem}>
              <Avatar
                source={user.photoURL ? { uri: user.photoURL } : null}
                name={user.displayName}
                size="small"
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityName}>{user.displayName}</Text>
                <Text style={styles.activityDetail}>
                  {user.todayUsedMinutes || 0} menit hari ini
                </Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: user.isBlocked
                      ? COLORS.danger
                      : (user.todayUsedMinutes || 0) > 0
                      ? COLORS.success
                      : COLORS.gray,
                  },
                ]}
              />
            </View>
          ))}
          
          {users.length === 0 && (
            <Text style={styles.emptyText}>Belum ada pengguna terdaftar</Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Panduan Admin</Text>
          
          <View style={styles.guideItem}>
            <Icon name="numeric-1-circle" size={24} color={COLORS.primary} />
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Kelola Pengguna</Text>
              <Text style={styles.guideText}>
                Lihat dan kelola semua pengguna di tab "Pengguna"
              </Text>
            </View>
          </View>
          
          <View style={styles.guideItem}>
            <Icon name="numeric-2-circle" size={24} color={COLORS.primary} />
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Proses Permintaan</Text>
              <Text style={styles.guideText}>
                Setujui atau tolak permintaan waktu di tab "Permintaan"
              </Text>
            </View>
          </View>
          
          <View style={styles.guideItem}>
            <Icon name="numeric-3-circle" size={24} color={COLORS.primary} />
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>Monitor Penggunaan</Text>
              <Text style={styles.guideText}>
                Lihat detail penggunaan setiap user dengan klik nama mereka
              </Text>
            </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: COLORS.warning + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  alertTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  alertText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
    marginLeft: 32,
  },
  recentCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  recentHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ultraLight,
  },
  activityContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  activityName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.dark,
  },
  activityDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  quickActions: {
    padding: SPACING.md,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  guideContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  guideTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  guideText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
});

export default AdminDashboardScreen;
