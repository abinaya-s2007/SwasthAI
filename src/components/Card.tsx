import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing } from '@/theme/colors';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
};

export const Card: React.FC<Props> = ({ children, style, noPadding }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        noPadding && { padding: 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
});
