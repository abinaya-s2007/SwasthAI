import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing } from '@/theme/colors';

type Props = {
  step: number;
  total: number;
  label: string;
};

export const StepProgress: React.FC<Props> = ({ step, total, label }) => {
  const { colors } = useTheme();
  const pct = step / total;
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={styles.topRow}>
        <Text style={[styles.stepText, { color: colors.textMuted }]}>
          Step {step}/{total}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stepText: { fontSize: 12, fontWeight: '600' },
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.pill },
  label: { fontSize: 20, fontWeight: '700', marginTop: 12 },
});
