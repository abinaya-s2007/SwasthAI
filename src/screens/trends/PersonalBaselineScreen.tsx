import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme/ThemeContext';
import { mockBaseline } from '@/data/mockData';

export const PersonalBaselineScreen: React.FC = () => {
  const { colors } = useTheme();

  const rows: { icon: string; label: string; value: string }[] = [
    { icon: 'heart-outline', label: 'Heart Rate', value: mockBaseline.heartRateRange },
    { icon: 'water-outline', label: 'SpO2', value: '96 – 99%' },
    { icon: 'moon-outline', label: 'Sleep', value: '6.5 – 8h' },
    { icon: 'walk-outline', label: 'Daily Steps', value: '2,500 – 6,000' },
  ];

  return (
    <Screen>
      <Header title="Personal Baseline" subtitle={`Learned over ${mockBaseline.learnedOverDays} days`} />
      <Card noPadding>
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={[
              styles.row,
              i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <Ionicons name={r.icon} size={18} color={colors.primary} />
            <Text style={{ color: colors.textSecondary, flex: 1, marginLeft: 10 }}>{r.label}</Text>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{r.value}</Text>
          </View>
        ))}
      </Card>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>
          Your baseline range is used to detect deviations that may indicate elevated risk. It
          continues to refine as more data is collected.
        </Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
});
