import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { RiskBadge } from '@/components/Misc';
import { useTheme } from '@/theme/ThemeContext';
import { caregiverMockPatient, mockVitals } from '@/data/mockData';
import { loadSessionUser } from '@/services/session';

export const CaregiverDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [caregiverName, setCaregiverName] = useState('');
  const [patientLinked, setPatientLinked] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.all([
      loadSessionUser(),
      AsyncStorage.getItem('caregiverDemoPatientLinked'),
    ]).then(([user, linked]) => {
      if (!active) return;
      setCaregiverName(user?.fullName || '');
      setPatientLinked(linked !== 'false');
    });
    return () => { active = false; };
  }, []));

  return (
    <Screen edges={['top']}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          {caregiverName ? `Hi, ${caregiverName}` : 'Caregiver Dashboard'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CaregiverSettings')}>
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {patientLinked ? <TouchableOpacity onPress={() => navigation.navigate('CaregiverSOSDetail')}>
        <Card>
          <View style={styles.patientRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.primaryText, fontWeight: '800', fontSize: 18 }}>
                {caregiverMockPatient.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{caregiverMockPatient.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>Demo patient</Text>
              <RiskBadge level="high" label={caregiverMockPatient.riskLevel} />
            </View>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 10 }}>
            Last update: {caregiverMockPatient.lastUpdate}
          </Text>
        </Card>
      </TouchableOpacity> : (
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700' }}>No patient linked</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Link the demo patient from Caregiver Settings to preview this dashboard.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CaregiverSettings')} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Open settings</Text>
          </TouchableOpacity>
        </Card>
      )}

      {patientLinked ? <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 10 }}>Sample Vitals · Demo data</Text>
        <View style={styles.vitalsRow}>
          <VitalMini icon="heart" value={`${mockVitals.heartRate}`} unit="bpm" color={colors.danger} />
          <VitalMini icon="water" value={`${mockVitals.spo2}%`} unit="SpO2" color={colors.info} />
          <VitalMini icon="thermometer" value={`${mockVitals.skinTemp}°`} unit="Temp" color={colors.warning} />
        </View>
      </Card> : null}

      {patientLinked ? <TouchableOpacity onPress={() => navigation.navigate('CaregiverSOSDetail')}>
        <Card>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '600' }}>Location preview</Text>
            <View style={{ flex: 1 }} />
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>I'm on my way</Text>
          </View>
        </Card>
      </TouchableOpacity> : null}
    </Screen>
  );
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const VitalMini: React.FC<{ icon: IoniconName; value: string; unit: string; color: string }> = ({
  icon,
  value,
  unit,
  color,
}) => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4 }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 10 }}>{unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800' },
  patientRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  vitalsRow: { flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
