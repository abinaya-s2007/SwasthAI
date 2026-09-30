import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { RadioGroup, ToggleRow } from '@/components/Selectors';
import { useTheme } from '@/theme/ThemeContext';

export const AccessibilityScreen: React.FC = () => {
  const { colors } = useTheme();
  const [language, setLanguage] = useState('English');
  const [textSize, setTextSize] = useState('Medium');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceAssistant, setVoiceAssistant] = useState(true);

  return (
    <Screen>
      <Header title="Accessibility" />
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Language</Text>
        <RadioGroup options={['English', '中文', 'हिंदी']} value={language} onChange={setLanguage} />
      </Card>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Text Size</Text>
        <RadioGroup options={['Small', 'Medium', 'Large']} value={textSize} onChange={setTextSize} />
      </Card>
      <Card>
        <ToggleRow label="High Contrast Mode" value={highContrast} onChange={setHighContrast} icon="contrast-outline" />
        <ToggleRow label="Voice Assistant" value={voiceAssistant} onChange={setVoiceAssistant} icon="mic-outline" />
      </Card>
    </Screen>
  );
};
