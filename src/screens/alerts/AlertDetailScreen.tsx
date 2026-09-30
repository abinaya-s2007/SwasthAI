import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { mockAlerts } from '@/data/mockData';
import { useAppDataMode } from '@/state/AppDataModeContext';
import { buildLiveAlerts } from '@/services/liveAlerts';

export const AlertDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'AlertDetail'>>();
  const { mode, samples, watchEvents } = useAppDataMode();
  const alerts = mode === 'bluetooth' ? buildLiveAlerts(samples, watchEvents) : mockAlerts;
  const alert = alerts.find((a) => a.id === route.params.alertId) ?? mockAlerts[0];

  const severityColor = alert.severity === 'High' ? colors.danger : alert.severity === 'Medium' ? colors.warning : colors.success;

  return (
    <Screen>
      <Header title="Alert Detail" />
      <Card style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: severityColor + '22' }]}>
          <Ionicons name="heart" size={28} color={severityColor} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{alert.title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{alert.timestamp}</Text>
      </Card>

      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>Details</Text>
        <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>{alert.description}</Text>
      </Card>

      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>What to do</Text>
        {alert.whatToDo.map((step) => (
          <View key={step} style={styles.stepRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.text, marginLeft: 8, fontSize: 13, flex: 1 }}>{step}</Text>
          </View>
        ))}
      </Card>

      <Button label="Mark as Reviewed" onPress={() => navigation.goBack()} />
      <Button
        label="This was a False Alarm"
        variant="secondary"
        onPress={() => navigation.goBack()}
        style={{ marginTop: 10 }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});
