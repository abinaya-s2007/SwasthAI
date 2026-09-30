import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { ListRow, SectionTitle } from '@/components/Misc';
import { caregiverMockPatient } from '@/data/mockData';
import { useAppNavigation } from '@/navigation/useAppNavigation';

const LINK_KEY = 'caregiverDemoPatientLinked';

export const CaregiverSettingsScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const [linked, setLinked] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    void AsyncStorage.getItem(LINK_KEY).then((value) => {
      if (active) setLinked(value !== 'false');
    });
    return () => { active = false; };
  }, []));

  const changeLink = () => {
    if (!linked) {
      void AsyncStorage.setItem(LINK_KEY, 'true').then(() => setLinked(true));
      return;
    }
    Alert.alert('Unlink demo patient?', 'This only removes the sample patient from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: () => {
        void AsyncStorage.setItem(LINK_KEY, 'false').then(() => setLinked(false));
      } },
    ]);
  };

  return (
    <Screen>
      <Header title="Caregiver Settings" />
      <SectionTitle title="Linked Patient" />
      <Card noPadding>
        <ListRow icon="person-outline" label={`${caregiverMockPatient.name} · demo`} value={linked ? 'Linked' : 'Not linked'} />
        <ListRow icon={linked ? 'unlink-outline' : 'link-outline'} label={linked ? 'Unlink demo patient' : 'Link demo patient'} onPress={changeLink} danger={linked} />
      </Card>
      <SectionTitle title="Preferences" />
      <Card noPadding>
        <ListRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('NotificationSettings')} />
        <ListRow icon="shield-checkmark-outline" label="Privacy" onPress={() => navigation.navigate('PrivacySettings')} />
        <ListRow icon="log-out-outline" label="Logout" onPress={() => navigation.navigate('LogoutConfirm')} danger />
      </Card>
    </Screen>
  );
};
