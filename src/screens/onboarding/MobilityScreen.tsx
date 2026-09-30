import React from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { RadioGroup } from '@/components/Selectors';
import { StepNavButtons } from '@/components/StepNavButtons';
import { useTheme } from '@/theme/ThemeContext';
import { useOnboarding } from './OnboardingContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbMobility'>;

const yn = (v: boolean | null) => (v === null ? null : v ? 'Yes' : 'No');
const toBool = (v: string) => v === 'Yes';

export const MobilityScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();

  const Question = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
  }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
      <RadioGroup options={['Yes', 'No']} value={yn(value)} onChange={(v) => onChange(toBool(v))} />
    </View>
  );

  return (
    <Screen>
      <StepProgress step={5} total={9} label="Mobility & Fall History" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16 }}>Optional. You can leave every question unanswered.</Text>
      <Question
        label="Have you had any falls in the past?"
        value={data.mobility.hadFalls}
        onChange={(v) => update({ mobility: { ...data.mobility, hadFalls: v } })}
      />
      <Question
        label="Do you use a mobility aid?"
        value={data.mobility.usesAid}
        onChange={(v) => update({ mobility: { ...data.mobility, usesAid: v } })}
      />
      <Question
        label="Any gait/walking concerns?"
        value={data.mobility.gaitConcern}
        onChange={(v) => update({ mobility: { ...data.mobility, gaitConcern: v } })}
      />
      <StepNavButtons
        onBack={() => navigation.goBack()}
        onNext={() => navigation.navigate('OnbEmergencyContacts')}
      />
    </Screen>
  );
};
