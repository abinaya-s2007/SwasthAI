import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { GaugeChart } from '@/components/GaugeChart';
import { RiskBadge } from '@/components/Misc';
import { useTheme } from '@/theme/ThemeContext';
import { riskColor } from '@/theme/colors';
import { mockRiskScore } from '@/data/mockData';

export const SubScoreDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'SubScoreDetail'>>();
  const sub = mockRiskScore.subScores.find((s) => s.label === route.params.label) ?? mockRiskScore.subScores[0];

  const notes: Record<string, string> = {
    Cardiac: 'Heart rate variability and resting HR are within your learned baseline.',
    Heat: 'Ambient heat index in your area is elevated, raising exertion risk.',
    Dehydration: 'Fluid intake pattern looks slightly below your typical daily average.',
    Respiratory: 'Breathing rate and SpO2 trends are stable.',
    Fatigue: 'Recent sleep duration was shorter than your usual baseline.',
  };
  const suggestions: Record<string, string[]> = {
    Cardiac: ['Sit calmly before taking another reading.', 'If you have chest pain, fainting, or severe symptoms, seek urgent medical help.'],
    Heat: ['Take a break in a cool or shaded place.', 'Keep water nearby and avoid strenuous activity during the hottest part of the day.'],
    Dehydration: ["Keep water within reach and drink according to your clinician's guidance.", 'Follow any fluid limits you have been given.'],
    Respiratory: ['Rest and check that your wearable is fitted correctly.', 'Get urgent help for severe or worsening difficulty breathing.'],
    Fatigue: ['Consider a lighter day and keep a regular sleep routine.', 'Talk with a healthcare professional if unusual fatigue continues.'],
  };
  const actions = suggestions[sub.label] ?? ['Use this score as a prompt to review how you feel.', 'Contact a healthcare professional if you are concerned.'];

  return (
    <Screen>
      <Header title={sub.label} />
      <Card style={styles.center}>
        <GaugeChart value={sub.value} color={riskColor(sub.level, colors)} size={140} />
        <RiskBadge level={sub.level} />
      </Card>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>What this means</Text>
        <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>
          {notes[sub.label] ?? 'This factor is contributing to your overall risk score.'}
        </Text>
      </Card>
      <Card>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10 }}>
          Helpful next steps
        </Text>
        {actions.map((action, index) => (
          <View key={action} style={[styles.actionRow, index > 0 && { marginTop: 10 }]}>
            <Text style={{ color: colors.primary, fontWeight: '800', marginRight: 8 }}>-</Text>
            <Text style={{ color: colors.textSecondary, flex: 1, fontSize: 12, lineHeight: 18 }}>{action}</Text>
          </View>
        ))}
        <Text style={{ color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 12 }}>
          Demo score and explanation only; this is not a diagnosis. Use symptoms and professional medical advice to guide care.
        </Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
