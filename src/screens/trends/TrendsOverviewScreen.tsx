import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { LineChartMini } from '@/components/LineChartMini';
import { useTheme } from '@/theme/ThemeContext';
import type { TrendPoint } from '@/types';
import type { SensorEvent, SensorMetricKey, SensorSample } from '@/types/sensors';
import { useAppDataMode } from '@/state/AppDataModeContext';
import { mockHeartRateTrend, mockSpO2Trend, mockVitals, mockEnvironment } from '@/data/mockData';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MAX_PLOTTED_POINTS = 58;
const TIME_RANGES = [
  { id: '1m', label: 'Last 1 min', milliseconds: 60_000 },
  { id: '5m', label: 'Last 5 min', milliseconds: 5 * 60_000 },
  { id: '30m', label: 'Last 30 min', milliseconds: 30 * 60_000 },
  { id: '1h', label: 'Last hour', milliseconds: 60 * 60_000 },
] as const;

const METRICS: Array<{
  key: SensorMetricKey;
  title: string;
  unit: string;
  icon: IconName;
  colorName: 'danger' | 'info' | 'warning' | 'accent' | 'primary' | 'success';
  decimals: number;
}> = [
  { key: 'heartRate', title: 'Heart rate', unit: 'bpm', icon: 'heart-outline', colorName: 'danger', decimals: 0 },
  { key: 'spo2', title: 'SpO2', unit: '%', icon: 'water-outline', colorName: 'info', decimals: 1 },
  { key: 'surfaceTemperature', title: 'Surface temperature', unit: '°C', icon: 'thermometer-outline', colorName: 'warning', decimals: 1 },
  { key: 'ambientTemperature', title: 'Ambient temperature', unit: '°C', icon: 'sunny-outline', colorName: 'warning', decimals: 1 },
  { key: 'humidity', title: 'Humidity', unit: '%', icon: 'water-outline', colorName: 'info', decimals: 0 },
  { key: 'pressure', title: 'Atmospheric pressure', unit: 'hPa', icon: 'speedometer-outline', colorName: 'accent', decimals: 0 },
  { key: 'acceleration', title: 'Acceleration', unit: 'm/s²', icon: 'pulse-outline', colorName: 'success', decimals: 2 },
  { key: 'gyroscope', title: 'Gyroscope', unit: 'deg/s', icon: 'sync-outline', colorName: 'info', decimals: 2 },
];

const SCENARIOS = [
  { id: 'normal', label: 'Normal', event: 'Normal status', detail: 'Simulation status set to normal.' },
  { id: 'heat', label: 'Heat stress', event: 'Heat stress', detail: 'Demo heat-stress event recorded.' },
  { id: 'recovery', label: 'Recovery', event: 'Recovery', detail: 'Demo recovery event recorded.' },
  { id: 'sensor', label: 'Sensor failure', event: 'Sensor failure', detail: 'Demo sensor-failure event recorded.' },
  { id: 'fall', label: 'Fall', event: 'Possible fall', detail: 'Demo fall event recorded. No emergency contact was notified.' },
  { id: 'sos', label: 'SOS', event: 'SOS simulation', detail: 'Demo SOS event recorded. No emergency request was sent.' },
] as const;

const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

const formatDuration = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
};

function downsample(samples: SensorSample[]): SensorSample[] {
  if (samples.length <= MAX_PLOTTED_POINTS) return samples;
  const stride = (samples.length - 1) / (MAX_PLOTTED_POINTS - 1);
  return Array.from({ length: MAX_PLOTTED_POINTS }, (_, index) => samples[Math.round(index * stride)]);
}

export const TrendsOverviewScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const { mode, samples: liveSamples, paused, setPaused } = useAppDataMode();
  const samples = useMemo<SensorSample[]>(() => {
    if (mode !== 'offline') return liveSamples;
    const now = Date.now();
    const count = Math.max(mockHeartRateTrend.length, mockSpO2Trend.length);
    return Array.from({ length: count }, (_, i) => ({
      timestamp: now - (count - 1 - i) * 60_000,
      heartRate: mockHeartRateTrend[i]?.value ?? null,
      spo2: mockSpO2Trend[i]?.value ?? null,
      surfaceTemperature: i === count - 1 ? mockVitals.skinTemp : null,
      ambientTemperature: i === count - 1 ? mockEnvironment.temperature : null,
      humidity: i === count - 1 ? mockEnvironment.humidity : null,
      pressure: null, acceleration: null, gyroscope: null, steps: i === count - 1 ? mockVitals.steps : null,
    }));
  }, [mode, liveSamples]);
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [rangeId, setRangeId] = useState<(typeof TIME_RANGES)[number]['id']>('1m');
  const [activeScenario, setActiveScenario] = useState('normal');
  const range = TIME_RANGES.find((option) => option.id === rangeId) ?? TIME_RANGES[0];
  const latestTimestamp = samples[samples.length - 1]?.timestamp ?? Date.now();
  const filteredSamples = useMemo(
    () => samples.filter((sample) => sample.timestamp >= latestTimestamp - range.milliseconds),
    [samples, latestTimestamp, range.milliseconds],
  );
  const plottedSamples = useMemo(() => downsample(filteredSamples), [filteredSamples]);
  const sensorColors = {
    danger: colors.danger,
    info: colors.info,
    warning: colors.warning,
    accent: colors.accent,
    primary: colors.primary,
    success: colors.success,
  };

  const addScenario = (scenario: (typeof SCENARIOS)[number]) => {
    setActiveScenario(scenario.id);
    setEvents((current) => [
      { id: `${Date.now()}-${Math.random()}`, timestamp: Date.now(), event: scenario.event, detail: scenario.detail },
      ...current,
    ].slice(0, 30));
  };

  const showHardwareSetup = () => navigation.navigate('DeviceManagement');

  const resetSimulation = () => {
    setEvents([]);
    setActiveScenario('normal');
    if (mode !== 'simulation') showHardwareSetup();
  };

  const exportReadings = async () => {
    if (!filteredSamples.length) {
      Alert.alert('No readings in this range', 'There are no samples to export yet.');
      return;
    }
    const columns = ['timestamp', ...METRICS.map((metric) => metric.key)];
    const csv = [
      columns.join(','),
      ...filteredSamples.map((sample) => [
        new Date(sample.timestamp).toISOString(),
        ...METRICS.map((metric) => sample[metric.key] ?? ''),
      ].join(',')),
    ].join('\n');
    try {
      await Share.share({ title: 'SwasthAI sensor readings', message: csv });
    } catch {
      Alert.alert('Export unavailable', 'Could not open the share sheet.');
    }
  };

  const firstSample = filteredSamples[0];
  const lastSample = filteredSamples[filteredSamples.length - 1];
  const coverage = firstSample && lastSample ? lastSample.timestamp - firstSample.timestamp : 0;

  return (
    <Screen edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Trends</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: -8, marginBottom: 12 }}>
        {mode === 'bluetooth' && !samples.length ? 'Waiting for Bluetooth sensor readings' : 'Sensor readings and events over time'}
      </Text>

      <Card style={styles.sourceCard}>
        <View style={styles.sourceHeader}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Data source</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 3 }}>
              {mode === 'offline' ? 'Fixed demo snapshot' : mode === 'bluetooth' ? (samples.length ? 'Bluetooth sensor readings' : 'Waiting for Bluetooth readings') : paused ? 'Simulation paused' : 'Live simulation'} · {samples.length} samples buffered
            </Text>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: paused ? colors.surfaceAlt : colors.success + '20' }]}>
            <View style={[styles.liveDot, { backgroundColor: mode === 'bluetooth' && !samples.length ? colors.warning : paused ? colors.textMuted : colors.success }]} />
            <Text style={{ color: mode === 'bluetooth' && !samples.length ? colors.warning : paused ? colors.textMuted : colors.success, fontSize: 10, fontWeight: '700' }}>
              {mode === 'offline' ? 'OFFLINE DEMO' : mode === 'bluetooth' ? (samples.length ? 'BLUETOOTH' : 'WAITING') : paused ? 'PAUSED' : 'SIMULATION'}
            </Text>
          </View>
        </View>
        <View style={styles.sourceActions}>
          <SourceButton label={mode === 'bluetooth' ? 'Bluetooth' : 'Device settings'} icon="bluetooth-outline" active={mode === 'bluetooth'} onPress={showHardwareSetup} />
          <SourceButton label={mode === 'simulation' ? 'Simulation' : 'Data settings'} icon="flask-outline" active={mode === 'simulation'} onPress={showHardwareSetup} />
          {mode === 'simulation' && <Pressable onPress={resetSimulation} accessibilityRole="button" accessibilityLabel="Clear simulation events" style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
          </Pressable>}
        </View>
      </Card>

      {mode === 'simulation' && <Card style={{ ...styles.scenarioCard, backgroundColor: colors.surfaceAlt }}>
        <View style={styles.scenarioHeading}>
          <Ionicons name="flash-outline" size={15} color={colors.warning} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11, marginLeft: 6 }}>Simulation controls</Text>
          <Text style={{ color: colors.textMuted, fontSize: 9, marginLeft: 'auto' }}>demo events only</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioRow}>
          {SCENARIOS.map((scenario) => (
            <Pressable
              key={scenario.id}
              onPress={() => addScenario(scenario)}
              accessibilityRole="button"
              style={[
                styles.scenarioChip,
                { borderColor: activeScenario === scenario.id ? colors.primary : colors.border },
                activeScenario === scenario.id && { backgroundColor: colors.primary + '18' },
              ]}
            >
              <Text style={{ color: activeScenario === scenario.id ? colors.primary : colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                {scenario.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setPaused((current) => !current)}
            accessibilityRole="button"
            style={[styles.scenarioChip, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>{paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
        </ScrollView>
      </Card>}

      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangeRow}>
          {TIME_RANGES.map((option) => {
            const selected = rangeId === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setRangeId(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.rangeButton,
                  { backgroundColor: selected ? colors.primary : colors.surfaceAlt, borderColor: selected ? colors.primary : colors.border },
                ]}
              >
                <Text style={{ color: selected ? colors.primaryText : colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable onPress={exportReadings} accessibilityRole="button" style={[styles.exportButton, { borderColor: colors.border }]}>
          <Ionicons name="download-outline" size={15} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600', marginLeft: 4 }}>Export</Text>
        </Pressable>
      </View>

      {METRICS.map((metric) => {
        const series: TrendPoint[] = plottedSamples
          .filter((sample) => sample[metric.key] !== null)
          .map((sample) => ({ label: formatTime(sample.timestamp), value: sample[metric.key] as number }));
        const currentSeries = filteredSamples.filter((sample) => sample[metric.key] !== null);
        const latestValue = currentSeries[currentSeries.length - 1]?.[metric.key];
        const formattedValue = typeof latestValue === 'number' ? latestValue.toFixed(metric.decimals) : '—';
        return (
          <MetricChartCard
            key={metric.key}
            title={metric.title}
            value={`${formattedValue} ${metric.unit}`}
            icon={metric.icon}
            color={sensorColors[metric.colorName]}
            unit={metric.unit}
            data={series}
            selectionKey={rangeId}
          />
        );
      })}

      <Card>
        <View style={styles.cardTitleRow}>
          <Ionicons name="time-outline" size={16} color={colors.success} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginLeft: 7 }}>Time range summary</Text>
        </View>
        <SummaryRow label="Source" value={mode === 'offline' ? 'Offline demo' : mode === 'bluetooth' ? 'Bluetooth' : 'Simulation'} />
        <SummaryRow label="Samples in selected range" value={String(filteredSamples.length)} />
        <SummaryRow label="Coverage" value={formatDuration(coverage)} />
        <SummaryRow label="First sample" value={firstSample ? formatTime(firstSample.timestamp) : '—'} />
        <SummaryRow label="Last sample" value={lastSample ? formatTime(lastSample.timestamp) : '—'} />
        <Text style={{ color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 8 }}>
          {mode === 'offline' ? 'Fixed demonstration readings. Missing metrics are left blank.' : mode === 'bluetooth' ? 'Only received Bluetooth samples are shown. Missing metrics are left blank.' : 'Generated demonstration readings, not received from a wearable. Missing metrics are left blank.'}
        </Text>
      </Card>

      <Card>
        <View style={styles.cardTitleRow}>
          <Ionicons name="document-text-outline" size={16} color={colors.success} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13, marginLeft: 7 }}>Recent events</Text>
        </View>
        {events.length ? events.map((event) => (
          <View key={event.id} style={[styles.eventRow, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.textMuted, fontSize: 9, width: 76 }}>{formatTime(event.timestamp)}</Text>
            <View style={[styles.eventBadge, { backgroundColor: colors.info + '18' }]}>
              <Text style={{ color: colors.info, fontSize: 8, fontWeight: '800' }}>{event.event.toUpperCase()}</Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 10, flex: 1, marginLeft: 8 }}>{event.detail}</Text>
          </View>
        )) : (
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 12 }}>
            No events in this session. Use a simulation control above to add a clearly labeled demo event.
          </Text>
        )}
      </Card>

      <NavCard icon="body-outline" label="Personal Baseline" onPress={() => navigation.navigate('PersonalBaseline')} />
      <NavCard icon="fitness-outline" label="Recovery Tracking" onPress={() => navigation.navigate('RecoveryTracking')} />
      <NavCard icon="document-text-outline" label="Export Summary" onPress={() => navigation.navigate('ExportSummary')} />
    </Screen>
  );
};

const SourceButton: React.FC<{ label: string; icon: IconName; active: boolean; onPress: () => void }> = ({ label, icon, active, onPress }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.sourceButton,
        { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border },
      ]}
    >
      <Ionicons name={icon} size={13} color={active ? colors.primaryText : colors.textMuted} />
      <Text style={{ color: active ? colors.primaryText : colors.textSecondary, fontSize: 10, fontWeight: '600', marginLeft: 5 }}>
        {label}
      </Text>
    </Pressable>
  );
};

const MetricChartCard: React.FC<{
  title: string;
  value: string;
  icon: IconName;
  color: string;
  unit: string;
  data: TrendPoint[];
  selectionKey: string;
}> = ({ title, value, icon, color, unit, data, selectionKey }) => {
  const { colors } = useTheme();
  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricName}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12, marginLeft: 7, flexShrink: 1 }}>{title}</Text>
        </View>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>{value}</Text>
      </View>
      <LineChartMini data={data} color={color} unit={unit} height={116} selectionKey={selectionKey} />
    </Card>
  );
};

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.summaryLine, { borderBottomColor: colors.border }]}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11 }}>{value}</Text>
    </View>
  );
};

const NavCard: React.FC<{ icon: IconName; label: string; onPress: () => void }> = ({ icon, label, onPress }) => {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card>
        <View style={styles.navRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name={icon} size={18} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontWeight: '600', flex: 1, marginLeft: 10 }}>{label}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  sourceCard: { marginBottom: 8 },
  sourceHeader: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  sourceActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 7 },
  sourceButton: { minHeight: 32, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 9 },
  refreshButton: { marginLeft: 'auto', minWidth: 34, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  scenarioCard: { paddingVertical: 12, marginBottom: 12 },
  scenarioHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  scenarioRow: { flexDirection: 'row', gap: 6, paddingRight: 4 },
  scenarioChip: { minHeight: 28, paddingHorizontal: 9, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 7 },
  rangeButton: { minHeight: 30, paddingHorizontal: 9, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exportButton: { minHeight: 30, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8 },
  metricCard: { paddingHorizontal: 12, paddingVertical: 12 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  metricName: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryLine: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  eventRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  eventBadge: { maxWidth: 112, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9 },
  navRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
