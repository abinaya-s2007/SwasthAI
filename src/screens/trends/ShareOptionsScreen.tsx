import React from 'react';
import { Alert, Linking, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { useTheme } from '@/theme/ThemeContext';
import { mockEnvironment, mockRiskScore, mockVitals } from '@/data/mockData';
import { getCurrentCoordinates } from '@/services/weather';

const OPTIONS: { icon: string; label: string; color: string }[] = [
  { icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
  { icon: 'mail', label: 'Gmail', color: '#EA4335' },
  { icon: 'bluetooth', label: 'Bluetooth', color: '#2F9BFF' },
  { icon: 'ellipsis-horizontal-circle', label: 'More', color: '#8A9A96' },
];

export const ShareOptionsScreen: React.FC = () => {
  const { colors } = useTheme();
  const share = async (target: string) => {
    try {
      await Share.share({
        title: 'SwasthAI health summary',
        message: `SwasthAI demo health summary\nHeart rate: ${mockVitals.heartRate} bpm\nSpO₂: ${mockVitals.spo2}%\nRisk score: ${mockRiskScore.overall}/100\nProfile location (not live GPS): ${mockEnvironment.location}`,
      }, { dialogTitle: `Share with ${target}` });
    } catch {
      Alert.alert('Could not share', 'Please try again.');
    }
  };
  const shareLocation = async () => {
    try {
      const coordinates = await getCurrentCoordinates();
      if (!coordinates) {
        Alert.alert('Location permission needed', 'Allow location access and turn on device location to share your current position.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open app settings', onPress: () => { void Linking.openSettings(); } },
        ]);
        return;
      }
      await Share.share({ title: 'Share current location', message: `My current location: https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}` });
    } catch {
      Alert.alert('Could not share location', 'Please try again.');
    }
  };

  return (
    <Screen>
      <Header title="Share" />
      <View style={styles.center}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="share-social" size={30} color={colors.primary} />
        </View>
      </View>
      <TouchableOpacity style={[styles.locationButton, { borderColor: colors.border }]} onPress={shareLocation} accessibilityRole="button">
        <Ionicons name="location-outline" size={18} color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 13, marginLeft: 8, fontWeight: '600' }}>Share my current GPS location</Text>
      </TouchableOpacity>
      <View style={styles.grid}>
        {OPTIONS.map((o) => (
          <TouchableOpacity key={o.label} style={styles.item} onPress={() => share(o.label)} accessibilityRole="button">
            <View style={[styles.iconCircle, { backgroundColor: o.color + '22' }]}>
              <Ionicons name={o.icon} size={22} color={o.color} />
            </View>
            <Text style={{ color: colors.text, fontSize: 12, marginTop: 6, fontWeight: '600' }}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 20 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  locationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 14, marginBottom: 20 },
  item: { alignItems: 'center', width: '25%', marginBottom: 20 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
