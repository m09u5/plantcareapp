import React, { useState } from 'react';

import LoginScreen from '@/app/login-screen';
import RegisterScreen from '@/app/register-screen';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (mode === 'register') {
    return <RegisterScreen onLoginPress={() => setMode('login')} />;
  }

  return <LoginScreen onRegisterPress={() => setMode('register')} />;
}
