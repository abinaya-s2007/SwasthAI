import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { GaugeChart } from '@/components/GaugeChart';
import { RiskBadge } from '@/components/Misc';
import { useTheme } from '@/theme/ThemeContext';
import { riskColor } from '@/theme/colors';
import { mockHeatRisk, mockRiskScore } from '@/data/mockData';

export const RiskDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();

  return (
    <Screen>
      <Header title="Overall Risk" />
      <Card style={styles.center}>
        <GaugeChart
          value={mockRiskScore.overall}
          color={riskColor(mockRiskScore.level, colors)}
          label="Normal"
          size={100}
        />
      </Card>

      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6, marginTop: 4 }}>Sub-scores</Text>
      {mockRiskScore.subScores.map((s) => (
        <TouchableOpacity key={s.label} onPress={() => navigation.navigate('SubScoreDetail', { label: s.label })}>
          <Card>
            <View style={styles.subRow}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{s.label}</Text>
              <View style={styles.subRight}>
                <Text style={{ color: colors.textMuted, marginRight: 8, fontSize: 12 }}>{s.value}</Text>
                <RiskBadge level={s.level} />
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 4 }} />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={() => navigation.navigate('Explainability')}>
        <Card>
          <View style={styles.subRow}>
            <View style={styles.whyRow}>
              <Ionicons name="bulb-outline" size={18} color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: '600', marginLeft: 8 }}>Why this score?</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>

      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Heat Risk</Text>
        <View style={styles.subRow}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>{mockHeatRisk.overall}/100</Text>
          <RiskBadge level={mockHeatRisk.level} />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subRight: { flexDirection: 'row', alignItems: 'center' },
  whyRow: { flexDirection: 'row', alignItems: 'center' },
});
