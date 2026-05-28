import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth';

const accentColor = '#00d47a';

export function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Settings :</Text>
      <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 112,
  },
  screenTitle: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 22,
    letterSpacing: 0,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eeeeee',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 7,
    height: 45,
    justifyContent: 'center',
    marginTop: 35,
    shadowColor: '#6f777b',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 7,
    width: 150,
  },
  logoutText: {
    color: accentColor,
    fontFamily: Fonts.mono,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
