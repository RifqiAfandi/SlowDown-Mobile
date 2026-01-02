/**
 * Time Request Modal Component
 * Modal for requesting additional time
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import Button from '../common/Button';
import Input from '../common/Input';

const TimeRequestModal = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [minutes, setMinutes] = useState('15');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const mins = parseInt(minutes, 10);
    
    if (isNaN(mins) || mins <= 0) {
      setError('Masukkan jumlah menit yang valid');
      return;
    }
    
    if (mins > 60) {
      setError('Maksimal permintaan 60 menit');
      return;
    }
    
    setError('');
    onSubmit(mins, reason.trim());
  };

  const handleClose = () => {
    setMinutes('15');
    setReason('');
    setError('');
    onClose();
  };

  const quickOptions = [5, 10, 15, 30];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Minta Waktu Tambahan</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>
            Ajukan permintaan waktu tambahan ke admin. Permintaan akan diproses dalam waktu 24 jam.
          </Text>
          
          <Text style={styles.label}>Pilih durasi:</Text>
          <View style={styles.quickOptions}>
            {quickOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.quickOption,
                  minutes === String(opt) && styles.quickOptionActive,
                ]}
                onPress={() => {
                  setMinutes(String(opt));
                  setError('');
                }}
              >
                <Text
                  style={[
                    styles.quickOptionText,
                    minutes === String(opt) && styles.quickOptionTextActive,
                  ]}
                >
                  {opt} menit
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Input
            label="Atau masukkan sendiri (menit)"
            value={minutes}
            onChangeText={(val) => {
              setMinutes(val.replace(/[^0-9]/g, ''));
              setError('');
            }}
            keyboardType="number-pad"
            placeholder="Contoh: 15"
            error={!!error}
            errorMessage={error}
          />
          
          <Input
            label="Alasan (opsional)"
            value={reason}
            onChangeText={setReason}
            placeholder="Jelaskan alasan permintaan..."
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.actions}>
            <Button
              title="Batal"
              variant="ghost"
              onPress={handleClose}
              style={styles.cancelButton}
            />
            <Button
              title="Kirim Permintaan"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  quickOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.ultraLight,
    backgroundColor: COLORS.background,
  },
  quickOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickOptionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  quickOptionTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default TimeRequestModal;
