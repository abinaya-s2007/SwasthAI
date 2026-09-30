import React from 'react';
import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { CheckChips } from '@/components/Selectors';
import { StepNavButtons } from '@/components/StepNavButtons';
import { useOnboarding } from './OnboardingContext';
import { ChronicCondition } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbChronicConditions'>;

const OPTIONS: ChronicCondition[] = [
  'Cardiac (Heart disease)',
  'Respiratory (Asthma, COPD)',
  'Diabetes',
  'Chronic Kidney Disease',
  'Liver Disease',
  'Neurological Disorder',
  'Bleeding Disorder',
  'Other',
];

export const ChronicConditionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();

  const toggle = (v: string) => {
    const cond = v as ChronicCondition;
    const exists = data.chronicConditions.includes(cond);
    update({
      chronicConditions: exists
        ? data.chronicConditions.filter((c) => c !== cond)
        : [...data.chronicConditions, cond],
    });
  };

  return (
    <Screen>
      <StepProgress step={2} total={9} label="Chronic Conditions" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16 }}>Optional. Choose what you’re comfortable sharing, or continue without selecting anything.</Text>
      <CheckChips options={OPTIONS} values={data.chronicConditions} onToggle={toggle} />
      <StepNavButtons
        onBack={() => navigation.goBack()}
        onNext={() => navigation.navigate('OnbMedications')}
      />
    </Screen>
  );
};
