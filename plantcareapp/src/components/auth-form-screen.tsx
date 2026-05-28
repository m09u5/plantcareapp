import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { ApiError } from '@/lib/api';

const accentColor = '#00d47a';

export function AuthFormScreen({
  mode,
  onSecondaryAction,
}: {
  mode: 'login' | 'register';
  onSecondaryAction: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const insets = useSafeAreaInsets();
  const isLogin = mode === 'login';

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError('Podaj email i haslo.');
      return;
    }

    if (!isLogin && password.length < 8) {
      setError('Haslo musi miec minimum 8 znakow.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        const registration = await register(email.trim(), password);
        setPassword('');
        setSuccess(registration.message || 'Konto zostalo utworzone. Sprawdz email i aktywuj konto przed logowaniem.');
      }
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.code === 'EMAIL_NOT_VERIFIED') {
        setError('Aktywuj konto linkiem z emaila przed logowaniem.');
      } else {
        setError(submitError instanceof Error ? submitError.message : 'Cos poszlo nie tak.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode() {
    setError(null);
    setSuccess(null);
    onSecondaryAction();
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View
          style={[
            styles.frame,
            {
              paddingTop: Math.max(insets.top, 42),
              paddingBottom: Math.max(insets.bottom, 28),
            },
          ]}>
          
          <View style={styles.hero}>
  <Text style={styles.title}>{'Plant\nCare\nApp'}</Text>
  <Image 
    source={require('@/assets/images/Plant3.png')}
    style={{ width: 124, height: 124, marginTop: 10 }}
    resizeMode="contain"
  />
</View>

          <View style={styles.form}>
            <View style={styles.tabs}>
              <Pressable accessibilityRole="button" onPress={isLogin ? undefined : switchMode} style={styles.tabButton}>
                <Text style={[styles.tabText, isLogin ? styles.tabActive : styles.tabInactive]}>Login</Text>
              </Pressable>
              <View style={styles.tabDivider} />
              <Pressable accessibilityRole="button" onPress={isLogin ? switchMode : undefined} style={styles.tabButton}>
                <Text style={[styles.tabText, !isLogin ? styles.tabActive : styles.tabInactive]}>Register</Text>
              </Pressable>
            </View>

            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder={isLogin ? 'Login . . .' : 'Email . . .'}
              placeholderTextColor="#111111"
              style={styles.input}
              value={email}
            />

            <TextInput
              autoCapitalize="none"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              onChangeText={setPassword}
              placeholder="Password . . ."
              placeholderTextColor="#111111"
              secureTextEntry
              style={styles.input}
              value={password}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}
          </View>

          <View style={styles.actionArea}>
            {isLogin ? (
              <Pressable
                accessibilityLabel="Login"
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.loginButton,
                  isSubmitting && styles.disabled,
                  pressed && !isSubmitting && styles.pressed,
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color={accentColor} />
                ) : (
                  <Text style={styles.arrowText}>{'>'}</Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.registerButton,
                  isSubmitting && styles.disabled,
                  pressed && !isSubmitting && styles.pressed,
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color={accentColor} />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </Pressable>
            )}
          </View>

          <Pressable accessibilityRole="button" style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const sharedShadow = {
  shadowColor: '#6f777b',
  shadowOffset: { width: 4, height: 6 },
  shadowOpacity: 0.38,
  shadowRadius: 7,
  elevation: 8,
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  frame: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    maxWidth: 393,
    paddingHorizontal: 32,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 66,
    paddingHorizontal: 11,
  },
  title: {
    color: '#000000',
    fontFamily: Fonts.mono,
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 46,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  form: {
    marginTop: 58,
  },
  tabs: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 24,
    marginBottom: 7,
    paddingLeft: 20,
  },
  tabButton: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  tabText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  tabActive: {
    color: '#000000',
  },
  tabInactive: {
    color: '#a7a7a7',
  },
  tabDivider: {
    backgroundColor: '#8b8b8b',
    height: 22,
    marginHorizontal: 12,
    width: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#a6a6a6',
    borderRadius: 12,
    borderWidth: 1.6,
    color: '#111111',
    fontFamily: Fonts.mono,
    fontSize: 14,
    height: 32,
    marginBottom: 19,
    paddingHorizontal: 19,
    paddingVertical: 0,
  },
  errorText: {
    color: '#9f2f1f',
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -7,
    textAlign: 'center',
  },
  successText: {
    color: '#087a4d',
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -7,
    textAlign: 'center',
  },
  actionArea: {
    alignItems: 'center',
    height: 94,
    justifyContent: 'center',
    marginTop: 42,
  },
  loginButton: {
    ...sharedShadow,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eeeeee',
    borderRadius: 30,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  arrowText: {
    color: accentColor,
    fontFamily: Fonts.mono,
    fontSize: 36,
    fontWeight: '400',
    lineHeight: 42,
    marginTop: -3,
  },
  registerButton: {
    ...sharedShadow,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eeeeee',
    borderRadius: 22,
    borderWidth: 1,
    height: 51,
    justifyContent: 'center',
    minWidth: 184,
    paddingHorizontal: 21,
  },
  registerButtonText: {
    color: accentColor,
    fontFamily: Fonts.mono,
    fontSize: 16,
    letterSpacing: 0,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 13,
    padding: 10,
  },
  forgotText: {
    color: '#777777',
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 0,
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.72,
  },
});
