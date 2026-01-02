/**
 * Time Request Card Component
 * Card showing pending time request for admin
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { formatDateTime } from '../../utils/dateUtils';

const TimeRequestCard = ({
  request,
  onApprove,
  onReject,
  loading = false,
  style,
}) => {
  const [approvedMinutes, setApprovedMinutes] = useState(
    String(request.requestedMinutes)
  );
  const [note, setNote] = useState('');
  const [showActions, setShowActions] = useState(false);

  const handleApprove = () => {
    const mins = parseInt(approvedMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    onApprove(request.id, mins, note);
  };

  const handleReject = () => {
    onReject(request.id, note);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Avatar
          source={request.user?.photoURL ? { uri: request.user.photoURL } : null}
          name={request.user?.displayName}
          size="small"
        />
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{request.user?.displayName || 'Unknown'}</Text>
          <Text style={styles.timestamp}>
            {request.createdAt?.toDate
              ? formatDateTime(request.createdAt.toDate())
              : 'Baru saja'}
          </Text>
        </View>
        
        <View style={styles.requestBadge}>
          <Icon name="clock-plus" size={16} color={COLORS.warning} />
          <Text style={styles.requestAmount}>{request.requestedMinutes} menit</Text>
        </View>
      </View>
      
      {request.reason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Alasan:</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
        </View>
      )}
      
      {showActions ? (
        <View style={styles.actionsExpanded}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Menit disetujui:</Text>
            <TextInput
              style={styles.minutesInput}
              value={approvedMinutes}
              onChangeText={setApprovedMinutes}
              keyboardType="number-pad"
              placeholder="15"
            />
          </View>
          
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Catatan (opsional)..."
            multiline
          />
          
          <View style={styles.actionButtons}>
            <Button
              title="Tolak"
              variant="danger"
              size="small"
              onPress={handleReject}
              loading={loading}
              style={styles.rejectButton}
            />
            <Button
              title="Setujui"
              variant="success"
              size="small"
              onPress={handleApprove}
              loading={loading}
              style={styles.approveButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Button
            title="Proses Permintaan"
            variant="outline"
            size="small"
            onPress={() => setShowActions(true)}
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    marginTop: 2,
  },
  requestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  requestAmount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 4,
  },
  reasonContainer: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  reasonLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
    lineHeight: 20,
  },
  actions: {
    marginTop: SPACING.md,
  },
  actionsExpanded: {
    marginTop: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dark,
    marginRight: SPACING.sm,
  },
  minutesInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.ultraLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.ultraLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 2,
  },
});

export default TimeRequestCard;
