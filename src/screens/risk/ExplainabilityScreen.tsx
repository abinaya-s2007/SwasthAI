import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme/ThemeContext';
import { mockRiskScore, mockTopFactors } from '@/data/mockData';

export const ExplainabilityScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Screen>
      <Header title="Why this score?" />
      <Card>
        <View style={styles.row}>
          <Ionicons name="bulb-outline" size={20} color={colors.accent} />
          <Text style={{ color: colors.text, marginLeft: 8, fontSize: 13, flex: 1, lineHeight: 19 }}>
            This score is based on your current vitals, recent trends and environmental conditions.
          </Text>
        </View>
      </Card>

      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6, marginTop: 4 }}>Top Factors</Text>
      {mockTopFactors.map((f) => (
        <Card key={f.label}>
          <View style={styles.factorRow}>
            <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>{f.label}</Text>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>{f.weight}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { width: `${f.weight}%`, backgroundColor: colors.primary }]} />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Model Confidence</Text>
        <View style={styles.factorRow}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>{mockRiskScore.confidence}%</Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.fill, { width: `${mockRiskScore.confidence}%`, backgroundColor: colors.accent }]} />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  factorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
