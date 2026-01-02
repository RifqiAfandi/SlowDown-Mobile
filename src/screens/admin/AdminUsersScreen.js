/**
 * Admin Users Screen
 * List of all users with search functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Header, Input, EmptyState } from '../../components/common';
import { UserListItem } from '../../components/admin';
import { Logger } from '../../utils/logger';

const logger = Logger.create('AdminUsers');

const AdminUsersScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to users
  useEffect(() => {
    const unsubscribe = userService.subscribeToAllUsers((usersList) => {
      setUsers(usersList);
      setFilteredUsers(usersList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter(
        user =>
          user.displayName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Data refreshes automatically via subscription
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleUserPress = (user) => {
    navigation.navigate('UserDetail', {
      userId: user.id,
      userName: user.displayName,
    });
  };

  const renderItem = ({ item }) => (
    <UserListItem
      user={item}
      onPress={() => handleUserPress(item)}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="account-search"
      title={searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Pengguna'}
      message={
        searchQuery
          ? `Tidak ada pengguna dengan nama "${searchQuery}"`
          : 'Pengguna baru akan muncul di sini setelah mendaftar'
      }
    />
  );

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <Input
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Cari nama atau email..."
        leftIcon="magnify"
        rightIcon={searchQuery ? 'close' : undefined}
        onRightIconPress={() => setSearchQuery('')}
        style={styles.searchInput}
      />
      <Text style={styles.resultCount}>
        {filteredUsers.length} pengguna
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Pengguna" subtitle="Kelola semua pengguna" />

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
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
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchInput: {
    marginBottom: SPACING.xs,
  },
  resultCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
});

export default AdminUsersScreen;
