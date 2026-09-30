import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

export const SOSConfirmationScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();

  return (
    <Screen>
      <View style={styles.center}>
        <TouchableOpacity
          onPress={() => navigation.navigate('SOSCountdown')}
          style={[styles.sosCircle, { backgroundColor: colors.danger }]}
          activeOpacity={0.8}
        >
          <Ionicons name="alert" size={40} color="#FFFFFF" />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>

        <Text style={[styles.question, { color: colors.text }]}>Are you in an emergency?</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 }}>
          We’ll request your current location and try to alert your saved emergency contacts. If automatic delivery is not set up, the app will open a message for you to review and send.
        </Text>
      </View>

      <Button label="Yes, Send SOS" variant="danger" onPress={() => navigation.navigate('SOSCountdown')} />
      <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 40 },
  sosCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  sosText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  question: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
