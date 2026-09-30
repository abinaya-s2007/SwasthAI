import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  value: number; // 0-100
  max?: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
};

export const GaugeChart: React.FC<Props> = ({
  value,
  max = 100,
  color,
  size = 140,
  strokeWidth = 12,
  label,
  sublabel,
}) => {
  const { colors } = useTheme();
  const radiusVal = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusVal;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const dashOffset = circumference * (1 - pct);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusVal}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusVal}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.center}>
          <View style={styles.numberRow}>
            <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.max, { color: colors.textMuted }]}>/{max}</Text>
          </View>
          {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
          {sublabel ? <Text style={[styles.sublabel, { color: colors.textMuted }]}>{sublabel}</Text> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  max: {
    fontSize: 11,
    marginTop: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  sublabel: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
});
