import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function HomeScreen() {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.panel}>
        <ThemedText type="subtitle">PlantCare</ThemedText>
        <ThemedText themeColor="textSecondary">Zalogowano jako {user?.email}</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={logout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.logoutText}>
            Wyloguj
          </ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  panel: {
    borderRadius: Spacing.three,
    gap: Spacing.three,
    maxWidth: 420,
    padding: Spacing.four,
    width: '100%',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#267750',
    borderRadius: Spacing.two,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  logoutText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.75,
  },
});
