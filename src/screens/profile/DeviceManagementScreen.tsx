import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme/ThemeContext';
import { useAppDataMode, type AppDataMode } from '@/state/AppDataModeContext';

const MODES: Array<{ id: AppDataMode; title: string; description: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { id: 'offline', title: 'Offline', description: 'Use fixed, clearly labeled demo readings. No network or wearable needed.', icon: 'cloud-offline-outline' },
  { id: 'simulation', title: 'Simulation', description: 'Generate changing sample readings for demonstrations.', icon: 'pulse-outline' },
  { id: 'bluetooth', title: 'Bluetooth', description: 'Connect to SwasthAI-Watch and use only readings received from the band.', icon: 'bluetooth-outline' },
];

export const DeviceManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const { mode, setMode, scenario, setScenario, bluetoothConnected, bluetoothState, bluetoothDetail, latest, watchStatus, watchEvents, retryBluetooth } = useAppDataMode();

  return (
    <Screen>
      <Header title="Device Management" />
      <Card>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>Data mode</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 10 }}>
          Choose where health readings shown in the app come from.
        </Text>
        {MODES.map((item) => {
          const selected = mode === item.id;
          return (
            <View key={item.id}>
              <Pressable onPress={() => setMode(item.id)} accessibilityRole="radio" accessibilityState={{ selected }}
                style={[styles.modeRow, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary + '12' : colors.surface }]}>
                <Ionicons name={item.icon} size={20} color={selected ? colors.primary : colors.textMuted} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{item.title}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 }}>{item.description}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={19} color={colors.primary} />}
              </Pressable>
              {item.id === 'simulation' && mode === 'simulation' && (
                <View style={styles.scenarioArea}>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 7 }}>Simulation scenario</Text>
                  <View style={styles.scenarioButtons}>
                    <ScenarioButton title="Heat stress" icon="sunny-outline" selected={scenario === 'heatStress'} onPress={() => setScenario(scenario === 'heatStress' ? 'normal' : 'heatStress')} />
                    <ScenarioButton title="Fall detection" icon="warning-outline" selected={scenario === 'fall'} onPress={() => setScenario(scenario === 'fall' ? 'normal' : 'fall')} />
                  </View>
                  {scenario !== 'normal' && (
                    <Text style={{ color: colors.warning, fontSize: 10, lineHeight: 15, marginTop: 7 }}>
                      {scenario === 'heatStress'
                        ? 'Simulated elevated heart rate, skin/ambient temperature, and humidity are now shown.'
                        : 'Simulated impact, movement, and heart-rate readings are now shown. This is not a real fall alert.'}
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
        {mode === 'bluetooth' && (
          <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={{ color: bluetoothConnected ? colors.success : colors.warning, fontWeight: '700', fontSize: 12 }}>
              {bluetoothConnected ? 'Connected · live watch readings' : bluetoothState === 'error' ? 'Could not connect' : bluetoothState === 'off' ? 'Bluetooth is off' : bluetoothState === 'permission' ? 'Checking permission' : bluetoothState === 'connecting' ? 'Connecting to watch' : 'Searching for SwasthAI-Watch'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 4 }}>
              {bluetoothDetail} Offline and Simulation remain available. Bluetooth mode never fills missing readings with demo data.
            </Text>
            {!bluetoothConnected && <Pressable onPress={retryBluetooth} accessibilityRole="button" style={[styles.retryButton, { borderColor: colors.primary }]}>
              <Ionicons name="refresh-outline" size={15} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 11, marginLeft: 6 }}>Search again</Text>
            </Pressable>}
          </View>
        )}
      </Card>

      {mode === 'bluetooth' && <Card>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="watch-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Wearable band</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{bluetoothConnected ? `Receiving readings · ${latest ? new Date(latest.timestamp).toLocaleTimeString() : 'waiting for data'}` : 'Not connected'}</Text>
          </View>
        </View>
        {latest && <View style={{ marginTop: 12 }}>
          <DataRow label="Heart rate" value={latest.heartRate == null ? 'Unavailable' : `${latest.heartRate} bpm · ${latest.heartRateFreshness ?? 'received'}`} />
          <DataRow label="SpO₂" value={latest.spo2 == null ? 'Unavailable' : `${latest.spo2}% · ${latest.spo2Freshness ?? 'received'}`} />
          <DataRow label="Signal quality (HR / SpO₂)" value={`${latest.heartRateQuality ?? 0}% / ${latest.spo2Quality ?? 0}%`} />
          <DataRow label="Activity / risk" value={`${latest.activityState ?? 'unknown'} / ${(latest.riskLevel ?? 'no_data').replace('_', ' ')}`} />
          <DataRow label="Monitoring confidence" value={`${watchStatus?.monitoringConfidence ?? latest.monitoringConfidence ?? 0}%`} />
          <DataRow label="Watch sensors" value={`MAX30102 ${latest.sensorFlags && (latest.sensorFlags & 0x40) ? 'OK' : '—'} · Motion ${latest.sensorFlags && (latest.sensorFlags & 0x10) ? 'OK' : '—'} · BME680 ${latest.sensorFlags && (latest.sensorFlags & 0x20) ? 'OK' : '—'}`} />
        </View>}
        {watchEvents.slice(0, 3).map((event) => <Text key={event.id} style={{ color: colors.textSecondary, fontSize: 11, marginTop: 9 }}>{new Date(event.timestamp).toLocaleTimeString()} · {event.detail}</Text>)}
        {!latest && <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 12 }}>No watch readings received yet. Keep the band powered on and nearby.</Text>}
      </Card>}
    </Screen>
  );
};

const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useTheme();
  return <View style={[styles.dataRow, { borderBottomColor: colors.border }]}>
    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{value}</Text>
  </View>;
};

const ScenarioButton: React.FC<{ title: string; icon: React.ComponentProps<typeof Ionicons>['name']; selected: boolean; onPress: () => void }> = ({ title, icon, selected, onPress }) => {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}
      style={[styles.scenarioButton, { borderColor: selected ? colors.warning : colors.border, backgroundColor: selected ? colors.warning + '20' : colors.surface }]}>
      <Ionicons name={icon} size={16} color={selected ? colors.warning : colors.textMuted} />
      <Text style={{ color: selected ? colors.warning : colors.textSecondary, fontSize: 11, fontWeight: '700', marginLeft: 6 }}>{title}</Text>
      {selected && <Ionicons name="checkmark" size={15} color={colors.warning} style={{ marginLeft: 'auto' }} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modeRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 11, marginTop: 7 },
  notice: { borderRadius: 10, padding: 11, marginTop: 12 },
  retryButton: { minHeight: 34, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, marginTop: 9 },
  dataRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  scenarioArea: { marginLeft: 10, marginRight: 10, padding: 10, paddingTop: 9, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, backgroundColor: 'transparent' },
  scenarioButtons: { flexDirection: 'row', gap: 8 },
  scenarioButton: { minHeight: 40, flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10 },
});
