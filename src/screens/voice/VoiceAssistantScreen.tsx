import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme/ThemeContext';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { mockContacts } from '@/data/mockData';

const COMMANDS = [
  { icon: 'pulse-outline' as const, label: 'Check my vitals', action: 'vitals' },
  { icon: 'shield-checkmark-outline' as const, label: 'Show risk status', action: 'risk' },
  { icon: 'call-outline' as const, label: 'Call my emergency contact', action: 'call' },
];

export const VoiceAssistantScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const runCommand = async (action: string) => {
    if (action === 'vitals') return navigation.navigate('VitalDetailHeartRate');
    if (action === 'risk') return navigation.navigate('RiskDetail');
    const phone = mockContacts[0]?.phone;
    if (!phone) return Alert.alert('No contact available', 'Add an emergency contact before placing a call.');
    const url = `tel:${phone.replace(/[^+\d]/g, '')}`;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
      else Alert.alert('Calling unavailable', 'This device cannot open the phone dialer.');
    } catch { Alert.alert('Calling unavailable', 'This device cannot open the phone dialer.'); }
  };

  return (
    <Screen>
      <Header title="Assistant" subtitle="Quick actions" />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
        Speech recognition is not available on this build. Tap an action below to continue.
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>Assistant actions</Text>
      {COMMANDS.map((command) => (
        <TouchableOpacity key={command.label} onPress={() => runCommand(command.action)} accessibilityRole="button">
          <Card>
            <View style={styles.row}>
              <Ionicons name={command.icon} size={18} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 10, fontSize: 13 }}>{command.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.arrow} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  arrow: { marginLeft: 'auto' },
});
