import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavItem = {
  href: '/' | '/scan' | '/settings';
  icon: keyof typeof Feather.glyphMap;
};

const accentColor = '#00d47a';

const navItems: NavItem[] = [
  { href: '/', icon: 'home' },
  { href: '/scan', icon: 'maximize' },
  { href: '/settings', icon: 'settings' },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {children}
      <View style={[styles.navContainer, { bottom: Math.max(22, insets.bottom + 16) }]}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Pressable
              accessibilityRole="button"
              key={item.href}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [
                styles.navButton,
                isActive && styles.navButtonActive,
                pressed && styles.pressed,
              ]}>
              <Feather color={isActive ? accentColor : '#646464'} name={item.icon} size={24} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  navContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e6e6e6',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 9,
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
