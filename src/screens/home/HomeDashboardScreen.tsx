import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { SectionTitle, RiskBadge, StatPill } from '@/components/Misc';
import { GaugeChart } from '@/components/GaugeChart';
import { useTheme } from '@/theme/ThemeContext';
import { riskColor } from '@/theme/colors';
import { fetchCurrentWeather, getCurrentCoordinates } from '@/services/weather';
import type { Coordinates, CurrentWeather } from '@/services/weather';
import { useAppDataMode } from '@/state/AppDataModeContext';
import {
  mockUser,
  mockVitals,
  mockEnvironment,
  mockRiskScore,
  mockSleepActivity,
} from '@/data/mockData';

export const HomeDashboardScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { colors, isDark, toggle } = useTheme();
  const { mode, latest, scenario, bluetoothConnected, bluetoothDetail, watchEvents } = useAppDataMode();
  const sensorIsSelected = mode !== 'offline';
  const liveVitalsAvailable = !sensorIsSelected || !!latest;
  const heartRate = sensorIsSelected ? latest?.heartRate : mockVitals.heartRate;
  const spo2 = sensorIsSelected ? latest?.spo2 : mockVitals.spo2;
  const skinTemp = mode === 'bluetooth'
    ? latest?.surfaceTemperature == null ? latest?.estimatedSkinTemperatureF : Math.round(latest.surfaceTemperature * 9 / 5 + 32)
    : sensorIsSelected ? latest?.surfaceTemperature : mockVitals.skinTemp;
  const skinTempUnit = mode === 'bluetooth' ? '°F' : '°C';
  const steps = sensorIsSelected ? latest?.steps : mockSleepActivity.steps;
  const [stepGoal, setStepGoal] = useState(mockSleepActivity.stepGoal);
  const [goalDraft, setGoalDraft] = useState(String(mockSleepActivity.stepGoal));
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [weatherGpsError, setWeatherGpsError] = useState('');
  const [weatherUsedCityFallback, setWeatherUsedCityFallback] = useState(false);
  const stepProgress = Math.min((steps ?? 0) / stepGoal, 1);
  const stepsRemaining = Math.max(stepGoal - (steps ?? 0), 0);

  useEffect(() => {
    AsyncStorage.getItem('dailyStepGoal').then((savedGoal) => {
      const parsed = Number(savedGoal);
      if (Number.isInteger(parsed) && parsed >= 1000 && parsed <= 50000) setStepGoal(parsed);
    }).catch(() => {});
  }, []);

  const openGoalEditor = () => {
    setGoalDraft(String(stepGoal));
    setGoalError('');
    setGoalModalVisible(true);
  };

  const saveGoal = async () => {
    const nextGoal = Number(goalDraft);
    if (!Number.isInteger(nextGoal) || nextGoal < 1000 || nextGoal > 50000) {
      setGoalError('Enter a whole number from 1,000 to 50,000.');
      return;
    }
    try {
      await AsyncStorage.setItem('dailyStepGoal', String(nextGoal));
      setStepGoal(nextGoal);
      setGoalModalVisible(false);
      setGoalError('');
    } catch {
      setGoalError('Could not save your goal. Please try again.');
    }
  };

  const loadWeather = async () => {
    setWeatherLoading(true);
    setWeatherError('');
    setWeatherGpsError('');
    setCurrentWeather(null);
    setWeatherUsedCityFallback(false);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Please sign in to load current weather.');
      let coordinates: Coordinates | null = null;
      try {
        coordinates = await getCurrentCoordinates();
        if (!coordinates) setWeatherGpsError('Location permission was not granted.');
      } catch (locationError) {
        setWeatherGpsError(locationError instanceof Error ? locationError.message : 'Location could not be read.');
      }
      const city = `${mockEnvironment.location.split(',')[0].trim()},IN`;
      const result = await fetchCurrentWeather(token, coordinates, city);
      setCurrentWeather(result);
      setWeatherUsedCityFallback(!coordinates);
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Could not load weather. Try again.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const shareCurrentLocation = async () => {
    try {
      const coordinates = await getCurrentCoordinates();
      if (!coordinates) {
        Alert.alert('Location permission needed', 'Allow location access and turn on device location to share your current position.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open app settings', onPress: () => { void Linking.openSettings(); } },
        ]);
        return;
      }
      const mapLink = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
      await Share.share({ title: 'My current location', message: `My current location: ${mapLink}` });
    } catch (error) {
      Alert.alert('Could not get location', error instanceof Error ? error.message : 'Location could not be read.');
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Ionicons name="pulse" size={20} color={colors.primary} />
          <Text style={[styles.brand, { color: colors.text }]}>SwasthAI</Text>
          <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{mode === 'offline' ? 'Offline' : mode === 'simulation' ? 'Simulation' : latest ? 'Bluetooth data' : 'Bluetooth · waiting'}</Text>
        </View>
        <View style={styles.topIcons}>
          <TouchableOpacity onPress={toggle} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('VoiceAssistant')} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="mic-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>Current Vitals</Text>
      {mode === 'simulation' && scenario !== 'normal' && (
        <Card style={{ backgroundColor: colors.warning + '16' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={scenario === 'heatStress' ? 'sunny-outline' : 'warning-outline'} size={17} color={colors.warning} />
            <Text style={{ color: colors.warning, fontWeight: '800', marginLeft: 7 }}>
              {scenario === 'heatStress' ? 'Heat stress simulation' : 'Fall detection simulation'}
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 5 }}>
            {scenario === 'heatStress' ? 'Elevated demo temperature and heart-rate readings are active.' : 'Demo impact and movement readings are active. No emergency alert was sent.'}
          </Text>
        </Card>
      )}
      {mode === 'bluetooth' && watchEvents[0] && ['MANUAL_SOS', 'FALL_CONFIRMED'].includes(watchEvents[0].event) && (
        <Card style={{ backgroundColor: colors.danger + '18' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="warning" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: '800', marginLeft: 7 }}>Emergency received from watch</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 12, marginTop: 5 }}>{watchEvents[0].detail} · {new Date(watchEvents[0].timestamp).toLocaleTimeString()}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>The app saved the event and acknowledged receipt to the watch. Caregiver messaging requires internet and backend delivery setup.</Text>
        </Card>
      )}
      <Card>
        <View style={styles.vitalsRow}>
          <StatPill icon="heart" value={heartRate == null ? '—' : `${heartRate} bpm`} label="HR" color={colors.danger} />
          <StatPill icon="water" value={spo2 == null ? '—' : `${spo2}%`} label="SpO2" color={colors.info} />
          <StatPill icon="thermometer" value={skinTemp == null ? '—' : `${skinTemp}${skinTempUnit}`} label={mode === 'bluetooth' ? 'Skin Temp est.' : 'Skin Temp'} color={colors.warning} />
          <StatPill icon="walk" value={steps == null ? '—' : `${steps}`} label={mode === 'bluetooth' ? 'Steps est.' : 'Steps'} color={colors.primary} />
        </View>
        {mode === 'bluetooth' && latest && <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 8 }}>
          HR quality {latest.heartRateQuality ?? 0}% · {latest.heartRateAgeSeconds == null ? 'no HR sample' : `HR ${latest.heartRateAgeSeconds}s old`}  |  SpO₂ quality {latest.spo2Quality ?? 0}% · {latest.spo2AgeSeconds == null ? 'no SpO₂ sample' : `SpO₂ ${latest.spo2AgeSeconds}s old`}
        </Text>}
      </Card>
      {mode === 'bluetooth' && <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: -7, marginBottom: 8 }}>Skin temperature is estimated (94–98°F); steps are estimated from watch activity.</Text>}

      <TouchableOpacity onPress={() => navigation.navigate('EnvironmentPanel')}>
        <Card>
          <View style={styles.envRow}>
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>Environment</Text>
              <Text style={{ color: colors.text, fontWeight: '700', marginTop: 2 }}>{mode === 'bluetooth' ? 'Wearable sensor' : mockEnvironment.location}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {sensorIsSelected ? `${latest?.ambientTemperature ?? '—'}°C · ${latest?.humidity ?? '—'}% humidity` : `${mockEnvironment.temperature}°C · ${mockEnvironment.humidity}% humidity`}
              </Text>
            </View>
          <RiskBadge
            level={scenario === 'heatStress' && mode === 'simulation' ? 'high' : mode === 'bluetooth' ? latest?.heatRisk != null && latest.heatRisk >= 60 ? 'high' : latest?.heatRisk != null && latest.heatRisk >= 35 ? 'caution' : 'low' : mode === 'simulation' ? 'normal' : mockEnvironment.heatIndexRisk}
            label={scenario === 'heatStress' && mode === 'simulation' ? 'Heat stress simulated' : mode === 'bluetooth' ? latest?.heatRisk == null ? 'Watch heat risk unavailable' : `Watch heat risk ${latest.heatRisk}/100` : mode === 'simulation' ? 'Heat risk unavailable' : 'Heat Index High'}
          />
          </View>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('RiskDetail')}>
  <Card>
    <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 12 }}>
      Risk Score
    </Text>

    <View style={{ alignItems: 'center' }}>
      {mode === 'bluetooth' && !latest ? <Text style={{ color: colors.textMuted, fontSize: 12, paddingVertical: 22 }}>Waiting for real watch risk data</Text> : <>
        <GaugeChart
          value={mode === 'simulation' && scenario === 'heatStress' ? 68 : mode === 'simulation' && scenario === 'fall' ? 82 : mode === 'bluetooth' ? latest?.anomalyScore ?? 0 : mockRiskScore.overall}
          color={mode === 'simulation' && scenario === 'fall' ? colors.danger : mode === 'simulation' && scenario === 'heatStress' ? colors.warning : mode === 'bluetooth' && latest?.riskLevel === 'emergency' ? colors.danger : mode === 'bluetooth' && (latest?.riskLevel === 'high' || latest?.riskLevel === 'caution') ? colors.warning : riskColor(mockRiskScore.level, colors)}
          label={mode === 'simulation' && scenario === 'fall' ? 'Alert demo' : mode === 'simulation' && scenario === 'heatStress' ? 'Caution' : mode === 'bluetooth' ? (latest?.riskLevel ?? 'No data').replace('_', ' ') : 'Normal'}
        size={100}
      />

      <Text
        style={{
          color: colors.textMuted,
          fontSize: 12,
          marginTop: 12,
          textAlign: 'center',
        }}
        >
          {mode === 'simulation' && scenario !== 'normal' ? 'Scenario risk shown for demonstration' : mode === 'bluetooth' ? `Monitoring confidence ${latest?.monitoringConfidence ?? 0}% · from watch` : 'All good right now'}
      </Text>
      </>}
    </View>
  </Card>
</TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('OfflineStatus')}>
        <Card>
          <SectionTitle title="Sync Status" />
          <View style={styles.syncRow}>
            <Ionicons name={mode === 'bluetooth' && !latest ? 'bluetooth-outline' : mode === 'offline' ? 'cloud-offline-outline' : 'cloud-done-outline'} size={18} color={mode === 'bluetooth' && !latest ? colors.warning : colors.success} />
            <Text style={{ color: colors.text, marginLeft: 8, fontSize: 13 }}>{mode === 'offline' ? 'Offline demo data' : mode === 'simulation' ? 'Simulation readings updating' : latest ? 'Bluetooth readings received' : 'Waiting for Bluetooth data'}</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
            {mode === 'offline' ? 'No network or sensor connection required' : mode === 'simulation' ? 'Generated values are for demonstration' : bluetoothConnected ? 'Monitoring continues with the connected watch' : bluetoothDetail}
          </Text>
        </Card>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <QuickAction
          icon="pulse-outline"
          label="Vitals"
          onPress={() => navigation.navigate('VitalDetailHeartRate')}
        />
        <QuickAction
          icon="moon-outline"
          label="Sleep"
          onPress={() => navigation.navigate('SleepActivityDetail')}
        />
        <QuickAction
          icon="trending-up-outline"
          label="Trends"
          onPress={() => navigation.navigate('MainTabs', { screen: 'TrendsTab' })}
        />
        <QuickAction
          icon="notifications-outline"
          label="Alerts"
          onPress={() => navigation.navigate('MainTabs', { screen: 'AlertsTab' })}
        />
      </View>

      <Card style={styles.insightCard}>
        <View style={styles.insightTopRow}>
          <View style={styles.insightHeader}>
            <Ionicons name="flag-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8 }}>Today at a glance</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={openGoalEditor} hitSlop={8}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Set goal</Text>
          </Pressable>
        </View>
        <View style={styles.goalRow}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>
            {!liveVitalsAvailable ? 'Connect a band to track steps' : stepsRemaining > 0 ? `${stepsRemaining.toLocaleString()} steps to your goal` : 'Daily step goal reached!'}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{liveVitalsAvailable ? `${Math.round(stepProgress * 100)}%` : '—'}</Text>
        </View>
        <View style={[styles.goalTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.goalFill, { backgroundColor: colors.primary, width: `${stepProgress * 100}%` }]} />
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
          Sleep last night: {mode === 'offline' ? `${mockSleepActivity.sleepDuration} · ${mockSleepActivity.sleepQuality}` : 'Waiting for supported sleep sensor data'}
        </Text>
      </Card>

      <Modal visible={goalModalVisible} transparent animationType="fade" onRequestClose={() => setGoalModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.goalModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>Set your daily step goal</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>Choose a goal between 1,000 and 50,000 steps.</Text>
            <TextInput
              accessibilityLabel="Daily step goal"
              keyboardType="number-pad"
              value={goalDraft}
              onChangeText={setGoalDraft}
              selectTextOnFocus
              style={[styles.goalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
            />
            {!!goalError && <Text style={{ color: colors.danger, fontSize: 12, marginTop: 8 }}>{goalError}</Text>}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setGoalModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveGoal} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.primaryText, fontWeight: '700' }}>Save goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity accessibilityRole="button" onPress={loadWeather} disabled={weatherLoading} activeOpacity={0.8}>
        <Card>
          <View style={styles.insightTopRow}>
            <View style={styles.insightHeader}>
              <Ionicons name="cloud-outline" size={18} color={colors.info} />
              <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8 }}>A note about the weather</Text>
            </View>
            {weatherLoading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="refresh-outline" size={17} color={colors.textMuted} />}
          </View>
          {currentWeather ? (
            <>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 8 }}>
                {currentWeather.location} · {currentWeather.condition}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                {currentWeather.temperature}°C
                {currentWeather.feelsLike !== null ? ` · Feels like ${currentWeather.feelsLike}°C` : ''}
                {` · Humidity ${currentWeather.humidity}%`}
                {currentWeather.windSpeed !== null ? ` · Wind ${currentWeather.windSpeed} m/s` : ''}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6 }}>
                {weatherUsedCityFallback ? 'OpenWeather API · saved city (GPS unavailable)' : 'OpenWeather API · current GPS location'}
                {` · Updated ${new Date(currentWeather.fetchedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · tap to refresh`}
              </Text>
              {weatherUsedCityFallback && !!weatherGpsError && (
                <Text style={{ color: colors.warning, fontSize: 10, lineHeight: 15, marginTop: 4 }}>
                  GPS detail: {weatherGpsError}
                </Text>
              )}
            </>
          ) : (
            <Text style={{ color: weatherError ? colors.danger : colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
              {weatherError || (weatherLoading
                ? 'Getting your location and current conditions…'
                : mockEnvironment.heatIndexRisk === 'high'
                  ? `Heat risk is elevated for ${mockEnvironment.location}. Tap to load current weather.`
                  : `Tap to load current weather for ${mockEnvironment.location}.`)}
            </Text>
          )}
        </Card>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" onPress={shareCurrentLocation} activeOpacity={0.8}>
        <Card>
          <View style={styles.insightHeader}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8 }}>Share my current location</Text>
            <Ionicons name="share-outline" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 5 }}>Only shared when you tap and choose an app or contact.</Text>
        </Card>
      </TouchableOpacity>
    </Screen>
  );
};

const QuickAction: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickItem}>
      <View style={[styles.quickIcon, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 11, marginTop: 6, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brand: { fontSize: 16, fontWeight: '800', marginLeft: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 8 },
  topIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { marginLeft: 12 },
  vitalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  envRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  syncRow: { flexDirection: 'row', alignItems: 'center' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  quickItem: { alignItems: 'center', flex: 1 },
  quickIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  insightCard: { marginTop: 20 },
  insightHeader: { flexDirection: 'row', alignItems: 'center' },
  insightTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  goalTrack: { height: 7, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  goalFill: { height: 7, borderRadius: 4 },
  modalBackdrop: { flex: 1, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center', padding: 24 },
  goalModal: { width: '100%', maxWidth: 420, borderWidth: 1, borderRadius: 18, padding: 20 },
  goalInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginTop: 16, fontSize: 18 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  modalButton: { minHeight: 42, minWidth: 88, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
