import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { ListRow, SectionTitle } from '@/components/Misc';
import { useTheme } from '@/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedGet } from '@/services/api';
import { loadSessionUser, saveSessionUser, SessionUser } from '@/services/session';

type ProfileResponse = {
  id: string; full_name: string; email: string | null; phone: string | null;
  date_of_birth: string | null; sex: string | null;
};

export const ProfileHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [profile, setProfile] = useState<SessionUser | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    const load = async () => {
      const cached = await loadSessionUser();
      if (active && cached) setProfile(cached);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      try {
        const result = await authenticatedGet<ProfileResponse>('/profile', token);
        const latest: SessionUser = {
          id: result.id,
          fullName: result.full_name,
          email: result.email,
          phone: result.phone,
          dateOfBirth: result.date_of_birth,
          sex: result.sex,
        };
        await saveSessionUser(latest);
        if (active) setProfile(latest);
      } catch { /* Keep the locally saved profile visible when offline. */ }
    };
    void load();
    return () => { active = false; };
  }, []));

  const displayName = profile?.fullName || 'Your profile';
  const displayContact = profile?.phone || profile?.email || '';

  return (
    <Screen edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors.primaryText, fontWeight: '800', fontSize: 22 }}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 10 }}>{displayName}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{displayContact}</Text>
      </Card>

      <SectionTitle title="Account" />
      <Card noPadding>
        <ListRow icon="person-outline" label="Personal Information" onPress={() => navigation.navigate('EditPersonalInfo')} />
        <ListRow icon="medical-outline" label="Medical Info" onPress={() => navigation.navigate('EditPersonalInfo')} />
        <ListRow icon="people-outline" label="Emergency Contacts" onPress={() => navigation.navigate('ManageContacts')} />
      </Card>

      <SectionTitle title="Device & Privacy" />
      <Card noPadding>
        <ListRow icon="watch-outline" label="Device Management" onPress={() => navigation.navigate('DeviceManagement')} />
        <ListRow icon="shield-checkmark-outline" label="Privacy & Consent" onPress={() => navigation.navigate('PrivacySettings')} />
        <ListRow icon="notifications-outline" label="Notification Settings" onPress={() => navigation.navigate('NotificationSettings')} />
      </Card>

      <SectionTitle title="More" />
      <Card noPadding>
        <ListRow icon="accessibility-outline" label="Accessibility" onPress={() => navigation.navigate('Accessibility')} />
        <ListRow icon="help-circle-outline" label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
        <ListRow icon="mic-outline" label="Voice Assistant" onPress={() => navigation.navigate('VoiceAssistant')} />
        <ListRow icon="log-out-outline" label="Logout" onPress={() => navigation.navigate('LogoutConfirm')} danger />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  profileCard: { alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
