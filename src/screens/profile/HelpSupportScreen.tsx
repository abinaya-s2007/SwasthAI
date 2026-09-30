import React from 'react';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { ListRow, SectionTitle } from '@/components/Misc';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme/ThemeContext';

export const HelpSupportScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Screen>
      <Header title="Help & Support" />
      <SectionTitle title="Support" />
      <Card noPadding>
        <ListRow icon="help-circle-outline" label="FAQs" onPress={() => {}} />
        <ListRow icon="chatbubble-ellipses-outline" label="Contact Support" onPress={() => {}} />
        <ListRow icon="code-slash-outline" label="Open Source Licenses" onPress={() => {}} />
      </Card>
      <Card style={{ alignItems: 'center', marginTop: 12 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>App Version</Text>
        <Text style={{ color: colors.text, fontWeight: '700', marginTop: 2 }}>v1.0.0</Text>
      </Card>
    </Screen>
  );
};
