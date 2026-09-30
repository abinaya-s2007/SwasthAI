import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { isValidPhone } from '@/utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = () => {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const sendCode = () => {
    if (!isValidPhone(value)) return setError('Enter a valid phone number.');
    Alert.alert('Verification unavailable', 'Password recovery cannot send a code because no OTP service is connected yet.');
  };

  return (
    <Screen>
      <Header title="Forgot Password" />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>
        Enter your registered phone number. Code delivery is unavailable until an OTP service is connected.
      </Text>
      <Input
        label="Phone Number"
        placeholder="Enter your registered phone number"
        icon="call-outline"
        keyboardType="phone-pad"
        value={value}
        onChangeText={setValue}
        error={error}
      />
      <Button
        label="Send OTP"
        onPress={sendCode}
        style={{ marginTop: 12 }}
      />
    </Screen>
  );
};
