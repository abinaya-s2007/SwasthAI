import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { GaugeChart } from '@/components/GaugeChart';
import { useTheme } from '@/theme/ThemeContext';

export const SOSCountdownScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (seconds <= 0) {
      navigation.replace('SOSDispatch');
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, navigation]);

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>Help is on the way</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 28, textAlign: 'center' }}>
          Preparing your SOS message in…
        </Text>
        <GaugeChart value={seconds} max={10} color={colors.danger} size={160} sublabel="seconds" />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
        Tap cancel if this was a mistake.
      </Text>
      <Button label="Cancel SOS" variant="secondary" onPress={() => navigation.navigate('MainTabs')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 32 },
  title: { fontSize: 20, fontWeight: '800' },
});
