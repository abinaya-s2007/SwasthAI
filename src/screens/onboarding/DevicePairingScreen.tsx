import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StepNavButtons } from '@/components/StepNavButtons';
import { useTheme } from '@/theme/ThemeContext';
import { useAppDataMode } from '@/state/AppDataModeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbDevicePairing'>;

export const DevicePairingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { mode, setMode, bluetoothConnected, bluetoothDetail } = useAppDataMode();

  return (
    <Screen>
      <StepProgress step={8} total={9} label="Device Pairing" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>
        Optional. Connect your SwasthAI-Watch now, or continue and connect later from Device Management.
      </Text>
      <Card>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="watch-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>SwasthAI-Watch</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{bluetoothConnected ? 'Connected · receiving real sensor data' : mode === 'bluetooth' ? bluetoothDetail : 'Not connected'}</Text>
            </View>
            <Button label={bluetoothConnected ? 'Connected' : mode === 'bluetooth' ? 'Searching' : 'Connect'} variant="outline" fullWidth={false} onPress={() => { if (!bluetoothConnected && mode !== 'bluetooth') setMode('bluetooth'); }} />
          </View>
      </Card>
      <StepNavButtons onBack={() => navigation.goBack()} onNext={() => navigation.navigate('OnbBaseline')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
