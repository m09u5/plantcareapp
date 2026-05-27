import React from 'react';

import { AuthFormScreen } from '@/components/auth-form-screen';

export default function LoginScreen({ onRegisterPress = () => {} }: { onRegisterPress?: () => void }) {
  return <AuthFormScreen mode="login" onSecondaryAction={onRegisterPress} />;
}
