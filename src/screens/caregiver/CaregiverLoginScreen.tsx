import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { isValidPhoneOrEmail } from '@/utils/validation';
import { apiRequest } from '@/services/api';
import { ApiUser, saveSession } from '@/services/session';

export const CaregiverLoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (registering && name.trim().length === 1) return setError('Enter at least 2 characters for your name, or leave it blank.');
    if (!isValidPhoneOrEmail(identifier)) return setError('Enter a valid phone number or email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setError(''); setLoading(true);
    try {
      const result = await apiRequest<{ token: string; user: ApiUser }>(
        registering ? '/auth/register' : '/auth/login',
        registering
          ? { ...(name.trim() ? { fullName: name.trim() } : {}), ...(identifier.includes('@') ? { email: identifier.trim() } : { phone: identifier.trim() }), password }
          : { identifier: identifier.trim(), password },
      );
      await saveSession(result.token, result.user, 'caregiver');
      navigation.replace('CaregiverDashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not connect to the account service. Check your connection and retry.');
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <View style={styles.logoRow}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
          <Ionicons name="people" size={26} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{registering ? 'Create Caregiver Account' : 'Login as Caregiver'}</Text>
      </View>
      {registering ? <>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 14 }}>Name is optional. Phone/email and password are required.</Text>
        <Input label="Name (optional)" placeholder="Enter your name, or skip" value={name} onChangeText={setName} />
      </> : null}
      <Input label="Phone / Email" icon="person-outline" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" icon="lock-closed-outline" secure value={password} onChangeText={setPassword} />
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}
      <Button label={registering ? 'Create Account' : 'Login'} onPress={submit} loading={loading} style={{ marginTop: 8 }} />
      <TouchableOpacity style={styles.createRow} onPress={() => { setRegistering((v) => !v); setError(''); }}>
        <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>
          {registering ? 'Already have an account? Login' : 'Create Caregiver Account'}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  logoRow: { alignItems: 'center', marginTop: 40, marginBottom: 28 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700' },
  createRow: { alignItems: 'center', marginTop: 20 },
});
