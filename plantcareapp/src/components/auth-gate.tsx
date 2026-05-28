import React, { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { useAuth } from '@/context/auth';

const accentColor = '#00d47a';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isReady, user } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={accentColor} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return children;
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
  },
});
