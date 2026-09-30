import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<Array<React.ElementRef<typeof TextInput> | null>>([]);
  const [error, setError] = useState('');

  const onChange = (text: string, index: number) => {
    const next = [...digits];
    const typed = text.replace(/\D/g, '');
    if (typed.length > 1) {
      typed.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    } else {
      next[index] = typed;
    }
    setDigits(next);
    const nextIndex = Math.min(index + Math.max(typed.length, 1), 5);
    if (typed) refs.current[nextIndex]?.focus();
  };
  const verify = () => {
    if (digits.some((digit) => !/^\d$/.test(digit))) return setError('Enter all 6 digits of the verification code.');
    // There is no verification service configured in this app, so do not claim the code was verified.
    setError(`Code verification is unavailable for ${route.params.phoneOrEmail} until an OTP service is connected.`);
  };

  return (
    <Screen>
      <Header title="OTP Verification" />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 24 }}>
        Enter a 6-digit code. Code delivery is unavailable until an OTP service is connected.
      </Text>
      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => { refs.current[i] = r; }}
            value={d}
            onChangeText={(t) => onChange(t, i)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
            }}
            keyboardType="number-pad"
            maxLength={6}
            accessibilityLabel={`Verification digit ${i + 1}`}
            style={[
              styles.otpBox,
              { borderColor: d ? colors.primary : colors.border, color: colors.text, backgroundColor: colors.inputBg },
            ]}
          />
        ))}
      </View>
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}
      <Button label="Verify" onPress={verify} />
      <TouchableOpacity style={styles.resend} onPress={() => setError('Resending requires an OTP service, which is not configured yet.')}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Resend code</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  resend: { alignItems: 'center', marginTop: 18 },
});
