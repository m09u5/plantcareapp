import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFrame } from '@/components/app-frame';
import { AuthGate } from '@/components/auth-gate';
import { AuthProvider } from '@/context/auth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <AuthGate>
          <AppFrame>
            <Slot />
          </AppFrame>
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
