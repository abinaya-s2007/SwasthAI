import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useTheme } from '@/theme/ThemeContext';
import { radius, riskColor, spacing } from '@/theme/colors';
import { RiskLevel } from '@/types';

// ---- Risk-level badge (Normal / Caution / High / Low) ----
export const RiskBadge: React.FC<{ level: RiskLevel; label?: string }> = ({ level, label }) => {
  const { colors } = useTheme();
  const color = riskColor(level, colors);
  const text = label ?? level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
};

// ---- Section title ----
export const SectionTitle: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({
  title,
  action,
  onAction,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ---- Navigable settings-style row ----
type ListRowProps = {
  icon?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
};
export const ListRow: React.FC<ListRowProps> = ({ icon, label, value, onPress, danger }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.listRow, { borderBottomColor: colors.border }]}
      activeOpacity={0.6}
    >
      <View style={styles.listRowLeft}>
        {icon ? (
          <View style={[styles.listIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name={icon} size={16} color={danger ? colors.danger : colors.primary} />
          </View>
        ) : null}
        <Text style={[styles.listLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      </View>
      <View style={styles.listRowRight}>
        {value ? <Text style={[styles.listValue, { color: colors.textMuted }]}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
      </View>
    </TouchableOpacity>
  );
};

// ---- Stat pill (used in dashboard cards) ----
export const StatPill: React.FC<{
  icon: string;
  value: string;
  label: string;
  color?: string;
}> = ({ icon, value, label, color }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={18} color={color ?? colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  action: { fontSize: 13, fontWeight: '600' },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  listRowRight: { flexDirection: 'row', alignItems: 'center' },
  listIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  listLabel: { fontSize: 14, fontWeight: '600' },
  listValue: { fontSize: 13, marginRight: 6 },
  statPill: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  statLabel: { fontSize: 10, marginTop: 1 },
});
