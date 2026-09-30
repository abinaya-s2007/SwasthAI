import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  values: number[];
  color: string;
  height?: number;
};

export const BarChartMini: React.FC<Props> = ({ values, color, height = 70 }) => {
  const { colors } = useTheme();
  const width = 300;
  const max = Math.max(...values, 1);
  const gap = 4;
  const barWidth = width / values.length - gap;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {values.map((v, i) => {
          const barHeight = (v / max) * (height - 4);
          const x = i * (barWidth + gap);
          const y = height - barHeight;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill={i === values.length - 1 ? color : colors.chartGrid}
            />
          );
        })}
      </Svg>
    </View>
  );
};
