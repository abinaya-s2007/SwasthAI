import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { GaugeChart } from '@/components/GaugeChart';
import { useTheme } from '@/theme/ThemeContext';
import { mockRecovery } from '@/data/mockData';

export const RecoveryTrackingScreen: React.FC = () => {
  const { colors } = useTheme();

  const factors: { icon: string; label: string }[] = [
    { icon: 'water-outline', label: 'Hydration' },
    { icon: 'bed-outline', label: 'Rest' },
    { icon: 'medkit-outline', label: 'Medication Adherence' },
  ];

  return (
    <Screen>
      <Header title="Recovery Tracking" />
      <Card style={styles.center}>
        <GaugeChart value={mockRecovery.score} color={colors.primary} label={mockRecovery.level} size={140} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Recovery Score</Text>
      </Card>
      <Card>
        {factors.map((f) => (
          <View key={f.label} style={styles.row}>
            <Ionicons name={f.icon} size={18} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 10, fontSize: 13 }}>{f.label}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
});
