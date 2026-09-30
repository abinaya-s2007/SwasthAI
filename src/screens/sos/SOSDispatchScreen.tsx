import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Share, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { authenticatedRequest } from '@/services/api';
import { getCurrentCoordinates } from '@/services/weather';
import { readEmergencyContacts } from '@/services/emergencyContacts';
import type { EmergencyContact } from '@/types';

type SOSState = 'preparing' | 'ready' | 'error';
type NotificationAttempt = { contactId: string; contactName: string; channel: 'sms' | 'whatsapp'; status: 'queued' | 'failed' | 'not_configured'; error?: string };
type SOSResponse = { event: { id: string }; notifications: NotificationAttempt[]; message: string };

export const SOSDispatchScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();
  const [status, setStatus] = useState<SOSState>('preparing');
  const [message, setMessage] = useState('');
  const [locationLabel, setLocationLabel] = useState('Getting your current location…');
  const [eventSaved, setEventSaved] = useState(false);
  const [deliveryLabel, setDeliveryLabel] = useState('Waiting for the notification service');
  const started = useRef(false);

  const sendSOS = async () => {
    setStatus('preparing');
    setMessage('');
    setEventSaved(false);
    setDeliveryLabel('Waiting for the notification service');
    let coordinates = null as Awaited<ReturnType<typeof getCurrentCoordinates>>;
    let gpsIssue = 'Location permission was not granted.';
    try {
      coordinates = await getCurrentCoordinates();
    } catch (error) {
      gpsIssue = error instanceof Error ? error.message : 'The phone could not read its location.';
    }

    const mapLink = coordinates
      ? `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`
      : null;
    setLocationLabel(mapLink ? 'Current GPS location added' : `GPS unavailable: ${gpsIssue}`);
    const contacts = await readEmergencyContacts();
    const token = await AsyncStorage.getItem('authToken');
    const sosMessage = [
      'SOS: I need help. Please contact me or emergency services.',
      mapLink ? `My current location: ${mapLink}` : 'My phone could not provide a GPS location.',
    ].join('\n');
    let attempts: NotificationAttempt[] = [];
    let serverAccepted = false;

    if (token) {
      try {
        const result = await authenticatedRequest<SOSResponse>('/sos', {
          ...(coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : {}),
          eventType: 'manual_sos',
          note: contacts.length ? 'Manual SOS triggered from the mobile app.' : 'Manual SOS triggered; no emergency contact is saved.',
        }, token);
        setEventSaved(!!result.event?.id);
        serverAccepted = true;
        attempts = result.notifications ?? [];
      } catch {
        // The phone-based fallback below still works when the API is unreachable.
      }
    }

    try {
      await AsyncStorage.setItem('lastSOS', JSON.stringify({
        coordinates, recipient: contacts[0]?.name ?? null, message: sosMessage, createdAt: new Date().toISOString(),
      }));

      const queued = attempts.filter((attempt) => attempt.status === 'queued');
      if (queued.length > 0) {
        const names = queued.map((attempt) => `${attempt.contactName} (${attempt.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'})`).join(', ');
        setDeliveryLabel(`Provider accepted alert for ${names}`);
        setMessage('Your emergency alert was handed to the messaging provider. This confirms acceptance only; it does not confirm delivery.');
        setStatus('ready');
        return;
      }

      const recipient = contacts.find((contact) => contact.phone);
      if (recipient?.phone) {
        setDeliveryLabel(serverAccepted ? 'Automatic delivery unavailable; opening your messaging app' : 'Backend unavailable; opening your messaging app');
        await openManualMessage(recipient, sosMessage);
        setMessage(`Review the SOS message for ${recipient.name} and tap Send. Automatic delivery is not configured or could not be reached.`);
      } else {
        setDeliveryLabel('No emergency contact is saved');
        await Share.share({ title: 'Share SOS', message: sosMessage });
        setMessage('No emergency contact is saved. Choose a person or app from the share sheet and tap Send.');
      }
      setStatus('ready');
    } catch {
      setMessage('Could not open the message or sharing app. Check that a messaging app is installed and try again.');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void sendSOS();
  }, []);

  return (
    <Screen>
      <View style={styles.center}>
        {status === 'preparing' ? <ActivityIndicator size="large" color={colors.primary} /> : null}
        <Text style={[styles.title, { color: colors.text }]}>
          {status === 'preparing' ? 'Preparing SOS alert…' : status === 'ready' ? 'SOS alert prepared' : 'Could not open sharing'}
        </Text>
        <Text style={{ color: status === 'error' ? colors.danger : colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 19 }}>
          {message || (status === 'ready' ? deliveryLabel : locationLabel)}
        </Text>
      </View>
      <Card>
        <Item label={locationLabel} done={locationLabel === 'Current GPS location added'} />
        <Item label={eventSaved ? 'SOS event saved to your account' : 'SOS event could not be confirmed by the backend'} done={eventSaved} />
        <Item label={deliveryLabel} done={deliveryLabel.startsWith('Provider accepted')} />
        <Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 }}>
          A queued alert means the provider accepted it, not that the contact received it. If automatic delivery is unavailable, review the message and tap Send in your messaging app.
        </Text>
      </Card>
      {status === 'error' ? <Button label="Try sharing again" onPress={() => void sendSOS()} style={{ marginTop: 16 }} /> : null}
      <Button label="Return to app" variant="secondary" onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 12 }} />
    </Screen>
  );
};

async function openManualMessage(contact: EmergencyContact, body: string): Promise<void> {
  if (contact.deliveryChannel === 'whatsapp') {
    const digits = contact.phone.replace(/\D/g, '');
    try {
      await Linking.openURL(`whatsapp://send?phone=${digits}&text=${encodeURIComponent(body)}`);
      return;
    } catch {
      // WhatsApp may not be installed; fall back to SMS.
    }
  }
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const phoneNumber = contact.phone.replace(/[^\d+]/g, '');
  try {
    await Linking.openURL(`sms:${phoneNumber}${separator}body=${encodeURIComponent(body)}`);
  } catch {
    await Share.share({ title: 'Send SOS', message: `${body}\nEmergency contact: ${contact.name} ${contact.phone}` });
  }
}

const Item: React.FC<{ label: string; done: boolean }> = ({ label, done }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.itemRow}>
      <Ionicons name={done ? 'checkmark-circle' : 'information-circle-outline'} size={18} color={done ? colors.success : colors.warning} />
      <Text style={{ color: colors.text, marginLeft: 8, flex: 1, fontSize: 13 }}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 32 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 24, marginTop: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
});
