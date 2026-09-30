import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { isValidPhoneOrEmail } from '@/utils/validation';
import { apiRequest } from '@/services/api';
import { ApiUser, saveSession } from '@/services/session';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);
  const login = async () => {
    if (!isValidPhoneOrEmail(phoneOrEmail)) return setError('Enter a valid phone number or email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setError(''); setLoading(true);
    try {
      const result = await apiRequest<{ token: string; user: ApiUser }>('/auth/login', { identifier: phoneOrEmail.trim(), password });
      await saveSession(result.token, result.user);
      navigation.replace('MainTabs');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in. Check your connection and try again.');
    } finally { setLoading(false); }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.logoRow}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="pulse" size={26} color={colors.primaryText} />
        </View>
        <Text style={[styles.brand, { color: colors.text }]}>SwasthAI</Text>
      </View>
      <Text style={[styles.welcome, { color: colors.text }]}>Welcome Back</Text>

      <Input
        label="Phone / Email"
        placeholder="Enter phone or email"
        icon="person-outline"
        value={phoneOrEmail}
        onChangeText={setPhoneOrEmail}
        autoCapitalize="none"
      />
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}
      <Input
        label="Password"
        placeholder="Enter password"
        icon="lock-closed-outline"
        secure
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotWrap}>
        <Text style={[styles.forgot, { color: colors.primary }]}>Forgot password?</Text>
      </TouchableOpacity>

      <Button
        label="Login"
        onPress={login}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      <View style={styles.registerRow}>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('OnbBasicInfo')}>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Register</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('CaregiverLogin')} style={styles.caregiverLink}>
        <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
          Continue as Caregiver →
        </Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  logoRow: { alignItems: 'center', marginTop: 40, marginBottom: 12 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brand: { fontSize: 22, fontWeight: '800' },
  welcome: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20 },
  forgot: { fontSize: 13, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  caregiverLink: { alignItems: 'center', marginTop: 28 },
});
