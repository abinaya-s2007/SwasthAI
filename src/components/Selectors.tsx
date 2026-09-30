import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing } from '@/theme/colors';

// ---- Radio Group (single select, horizontal pills) ----
type RadioProps = {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
};
export const RadioGroup: React.FC<RadioProps> = ({ options, value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? colors.primary : colors.surfaceAlt,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: selected ? colors.primaryText : colors.text, fontWeight: '600', fontSize: 13 }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ---- Multi-select chips (for chronic conditions, allergies) ----
type ChipsProps = {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
};
export const CheckChips: React.FC<ChipsProps> = ({ options, values, onToggle }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onToggle(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary + '22' : colors.surfaceAlt,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            {selected ? (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            ) : null}
            <Text style={{ color: selected ? colors.primary : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ---- Settings-style toggle row ----
type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: string;
};
export const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange, icon }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        {icon ? (
          <View style={[styles.toggleIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name={icon} size={16} color={colors.primary} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
          {description ? (
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{description}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  toggleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
});
