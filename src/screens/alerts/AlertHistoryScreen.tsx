import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useTheme } from '@/theme/ThemeContext';
import { mockAlerts } from '@/data/mockData';
import { useAppDataMode } from '@/state/AppDataModeContext';
import { buildLiveAlerts } from '@/services/liveAlerts';

export const AlertHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const { mode, samples, watchEvents } = useAppDataMode();
  const alerts = mode === 'bluetooth' ? buildLiveAlerts(samples, watchEvents) : mockAlerts;

  const counts = {
    High: alerts.filter((a) => a.severity === 'High').length,
    Medium: alerts.filter((a) => a.severity === 'Medium').length,
    Low: alerts.filter((a) => a.severity === 'Low').length,
  };

  return (
    <Screen>
      <Header title="Alert History" subtitle={mode === 'bluetooth' ? 'Watch alert events' : '01 Sep – 30 Sep'} />
      <Input placeholder="Search alerts" icon="search-outline" />

      <View style={styles.countRow}>
        <CountCard label="High" value={counts.High} color={colors.danger} />
        <CountCard label="Medium" value={counts.Medium} color={colors.warning} />
        <CountCard label="Low" value={counts.Low} color={colors.success} />
      </View>

      {alerts.map((a) => (
        <TouchableOpacity key={a.id} onPress={() => navigation.navigate('AlertDetail', { alertId: a.id })}>
          <Card>
            <View style={styles.row}>
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>{a.title}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{a.timestamp}</Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      {alerts.length === 0 && <Card><Text style={{ color: colors.textMuted, fontSize: 12 }}>No watch alerts recorded yet.</Text></Card>}
    </Screen>
  );
};

const CountCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const { colors } = useTheme();
  return (
    <Card style={styles.countCard}>
      <Text style={{ color, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  countRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  countCard: { flex: 1, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
