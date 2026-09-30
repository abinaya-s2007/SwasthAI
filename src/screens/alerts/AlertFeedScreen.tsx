import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme/ThemeContext';
import { mockAlerts } from '@/data/mockData';
import { AlertSeverity } from '@/types';
import { useAppDataMode } from '@/state/AppDataModeContext';
import { buildLiveAlerts } from '@/services/liveAlerts';

const FILTERS: (AlertSeverity | 'All')[] = ['All', 'High', 'Medium', 'Low'];

const severityColor = (s: AlertSeverity, colors: any) =>
  s === 'High' ? colors.danger : s === 'Medium' ? colors.warning : colors.success;

export const AlertFeedScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const { mode, samples, watchEvents } = useAppDataMode();
  const [filter, setFilter] = useState<AlertSeverity | 'All'>('All');

  const alerts = mode === 'bluetooth' ? buildLiveAlerts(samples, watchEvents) : mockAlerts;
  const filtered = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <Screen edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AlertHistory')}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const selected = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.pill,
                { backgroundColor: selected ? colors.primary : colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: selected ? colors.primaryText : colors.text, fontSize: 12, fontWeight: '700' }}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === 'bluetooth' && <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 10 }}>Alerts from current watch readings and SOS/fall events.</Text>}

      {filtered.map((a) => (
        <TouchableOpacity key={a.id} onPress={() => navigation.navigate('AlertDetail', { alertId: a.id })}>
          <Card>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: severityColor(a.severity, colors) + '22' }]}>
                <Ionicons name="heart" size={16} color={severityColor(a.severity, colors)} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{a.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{a.timestamp}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      {filtered.length === 0 && (
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{mode === 'bluetooth' ? 'No watch alerts yet' : 'No alerts'}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 5, lineHeight: 17 }}>
            {mode === 'bluetooth' ? 'Alerts will appear here when the connected watch reports a high-risk reading, a heat warning, SOS, or a fall.' : 'There are no alerts in this category.'}
          </Text>
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
