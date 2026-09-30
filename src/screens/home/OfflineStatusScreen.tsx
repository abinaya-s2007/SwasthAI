import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

export const OfflineStatusScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Screen>
      <Header title="Sync Status" />
      <View style={styles.center}>
        <View style={[styles.circle, { backgroundColor: colors.success + '22' }]}>
          <Ionicons name="cloud-done" size={40} color={colors.success} />
        </View>
        <Text style={[styles.status, { color: colors.text }]}>Online</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
          Your device is connected and syncing normally
        </Text>
      </View>

      <Card>
        <Row icon="notifications-outline" label="Pending Alerts" value="2 waiting to sync" />
        <Row icon="pulse-outline" label="Vitals Records" value="5 records waiting" />
        <Row icon="time-outline" label="Last Full Sync" value="2 minutes ago" last />
      </Card>

      <Button label="Sync Now" onPress={() => {}} style={{ marginTop: 8 }} />
    </Screen>
  );
};

const Row: React.FC<{ icon: string; label: string; value: string; last?: boolean }> = ({
  icon,
  label,
  value,
  last,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={{ color: colors.textSecondary, flex: 1, marginLeft: 10 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 24 },
  circle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  status: { fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
});
