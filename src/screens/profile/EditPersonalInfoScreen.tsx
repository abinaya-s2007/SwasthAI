import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { RadioGroup } from '@/components/Selectors';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { authenticatedGet, authenticatedPatch } from '@/services/api';
import { loadSessionUser, saveSessionUser, SessionUser } from '@/services/session';
import { isValidDateOfBirth } from '@/utils/validation';
import { useTheme } from '@/theme/ThemeContext';

type ProfileResponse = {
  id: string; full_name: string; email: string | null; phone: string | null;
  date_of_birth: string | null; sex: string | null;
};

const displayDate = (date?: string | null) => {
  if (!date) return '';
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

const apiDate = (date: string) => {
  const [day, month, year] = date.split('/').map((part) => part.trim());
  return `${year}-${month}-${day}`;
};

export const EditPersonalInfoScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const cached = await loadSessionUser();
      if (active && cached) {
        setName(cached.fullName);
        setContact(cached.phone || cached.email || '');
        setDob(displayDate(cached.dateOfBirth));
        setSex(cached.sex || '');
      }
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      try {
        const result = await authenticatedGet<ProfileResponse>('/profile', token);
        if (!active) return;
        setName(result.full_name);
        setContact(result.phone || result.email || '');
        setDob(displayDate(result.date_of_birth));
        setSex(result.sex || '');
      } catch { /* Preserve cached profile fields while offline. */ }
    };
    void load();
    return () => { active = false; };
  }, []);

  const save = async () => {
    if (name.trim().length < 2) return setError('Enter your full name.');
    if (dob && !isValidDateOfBirth(dob)) return setError('Enter a valid past date as DD / MM / YYYY.');
    setError(''); setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Please sign in again before updating your profile.');
      const dateOfBirth = dob ? apiDate(dob) : undefined;
      await authenticatedPatch('/profile', { fullName: name.trim(), dateOfBirth, sex: sex || undefined }, token);
      const previous = await loadSessionUser();
      const updated: SessionUser = {
        ...previous,
        fullName: name.trim(),
        dateOfBirth: dateOfBirth || previous?.dateOfBirth || null,
        sex: sex || previous?.sex || null,
      };
      await saveSessionUser(updated);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile. Please retry.');
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="Personal Info" />
      <Input label="Full Name" value={name} onChangeText={setName} />
      <Input label="Date of Birth" placeholder="DD / MM / YYYY" value={dob} onChangeText={setDob} />
      <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Sex</Text>
      <View style={{ marginBottom: 16 }}>
        <RadioGroup options={['Male', 'Female', 'Other']} value={sex || null} onChange={setSex} />
      </View>
      <Input label="Account Phone / Email" value={contact} editable={false} />
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}
      <Button label="Save" onPress={save} loading={loading} style={{ marginTop: 8 }} />
    </Screen>
  );
};
