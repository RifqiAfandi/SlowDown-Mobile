/**
 * User Detail Screen (Admin)
 * View and manage individual user details
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { userService } from '../../services/userService';
import { usageService } from '../../services/usageService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING, DEFAULT_DAILY_LIMIT } from '../../constants';
import { Card, Button, Avatar, Input } from '../../components/common';
import { UsageChart, AppUsageList } from '../../components/charts';
import { formatMinutesToReadable, formatDate } from '../../utils/dateUtils';
import { Logger } from '../../utils/logger';

const logger = Logger.create('UserDetail');

const UserDetailScreen = ({ route }) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const { userData: adminData } = useAuth();
  
  const [user, setUser] = useState(null);
  const [todayUsage, setTodayUsage] = useState(null);
  const [weeklyUsage, setWeeklyUsage] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingTime, setAddingTime] = useState(false);
  const [timeToAdd, setTimeToAdd] = useState('');
  const [reducingTime, setReducingTime] = useState(false);
  const [timeToReduce, setTimeToReduce] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Subscribe to user data
  useEffect(() => {
    const unsubscribe = userService.subscribeToUser(userId, (userData) => {
      setUser(userData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Load usage data
  const loadUsageData = useCallback(async () => {
    try {
      const daily = await usageService.getDailyUsage(userId);
      const weekly = await usageService.getWeeklyUsage(userId);
      setTodayUsage(daily);
      setWeeklyUsage(weekly);
    } catch (error) {
      logger.error('Failed to load usage data', error);
    }
  }, [userId]);

  useEffect(() => {
    loadUsageData();
  }, [loadUsageData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsageData();
    setRefreshing(false);
  }, [loadUsageData]);

  // Calculate remaining time
  const totalAllowed = (user?.dailyLimitMinutes || DEFAULT_DAILY_LIMIT) + (user?.bonusMinutes || 0);
  const remaining = Math.max(0, totalAllowed - (user?.todayUsedMinutes || 0));

  // Handle name update
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }
    
    try {
      setActionLoading(true);
      await userService.updateUserDisplayName(userId, newName.trim());
      setEditingName(false);
      setNewName('');
      Alert.alert('Berhasil', 'Nama pengguna berhasil diubah');
    } catch (error) {
      logger.error('Failed to update name', error);
      Alert.alert('Gagal', 'Gagal mengubah nama');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle add time
  const handleAddTime = async () => {
    const mins = parseInt(timeToAdd, 10);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert('Error', 'Masukkan jumlah menit yang valid');
      return;
    }
    
    try {
      setActionLoading(true);
      await userService.addBonusTime(userId, mins);
      setAddingTime(false);
      setTimeToAdd('');
      Alert.alert('Berhasil', `${mins} menit berhasil ditambahkan`);
    } catch (error) {
      logger.error('Failed to add time', error);
      Alert.alert('Gagal', 'Gagal menambahkan waktu');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reduce time
  const handleReduceTime = async () => {
    const mins = parseInt(timeToReduce, 10);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert('Error', 'Masukkan jumlah menit yang valid');
      return;
    }
    
    try {
      setActionLoading(true);
      await userService.reduceBonusTime(userId, mins);
      setReducingTime(false);
      setTimeToReduce('');
      Alert.alert('Berhasil', `${mins} menit berhasil dikurangi`);
    } catch (error) {
      logger.error('Failed to reduce time', error);
      Alert.alert('Gagal', 'Gagal mengurangi waktu');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle block/unblock
  const handleToggleBlock = () => {
    const action = user?.isBlocked ? 'membuka blokir' : 'memblokir';
    
    Alert.alert(
      user?.isBlocked ? 'Buka Blokir' : 'Blokir Pengguna',
      `Apakah Anda yakin ingin ${action} pengguna ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: user?.isBlocked ? 'Buka Blokir' : 'Blokir',
          style: user?.isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              if (user?.isBlocked) {
                await userService.unblockUser(userId);
              } else {
                await userService.blockUser(userId, 'Diblokir oleh admin');
              }
              Alert.alert('Berhasil', `Pengguna berhasil ${user?.isBlocked ? 'dibuka blokirnya' : 'diblokir'}`);
            } catch (error) {
              logger.error('Failed to toggle block', error);
              Alert.alert('Gagal', `Gagal ${action} pengguna`);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Section */}
        <Card style={styles.profileCard} variant="elevated">
          <Avatar
            source={user.photoURL ? { uri: user.photoURL } : null}
            name={user.displayName}
            size="xlarge"
          />
          
          {editingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Nama baru"
                autoFocus
              />
              <View style={styles.editNameActions}>
                <Button
                  title="Batal"
                  variant="ghost"
                  size="small"
                  onPress={() => {
                    setEditingName(false);
                    setNewName('');
                  }}
                />
                <Button
                  title="Simpan"
                  size="small"
                  onPress={handleUpdateName}
                  loading={actionLoading}
                />
              </View>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.displayName}</Text>
              <Button
                title="Edit"
                variant="ghost"
                size="small"
                onPress={() => {
                  setNewName(user.displayName);
                  setEditingName(true);
                }}
              />
            </View>
          )}
          
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {user.isBlocked && (
            <View style={styles.blockedBadge}>
              <Icon name="block-helper" size={16} color={COLORS.danger} />
              <Text style={styles.blockedText}>Diblokir</Text>
            </View>
          )}
        </Card>

        {/* Time Management */}
        <Card style={styles.timeCard}>
          <Text style={styles.sectionTitle}>Waktu Akses</Text>
          
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Terpakai</Text>
              <Text style={styles.timeValue}>
                {formatMinutesToReadable(user.todayUsedMinutes || 0)}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Tersisa</Text>
              <Text style={[styles.timeValue, { color: remaining > 0 ? COLORS.success : COLORS.danger }]}>
                {formatMinutesToReadable(remaining)}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Bonus</Text>
              <Text style={[styles.timeValue, { color: COLORS.primary }]}>
                +{formatMinutesToReadable(user.bonusMinutes || 0)}
              </Text>
            </View>
          </View>

          {/* Add Time */}
          {addingTime ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.timeInput}
                value={timeToAdd}
                onChangeText={setTimeToAdd}
                placeholder="Menit"
                keyboardType="number-pad"
                autoFocus
              />
              <Button
                title="Batal"
                variant="ghost"
                size="small"
                onPress={() => setAddingTime(false)}
              />
              <Button
                title="Tambah"
                variant="success"
                size="small"
                onPress={handleAddTime}
                loading={actionLoading}
              />
            </View>
          ) : reducingTime ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.timeInput}
                value={timeToReduce}
                onChangeText={setTimeToReduce}
                placeholder="Menit"
                keyboardType="number-pad"
                autoFocus
              />
              <Button
                title="Batal"
                variant="ghost"
                size="small"
                onPress={() => setReducingTime(false)}
              />
              <Button
                title="Kurangi"
                variant="danger"
                size="small"
                onPress={handleReduceTime}
                loading={actionLoading}
              />
            </View>
          ) : (
            <View style={styles.timeActions}>
              <Button
                title="Tambah Waktu"
                variant="success"
                size="small"
                onPress={() => setAddingTime(true)}
                icon={<Icon name="plus" size={16} color={COLORS.white} />}
                style={styles.timeButton}
              />
              <Button
                title="Kurangi Waktu"
                variant="outline"
                size="small"
                onPress={() => setReducingTime(true)}
                icon={<Icon name="minus" size={16} color={COLORS.primary} />}
                style={styles.timeButton}
              />
            </View>
          )}
        </Card>

        {/* Block/Unblock */}
        <Button
          title={user.isBlocked ? 'Buka Blokir Pengguna' : 'Blokir Pengguna'}
          variant={user.isBlocked ? 'success' : 'danger'}
          onPress={handleToggleBlock}
          loading={actionLoading}
          fullWidth
          style={styles.blockButton}
        />

        {/* Usage Charts */}
        <Card style={styles.chartCard} padding="small">
          <UsageChart data={todayUsage} type="daily" />
        </Card>

        <Card style={styles.chartCard} padding="small">
          <UsageChart data={weeklyUsage} type="weekly" />
        </Card>

        {/* Today's Usage */}
        <AppUsageList usage={todayUsage} />

        {/* User Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informasi</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bergabung</Text>
            <Text style={styles.infoValue}>
              {user.createdAt?.toDate 
                ? formatDate(user.createdAt.toDate(), 'dd MMM yyyy')
                : '-'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Login Terakhir</Text>
            <Text style={styles.infoValue}>
              {user.lastLoginAt?.toDate 
                ? formatDate(user.lastLoginAt.toDate(), 'dd MMM yyyy, HH:mm')
                : '-'}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  userEmail: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    marginTop: 4,
  },
  editNameContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: COLORS.ultraLight,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  editNameActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '15',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  blockedText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.danger,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  timeActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeButton: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.ultraLight,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.md,
  },
  blockButton: {
    marginBottom: SPACING.md,
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  infoCard: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ultraLight,
  },
  infoLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    fontWeight: '500',
  },
});

export default UserDetailScreen;
