/**
 * App Navigator
 * Main navigation container with role-based routing
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';

// Import navigators
import UserTabNavigator from './UserTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/LoadingScreen';
import BlockingOverlay from '../screens/BlockingOverlay';
import UserDetailScreen from '../screens/admin/UserDetailScreen';

const Stack = createStackNavigator();

/**
 * Auth Stack Navigator
 * Screens for unauthenticated users
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

/**
 * User Stack Navigator
 * Screens for regular users
 */
const UserStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="UserTabs" component={UserTabNavigator} />
      <Stack.Screen 
        name="BlockingOverlay" 
        component={BlockingOverlay}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Admin Stack Navigator
 * Screens for admin
 */
const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.secondary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserDetail" 
        component={UserDetailScreen}
        options={({ route }) => ({
          title: route.params?.userName || 'Detail Pengguna',
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
};

/**
 * App Navigator Component
 * Handles navigation based on authentication state and user role
 */
const AppNavigator = () => {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : isAdmin ? (
        <AdminStack />
      ) : (
        <UserStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
