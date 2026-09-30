import React, { useState } from 'react';
import { Text } from 'react-native';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CheckChips } from '@/components/Selectors';
import { useTheme } from '@/theme/ThemeContext';

const DATA_OPTIONS = ['Vitals', 'Risk Scores', 'Alerts', 'Activity & Sleep', 'Environment Data'];

export const ExportSummaryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [selected, setSelected] = useState<string[]>(['Vitals', 'Risk Scores']);

  const toggle = (v: string) =>
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  return (
    <Screen>
      <Header title="Export Summary" />
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Select Date Range</Text>
        <Text style={{ color: colors.text, fontWeight: '700' }}>01 Sep – 30 Sep</Text>
      </Card>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 10 }}>Include</Text>
        <CheckChips options={DATA_OPTIONS} values={selected} onToggle={toggle} />
      </Card>
      <Button label="Export as PDF" onPress={() => navigation.navigate('ShareOptions')} />
    </Screen>
  );
};
