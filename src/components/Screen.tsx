import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  edges?: Edge[];
  padded?: boolean;
};

export const Screen: React.FC<Props> = ({
  children,
  scroll = true,
  style,
  edges = ['top', 'bottom'],
  padded = true,
}) => {
  const { colors } = useTheme();
  const content = (
    <View style={[padded && styles.padded, style]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  padded: { padding: 16, paddingBottom: 32 },
});
