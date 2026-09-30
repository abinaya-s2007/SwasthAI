import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbBaseline'>;

export const BaselineLearningScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const goToApp = () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  return (
    <Screen>
      <StepProgress step={9} total={9} label="Baseline Learning" />
      <View style={styles.center}>
        <View style={[styles.circle, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="analytics-outline" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          We'll learn your normal for 5-7 days.{'\n'}Personalized risk detection sharpens as data
          comes in.
        </Text>
      </View>
      <Button label="Start Learning" onPress={goToApp} />
      <Button label="Skip" variant="ghost" onPress={goToApp} style={{ marginTop: 4 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 32 },
  circle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  text: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
