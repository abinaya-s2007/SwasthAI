import React from 'react';
import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { Input } from '@/components/Input';
import { CheckChips } from '@/components/Selectors';
import { StepNavButtons } from '@/components/StepNavButtons';
import { useOnboarding } from './OnboardingContext';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbAllergies'>;

const COMMON = ['Dust', 'Pollen', 'Penicillin', 'Other'];

export const AllergiesScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();

  const toggle = (v: string) => {
    const exists = data.allergies.includes(v);
    update({
      allergies: exists ? data.allergies.filter((a) => a !== v) : [...data.allergies, v],
    });
  };

  return (
    <Screen>
      <StepProgress step={4} total={9} label="Allergies" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16 }}>Optional. Add only what you want us to know, or continue without it.</Text>
      <Input label="Search allergies" placeholder="Search allergies" icon="search-outline" />
      <CheckChips options={COMMON} values={data.allergies} onToggle={toggle} />
      <StepNavButtons onBack={() => navigation.goBack()} onNext={() => navigation.navigate('OnbMobility')} />
    </Screen>
  );
};
