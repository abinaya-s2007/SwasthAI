import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import type { TrendPoint } from '@/types';

type Props = {
  data: TrendPoint[];
  color: string;
  unit?: string;
  selectionKey?: string;
  height?: number;
  showLabels?: boolean;
};

const niceStep = (value: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(value, 0.0001)));
  const fraction = value / magnitude;
  const step = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return step * magnitude;
};

export const LineChartMini: React.FC<Props> = ({ data, color, unit = '', selectionKey, height = 142, showLabels = true }) => {
  const { colors } = useTheme();
  const [selectedLabel, setSelectedLabel] = useState(data[data.length - 1]?.label ?? '');
  const previousSelectionKey = useRef(selectionKey);
  const width = 320;
  const left = 42;
  const right = width - 8;
  const top = 10;
  const bottom = height - 10;
  const values = data.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.15, rawMax === rawMin ? Math.abs(rawMax) * 0.05 : 0.5);
  const step = niceStep((rawMax - rawMin + padding * 2) / 3);
  const scaleMin = Math.floor((rawMin - padding) / step) * step;
  const scaleMax = Math.ceil((rawMax + padding) / step) * step;
  const domain = Math.max(scaleMax - scaleMin, step);
  const ticks: number[] = [];
  for (let tick = scaleMin; tick <= scaleMax + step * 0.01; tick += step) ticks.push(Number(tick.toFixed(2)));
  const points = data.map((point, index) => ({
    x: left + (index / Math.max(data.length - 1, 1)) * (right - left),
    y: top + ((scaleMax - point.value) / domain) * (bottom - top),
  }));
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const foundIndex = data.findIndex((point) => point.label === selectedLabel);
  const selectedIndex = foundIndex < 0 ? Math.max(data.length - 1, 0) : foundIndex;
  const selected = data[selectedIndex];

  useEffect(() => {
    const rangeChanged = previousSelectionKey.current !== selectionKey;
    previousSelectionKey.current = selectionKey;
    if (rangeChanged || !data.some((point) => point.label === selectedLabel)) {
      setSelectedLabel(data[data.length - 1]?.label ?? '');
    }
  }, [data, selectedLabel, selectionKey]);

  if (data.length === 0) return null;

  return (
    <View>
      {selected ? (
        <View style={styles.pointSummary}>
          <Text style={{ color, fontSize: 17, fontWeight: '800' }}>
            {selected.value}{unit ? ` ${unit}` : ''}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{selected.label} · selected point</Text>
        </View>
      ) : null}
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((tick) => {
          const y = top + ((scaleMax - tick) / domain) * (bottom - top);
          return (
            <React.Fragment key={tick}>
              <Line x1={left} x2={right} y1={y} y2={y} stroke={colors.chartGrid} strokeWidth={1} />
              <SvgText x={left - 6} y={y + 3} fill={colors.textMuted} fontSize={9} textAnchor="end">
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={2.5} />
        {points.map((point, index) => (
          <React.Fragment key={`${data[index].label}-${index}`}>
            <Circle
              cx={point.x}
              cy={point.y}
              r={10}
              fill={color}
              opacity={0.01}
              onPress={() => setSelectedLabel(data[index].label)}
              accessibilityLabel={`${data[index].label}: ${data[index].value} ${unit}`}
            />
            <Circle
              cx={point.x}
              cy={point.y}
              r={index === selectedIndex ? 5 : 3.5}
              fill={color}
              stroke={colors.card}
              strokeWidth={index === selectedIndex ? 2 : 0}
              pointerEvents="none"
            />
          </React.Fragment>
        ))}
      </Svg>
      {showLabels ? (
        <View style={[styles.labelRow, { marginLeft: 42 }]}>
          {Array.from(new Set([0, Math.round((data.length - 1) / 4), Math.round((data.length - 1) / 2), Math.round(((data.length - 1) * 3) / 4), data.length - 1])).map((index) => {
            const point = data[index];
            const position = index / Math.max(data.length - 1, 1);
            const isFirst = index === 0;
            const isLast = index === data.length - 1;
            const anchor = isFirst ? 'left' : isLast ? 'right' : 'center';
            const marginLeft = isFirst ? 0 : isLast ? -70 : -35;
            return (
            <Text
              key={`${point.label}-${index}`}
              numberOfLines={1}
              style={[
                styles.labelText,
                {
                  color: index === selectedIndex ? colors.text : colors.textMuted,
                  left: `${position * 100}%`,
                  marginLeft,
                  textAlign: anchor,
                },
              ]}
            >
              {point.label}
            </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  pointSummary: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 },
  labelRow: { height: 16, marginTop: 4, position: 'relative' },
  labelText: { position: 'absolute', fontSize: 9, width: 70 },
});
