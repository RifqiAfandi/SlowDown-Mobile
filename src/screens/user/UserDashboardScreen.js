/**
 * User Dashboard Screen
 * Main screen showing remaining time and quick stats
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTracking } from '../../contexts/TimeTrackingContext';
import { timeRequestService } from '../../services/timeRequestService';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Card, Button, Avatar, Header } from '../../components/common';
import { TimeDisplay, TimeRequestModal } from '../../components/time';
import { AppUsageList } from '../../components/charts';
import { PermissionIllustration } from '../../components/illustrations';
import { formatMinutesToReadable } from '../../utils/dateUtils';
import { Logger } from '../../utils/logger';

const logger = Logger.create('UserDashboard');

const UserDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();
  const {
    remainingMinutes,
    usedMinutes,
    bonusMinutes,
    totalAllowedMinutes,
    isTimeUp,
    isBlocked,
    todayUsage,
    hasPermission,
    checkPermission,
    requestPermission,
    refreshUsage,
    syncUsageFromDevice,
  } = useTimeTracking();

  const [refreshing, setRefreshing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Check permission on mount and show modal if not granted
  useEffect(() => {
    const checkAndShowPermissionModal = async () => {
      const hasAccess = await checkPermission();
      // Only show modal if permission not granted
      if (!hasAccess) {
        setShowPermissionModal(true);
      }
    };
    checkAndShowPermissionModal();
  }, [checkPermission]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkPermission();
    await refreshUsage();
    setRefreshing(false);
  }, [refreshUsage, checkPermission]);

  const handleRequestTime = async (minutes, reason) => {
    try {
      setSubmittingRequest(true);
      await timeRequestService.createTimeRequest(userData.uid, minutes, reason);
      setShowRequestModal(false);
      Alert.alert(
        'Berhasil',
        'Permintaan waktu tambahan telah dikirim. Tunggu persetujuan dari admin.'
      );
      logger.info('Time request submitted', { minutes, reason });
    } catch (error) {
      logger.error('Failed to submit time request', error);
      let message = 'Gagal mengirim permintaan. Silakan coba lagi.';
      if (error.message === 'User already has a pending request') {
        message = 'Anda sudah memiliki permintaan yang menunggu persetujuan.';
      }
      Alert.alert('Gagal', message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const canRequestTime = isTimeUp && !userData?.pendingTimeRequest && !isBlocked;

  // Handle permission request from modal
  const handleGrantPermission = async () => {
    setShowPermissionModal(false);
    await requestPermission();
    // Check again after user returns from settings
    setTimeout(async () => {
      const hasAccess = await checkPermission();
      if (!hasAccess) {
        // User didn't grant permission, show modal again
        setShowPermissionModal(true);
      }
    }, 1000);
  };

  // Permission Modal Popup
  const PermissionModal = () => (
    <Modal
      visible={showPermissionModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPermissionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.permissionModal}>
          <PermissionIllustration size={140} color={COLORS.primary} />
          
          <Text style={styles.permissionModalTitle}>Izin Diperlukan</Text>
          
          <Text style={styles.permissionModalDescription}>
            Untuk melacak penggunaan media sosial secara akurat, aplikasi memerlukan izin "Usage Access".
          </Text>
          
          <View style={styles.permissionModalStepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Ketuk "Beri Izin" di bawah</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Cari "SlowDown" dalam daftar</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Aktifkan izin akses penggunaan</Text>
            </View>
          </View>
          
          <View style={styles.permissionModalButtons}>
            <Button
              title="Nanti Saja"
              onPress={() => setShowPermissionModal(false)}
              variant="outline"
              style={styles.permissionModalButton}
            />
            <Button
              title="Beri Izin"
              onPress={handleGrantPermission}
              variant="primary"
              style={styles.permissionModalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="SlowDown"
        subtitle={`Halo, ${userData?.displayName || 'User'}!`}
        variant="primary"
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
        {/* Time Display Card */}
        <Card style={styles.timeCard} variant="elevated">
          <TimeDisplay
            remainingMinutes={remainingMinutes}
            totalMinutes={totalAllowedMinutes}
            size={180}
          />

          <View style={styles.timeInfo}>
            <View style={styles.timeInfoItem}>
              <Text style={styles.timeInfoLabel}>Terpakai</Text>
              <Text style={styles.timeInfoValue}>
                {formatMinutesToReadable(usedMinutes)}
              </Text>
            </View>
            <View style={styles.timeInfoDivider} />
            <View style={styles.timeInfoItem}>
              <Text style={styles.timeInfoLabel}>Bonus</Text>
              <Text style={[styles.timeInfoValue, { color: COLORS.success }]}>
                +{formatMinutesToReadable(bonusMinutes)}
              </Text>
            </View>
          </View>

          {isBlocked && (
            <View style={styles.blockedBanner}>
              <Icon name="block-helper" size={20} color={COLORS.danger} />
              <Text style={styles.blockedText}>Akses diblokir oleh admin</Text>
            </View>
          )}

          {userData?.pendingTimeRequest && (
            <View style={styles.pendingBanner}>
              <Icon name="clock-alert" size={20} color={COLORS.warning} />
              <Text style={styles.pendingText}>
                Permintaan waktu sedang diproses
              </Text>
            </View>
          )}
        </Card>

        {/* Request Time Button */}
        {canRequestTime && (
          <Button
            title="Minta Waktu Tambahan"
            onPress={() => setShowRequestModal(true)}
            variant="secondary"
            size="large"
            fullWidth
            icon={<Icon name="clock-plus" size={20} color={COLORS.white} />}
            style={styles.requestButton}
          />
        )}

        {/* Today's Usage */}
        <AppUsageList usage={todayUsage} style={styles.usageList} />

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Icon name="lightbulb-outline" size={24} color={COLORS.warning} />
            <Text style={styles.tipsTitle}>Tips</Text>
          </View>
          <Text style={styles.tipsText}>
            Batasi penggunaan media sosial untuk meningkatkan fokus dan
            produktivitas. Gunakan waktu dengan bijak! 🌟
          </Text>
        </Card>
      </ScrollView>

      {/* Permission Modal */}
      <PermissionModal />

      <TimeRequestModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestTime}
        loading={submittingRequest}
      />
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
  timeCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.ultraLight,
    width: '100%',
    justifyContent: 'center',
  },
  timeInfoItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  timeInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.ultraLight,
  },
  timeInfoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  timeInfoValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
    width: '100%',
    justifyContent: 'center',
  },
  blockedText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.danger,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
    width: '100%',
    justifyContent: 'center',
  },
  pendingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  requestButton: {
    marginBottom: SPACING.md,
  },
  usageList: {
    marginBottom: SPACING.md,
  },
  tipsCard: {
    padding: SPACING.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: SPACING.sm,
  },
  tipsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 20,
  },
  // Permission Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  permissionModal: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionModalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permissionModalDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  permissionModalStepsContainer: {
    backgroundColor: COLORS.ultraLight,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
  },
  permissionModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: SPACING.sm,
  },
  permissionModalButton: {
    flex: 1,
  },
});

export default UserDashboardScreen;
