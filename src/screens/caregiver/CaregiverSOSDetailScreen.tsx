import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { RiskBadge } from '@/components/Misc';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { caregiverMockPatient } from '@/data/mockData';
import { useAppNavigation } from '@/navigation/useAppNavigation';

export const CaregiverSOSDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [acknowledged, setAcknowledged] = useState(false);

  const unlink = () => Alert.alert('Unlink demo patient?', 'This only removes the sample patient from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Unlink', style: 'destructive', onPress: () => {
      void AsyncStorage.setItem('caregiverDemoPatientLinked', 'false').then(() => navigation.replace('CaregiverDashboard'));
    } },
  ]);

  return (
    <Screen>
      <Header title="Caregiver SOS" />
      <Card style={styles.center}>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{caregiverMockPatient.name}</Text>
        <View style={{ marginTop: 6 }}>
          <RiskBadge level="high" label={caregiverMockPatient.riskLevel} />
        </View>
      </Card>

      <View style={[styles.map, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Ionicons name="location" size={32} color={colors.danger} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Demo screen — live SOS updates and GPS location are not connected.
        </Text>
      </View>

      <Button label={acknowledged ? 'Acknowledged' : 'Acknowledge demo alert'} onPress={() => setAcknowledged(true)} disabled={acknowledged} />
      <Button label="Unlink demo patient" variant="outline" onPress={unlink} style={{ marginTop: 10 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  map: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
