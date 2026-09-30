import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

export const SOSSentScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();

  return (
    <Screen>
      <View style={styles.center}>
        <View style={[styles.circle, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={44} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>SOS Message Prepared</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          Review the message in your messaging app and tap Send. If no contact was saved, use the share sheet to choose someone. Call local emergency services directly if you need immediate help.
        </Text>
      </View>

      <Button label="Return to app" onPress={() => navigation.navigate('MainTabs')} />
      <Button
        label="I'm Okay Now"
        variant="secondary"
        onPress={() => navigation.navigate('MainTabs')}
        style={{ marginTop: 10 }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 40 },
  circle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800' },
});
