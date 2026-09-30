import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

export const SOSInProgressScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();

  return (
    <Screen scroll={false}>
      <Header title="Help is on the way" />
      <View style={[styles.map, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Ionicons name="location" size={36} color={colors.danger} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
          SOS message status is shown in your messaging app. This screen does not track or transmit live location.
        </Text>
      </View>
      <View style={{ marginTop: 16 }}>
        <Button label="I'm Okay Now" onPress={() => navigation.navigate('MainTabs')} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
