import React, { useState } from 'react';

import { AuthFormScreen } from '@/components/auth-form-screen';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (mode === 'register') {
    return <AuthFormScreen mode="register" onSecondaryAction={() => setMode('login')} />;
  }

  return <AuthFormScreen mode="login" onSecondaryAction={() => setMode('register')} />;
}
