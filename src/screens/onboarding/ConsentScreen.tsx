import React from 'react';
import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { Card } from '@/components/Card';
import { ToggleRow } from '@/components/Selectors';
import { StepNavButtons } from '@/components/StepNavButtons';
import { useOnboarding } from './OnboardingContext';
import { useTheme } from '@/theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbConsent'>;

export const ConsentScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();
  const c = data.consent;

  return (
    <Screen>
      <StepProgress step={7} total={9} label="Consent & Privacy" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>Optional sharing is off by default. You can change these choices later in Privacy Settings.</Text>
      <Card>
        <ToggleRow
          label="Store vitals locally"
          description="Always on for offline safety"
          value={c.storeVitalsLocally}
          onChange={(v) => update({ consent: { ...c, storeVitalsLocally: v } })}
          icon="save-outline"
        />
        <ToggleRow
          label="Share risk status"
          description="With caregivers"
          value={c.shareRiskStatus}
          onChange={(v) => update({ consent: { ...c, shareRiskStatus: v } })}
          icon="stats-chart-outline"
        />
        <ToggleRow
          label="Share location during SOS only"
          value={c.shareLocationDuringSOS}
          onChange={(v) => update({ consent: { ...c, shareLocationDuringSOS: v } })}
          icon="location-outline"
        />
        <ToggleRow
          label="Sync anonymized data to cloud"
          value={c.syncAnonymizedData}
          onChange={(v) => update({ consent: { ...c, syncAnonymizedData: v } })}
          icon="cloud-outline"
        />
      </Card>
      <StepNavButtons onBack={() => navigation.goBack()} onNext={() => navigation.navigate('OnbDevicePairing')} />
    </Screen>
  );
};
