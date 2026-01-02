/**
 * SlowDown Mobile Application
 * Main entry point with all providers
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import { TimeTrackingProvider } from './src/contexts/TimeTrackingContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
]);

/**
 * Main App Component
 * Wraps the application with necessary providers
 */
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
          translucent={false}
        />
        <AuthProvider>
          <TimeTrackingProvider>
            <AppNavigator />
          </TimeTrackingProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
