import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { StepProgress } from '@/components/StepProgress';
import { RadioGroup } from '@/components/Selectors';
import { useOnboarding } from './OnboardingContext';
import { isValidDateOfBirth, isValidPhoneOrEmail } from '@/utils/validation';
import { apiRequest } from '@/services/api';
import { ApiUser, saveSession } from '@/services/session';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbBasicInfo'>;

export const BasicInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const next = async () => {
    const fullName = data.basicInfo.fullName.trim();
    const dob = data.basicInfo.dob.trim();
    if (fullName.length === 1) return setError('Enter at least 2 characters for your name, or leave it blank.');
    if (dob && !isValidDateOfBirth(dob)) return setError('Enter a valid past date as DD / MM / YYYY, or leave it blank.');
    if (!isValidPhoneOrEmail(data.basicInfo.phoneOrEmail)) return setError('Enter a valid phone number or email address.');
    if (password.length < 8) return setError('Create a password with at least 8 characters.');
    setError(''); setLoading(true);
    const contact = data.basicInfo.phoneOrEmail.trim();
    const isEmail = contact.includes('@');
    try {
      const optionalProfile: { dateOfBirth?: string; sex?: string } = {};
      if (dob) {
        const [day, month, year] = dob.split('/').map((part) => part.trim());
        optionalProfile.dateOfBirth = `${year}-${month}-${day}`;
      }
      if (data.basicInfo.sex) optionalProfile.sex = data.basicInfo.sex;
      const result = await apiRequest<{ token: string; user: ApiUser }>('/auth/register', {
        ...(fullName ? { fullName } : {}),
        ...(isEmail ? { email: contact } : { phone: contact }),
        password,
        ...optionalProfile,
      });
      await saveSession(result.token, result.user);
      navigation.navigate('OnbChronicConditions');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account. Check your connection and try again.');
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <StepProgress step={1} total={9} label="Basic Info" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16 }}>
        Only phone/email and password are needed for an account. You can skip the personal and health details.
      </Text>
      <Input
        label="Name (optional)"
        placeholder="Enter your name, or skip"
        value={data.basicInfo.fullName}
        onChangeText={(v) => update({ basicInfo: { ...data.basicInfo, fullName: v } })}
      />
      <Input
        label="Date of Birth (optional)"
        placeholder="DD / MM / YYYY, or skip"
        value={data.basicInfo.dob}
        onChangeText={(v) => update({ basicInfo: { ...data.basicInfo, dob: v } })}
      />
      <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Sex (optional)</Text>
      <View style={{ marginBottom: 16 }}>
        <RadioGroup
          options={['Male', 'Female', 'Other']}
          value={data.basicInfo.sex || null}
          onChange={(v) => update({ basicInfo: { ...data.basicInfo, sex: v as any } })}
        />
      </View>
      <Input
        label="Phone / Email (required)"
        placeholder="Enter phone or email"
        value={data.basicInfo.phoneOrEmail}
        onChangeText={(v) => update({ basicInfo: { ...data.basicInfo, phoneOrEmail: v } })}
      />
      <Input label="Password (required)" placeholder="Create a password (8+ characters)" secure value={password} onChangeText={setPassword} />

      {error ? <Text accessibilityRole="alert" style={{ color: '#C62828', fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}
      <Button label="Create Account and Continue" onPress={next} loading={loading} style={{ marginTop: 8 }} />
    </Screen>
  );
};
