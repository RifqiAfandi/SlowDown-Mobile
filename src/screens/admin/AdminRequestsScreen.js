/**
 * Admin Requests Screen
 * Manage time extension requests from users
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { timeRequestService } from '../../services/timeRequestService';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Header, EmptyState } from '../../components/common';
import { TimeRequestCard } from '../../components/admin';
import { Logger } from '../../utils/logger';

const logger = Logger.create('AdminRequests');

const AdminRequestsScreen = () => {
  const insets = useSafeAreaInsets();
  const { userData: adminData } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Subscribe to pending requests
  useEffect(() => {
    const unsubscribe = timeRequestService.subscribeToPendingRequests((requestsList) => {
      setRequests(requestsList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Data refreshes automatically via subscription
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleApprove = async (requestId, approvedMinutes, note) => {
    try {
      setProcessingId(requestId);
      await timeRequestService.approveTimeRequest(
        requestId,
        adminData.uid,
        approvedMinutes,
        note
      );
      Alert.alert('Berhasil', `Permintaan disetujui. ${approvedMinutes} menit ditambahkan.`);
      logger.info('Request approved', { requestId, approvedMinutes });
    } catch (error) {
      logger.error('Failed to approve request', error);
      Alert.alert('Gagal', 'Gagal menyetujui permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId, note) => {
    try {
      setProcessingId(requestId);
      await timeRequestService.rejectTimeRequest(requestId, adminData.uid, note);
      Alert.alert('Berhasil', 'Permintaan ditolak');
      logger.info('Request rejected', { requestId });
    } catch (error) {
      logger.error('Failed to reject request', error);
      Alert.alert('Gagal', 'Gagal menolak permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <TimeRequestCard
      request={item}
      onApprove={handleApprove}
      onReject={handleReject}
      loading={processingId === item.id}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="clock-check-outline"
      title="Tidak Ada Permintaan"
      message="Semua permintaan waktu tambahan sudah diproses"
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Permintaan Waktu"
        subtitle={`${requests.length} permintaan menunggu`}
      />

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading && renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
});

export default AdminRequestsScreen;
