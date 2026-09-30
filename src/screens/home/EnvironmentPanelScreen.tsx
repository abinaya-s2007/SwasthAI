import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { RiskBadge } from '@/components/Misc';
import { useTheme } from '@/theme/ThemeContext';
import { mockEnvironment } from '@/data/mockData';
import { useAppDataMode } from '@/state/AppDataModeContext';

export const EnvironmentPanelScreen: React.FC = () => {
  const { colors } = useTheme();
  const { mode, latest, bluetoothConnected, watchStatus, scenario } = useAppDataMode();
  const e = mockEnvironment;
  const isBluetooth = mode === 'bluetooth';
  const usesLiveReadings = mode !== 'offline';
  const ambientTemperature = latest?.ambientTemperature ?? watchStatus?.ambientTemperature ?? null;
  const humidity = latest?.humidity ?? watchStatus?.humidity ?? null;
  const pressure = latest?.pressure ?? watchStatus?.pressure ?? null;
  const heatRisk = latest?.heatRisk ?? watchStatus?.heatRisk ?? null;
  const heatRiskLevel = heatRisk == null ? 'normal' : heatRisk >= 60 ? 'high' : heatRisk >= 35 ? 'caution' : 'low';

  const stats: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }[] = usesLiveReadings ? [
    { icon: isBluetooth ? 'bluetooth-outline' : 'pulse-outline', label: 'Data source', value: isBluetooth ? bluetoothConnected ? 'SwasthAI-Watch' : 'Waiting for watch' : 'Simulation' },
    { icon: 'thermometer-outline', label: 'Ambient temperature', value: ambientTemperature == null ? 'Unavailable' : `${ambientTemperature.toFixed(1)}°C` },
    { icon: 'water-outline', label: 'Humidity', value: humidity == null ? 'Unavailable' : `${Math.round(humidity)}%` },
    { icon: 'speedometer-outline', label: 'Pressure', value: pressure == null ? 'Unavailable' : `${pressure.toFixed(1)} hPa` },
    { icon: 'flame-outline', label: 'Heat risk', value: heatRisk == null ? isBluetooth ? 'Unavailable' : scenario === 'heatStress' ? 'Heat stress demo' : 'Not generated' : `${heatRisk}/100` },
    ...(isBluetooth ? [{ icon: 'speedometer-outline' as const, label: 'WBGT', value: 'Not sent by watch' }] : []),
  ] : [
    { icon: 'location-outline', label: 'Location', value: e.location },
    { icon: 'thermometer-outline', label: 'Temperature', value: `${e.temperature}°C` },
    { icon: 'water-outline', label: 'Humidity', value: `${e.humidity}%` },
    { icon: 'flame-outline', label: 'Heat Index', value: `${e.heatIndex}°C` },
    { icon: 'speedometer-outline', label: 'WBGT', value: `${e.wbgt}` },
  ];

  return (
    <Screen>
      <Header title="Environment" />
      <Card style={styles.badgeCard}>
        <RiskBadge
          level={usesLiveReadings ? scenario === 'heatStress' && mode === 'simulation' ? 'high' : heatRiskLevel : e.heatIndexRisk}
          label={usesLiveReadings ? heatRisk == null ? isBluetooth ? 'Watch heat risk unavailable' : scenario === 'heatStress' ? 'Heat stress simulation' : 'Heat risk unavailable' : `Heat risk ${heatRisk}/100` : 'Heat Index High'}
        />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
          {usesLiveReadings
            ? isBluetooth ? 'Environmental readings and heat-risk score are from the connected watch.' : 'Values update from the current simulation readings.'
            : 'Heat temperature expected in your area. Avoid outdoor activities.'}
        </Text>
      </Card>
      <Card noPadding>
        {stats.map((s, i) => (
          <View
            key={s.label}
            style={[
              styles.row,
              { borderBottomColor: colors.border, borderBottomWidth: i === stats.length - 1 ? 0 : StyleSheet.hairlineWidth },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name={s.icon} size={16} color={colors.primary} />
            </View>
            <Text style={{ color: colors.textSecondary, flex: 1, marginLeft: 10 }}>{s.label}</Text>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{s.value}</Text>
          </View>
        ))}
      </Card>
      <Card>
        <View style={styles.sectionHeading}>
          <Ionicons name="sunny-outline" size={18} color={colors.warning} />
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8 }}>Heat safety</Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8 }}>
          {(usesLiveReadings ? scenario === 'heatStress' && mode === 'simulation' || heatRisk != null && heatRisk >= 60 : e.heatIndexRisk === 'high')
            ? 'Choose a cooler time for outdoor activity, take breaks in shade, and keep water nearby.'
            : 'Check the conditions before longer outdoor activity and take breaks if you feel overheated.'}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 10 }}>
          {usesLiveReadings
            ? isBluetooth ? 'The watch firmware does not send GPS location or WBGT. Unavailable fields are not replaced with demo values.' : 'WBGT and heat-risk score are not generated by this simulation.'
            : 'These are demo environment readings. Follow any fluid limits given by your clinician.'}
        </Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  badgeCard: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center' },
});
