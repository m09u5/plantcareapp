import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { MainAppShell } from '@/components/main-app-shell';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';

export function AuthGate() {
  const { isReady, user } = useAuth();
  const theme = useTheme();

  if (!isReady) {
    return (
      <ThemedView style={styles.loadingScreen}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <MainAppShell />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
