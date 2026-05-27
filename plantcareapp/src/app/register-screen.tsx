import React from 'react';

import { AuthFormScreen } from '@/components/auth-form-screen';

export default function RegisterScreen({ onLoginPress = () => {} }: { onLoginPress?: () => void }) {
  return <AuthFormScreen mode="register" onSecondaryAction={onLoginPress} />;
}
