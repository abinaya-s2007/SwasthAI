import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { RadioGroup } from '@/components/Selectors';
import { LineChartMini } from '@/components/LineChartMini';
import { useTheme } from '@/theme/ThemeContext';
import { mockHeartRateTrend, mockVitals } from '@/data/mockData';
import { useAppDataMode } from '@/state/AppDataModeContext';

export const VitalDetailHeartRateScreen: React.FC = () => {
  const { colors } = useTheme();
  const { mode, samples, latest } = useAppDataMode();
  const [range, setRange] = useState('Day');
  const chartData = mode === 'offline' ? mockHeartRateTrend : samples
    .filter((sample) => sample.heartRate !== null)
    .slice(-58)
    .map((sample) => ({ label: new Date(sample.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: sample.heartRate as number }));
  const readings = chartData.map((point) => point.value);
  const readingMin = Math.min(...readings);
  const readingMax = Math.max(...readings);
  const readingAverage = Math.round(readings.reduce((sum, value) => sum + value, 0) / readings.length);

  return (
    <Screen>
      <Header title="Heart Rate" />
      <RadioGroup options={['Day', 'Week', 'Month']} value={range} onChange={setRange} />

      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Current</Text>
        <View style={styles.bigRow}>
          <Text style={[styles.bigValue, { color: colors.text }]}>{mode === 'offline' ? mockVitals.heartRate : latest?.heartRate ?? '—'}</Text>
          <Text style={{ color: colors.textMuted, marginLeft: 6, marginBottom: 6 }}>bpm</Text>
        </View>
        <LineChartMini data={chartData} color={colors.danger} unit="bpm" />
      </Card>

      <Card>
        <View style={styles.rangeRow}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Normal Range</Text>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>60 – 100 bpm</Text>
        </View>
      </Card>
      <Card>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>Reading summary</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
          {mode === 'offline' ? 'Fixed offline demo readings' : mode === 'simulation' ? 'Generated simulation readings' : 'Bluetooth sensor readings only'}
        </Text>
        <View style={styles.summaryRow}>
          <SummaryValue label="Lowest" value={readings.length ? readingMin : '—'} color={colors.info} />
          <SummaryValue label="Average" value={readings.length ? readingAverage : '—'} color={colors.primary} />
          <SummaryValue label="Highest" value={readings.length ? readingMax : '—'} color={colors.warning} />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4, marginBottom: 12 },
  bigValue: { fontSize: 36, fontWeight: '800' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18 },
  summaryItem: { alignItems: 'center', minWidth: 70 },
});

const SummaryValue: React.FC<{ label: string; value: number | string; color: string }> = ({ label, value, color }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryItem}>
      <Text style={{ color, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 3 }}>{label}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 10 }}>bpm</Text>
    </View>
  );
};
