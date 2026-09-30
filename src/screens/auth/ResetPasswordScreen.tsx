import React, { useState } from 'react';
import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = () => {
  const { colors } = useTheme();
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const updatePassword = () => {
    if (pass.length < 8) return setError('Use at least 8 characters for your password.');
    if (pass !== confirm) return setError('Passwords do not match.');
    setError('Password reset is unavailable until an account service is connected.');
  };

  return (
    <Screen>
      <Header title="Reset Password" />
      <Input label="New Password" placeholder="Enter new password" icon="lock-closed-outline" secure value={pass} onChangeText={setPass} />
      <Input
        label="Confirm Password"
        placeholder="Confirm new password"
        icon="lock-closed-outline"
        secure
        value={confirm}
        onChangeText={setConfirm}
      />
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}
      <Button label="Update Password" onPress={updatePassword} style={{ marginTop: 12 }} />
    </Screen>
  );
};
