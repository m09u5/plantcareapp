import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '@/app/home-screen';
import ScanScreen from '@/app/scan-screen';
import SettingsScreen from '@/app/settings-screen';

type ScreenName = 'plants' | 'scan' | 'settings';

const accentColor = '#00d47a';

export function MainAppShell() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('plants');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.appRoot}>
      {activeScreen === 'plants' ? <HomeScreen /> : null}
      {activeScreen === 'scan' ? <ScanScreen /> : null}
      {activeScreen === 'settings' ? <SettingsScreen /> : null}
      <BottomNav activeScreen={activeScreen} bottomInset={insets.bottom} onChange={setActiveScreen} />
    </View>
  );
}

function BottomNav({
  activeScreen,
  bottomInset,
  onChange,
}: {
  activeScreen: ScreenName;
  bottomInset: number;
  onChange: (screen: ScreenName) => void;
}) {
  const items: { icon: keyof typeof Feather.glyphMap; label: string; screen: ScreenName }[] = [
    { icon: 'home', label: 'Plants', screen: 'plants' },
    { icon: 'maximize', label: 'Scan', screen: 'scan' },
    { icon: 'settings', label: 'Settings', screen: 'settings' },
  ];

  return (
    <View style={[styles.navContainer, { bottom: Math.max(22, bottomInset + 16) }]}>
      {items.map((item) => {
        const isActive = item.screen === activeScreen;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="button"
            key={item.screen}
            onPress={() => onChange(item.screen)}
            style={({ pressed }) => [styles.navButton, isActive && styles.navButtonActive, pressed && styles.pressed]}>
            <Feather color={isActive ? accentColor : '#646464'} name={item.icon} size={24} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  navContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e6e6e6',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    height: 43,
    justifyContent: 'center',
    paddingHorizontal: 14,
    position: 'absolute',
    shadowColor: '#626a70',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 9,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: 15,
    height: 31,
    justifyContent: 'center',
    width: 36,
  },
  navButtonActive: {
    backgroundColor: '#f6fffa',
  },
  pressed: {
    opacity: 0.72,
  },
});
