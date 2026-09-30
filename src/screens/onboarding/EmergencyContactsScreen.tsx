import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { StepNavButtons } from '@/components/StepNavButtons';
import { useTheme } from '@/theme/ThemeContext';
import { useOnboarding } from './OnboardingContext';
import { isValidPhone } from '@/utils/validation';
import { addEmergencyContact, removeEmergencyContact } from '@/services/emergencyContacts';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbEmergencyContacts'>;

export const EmergencyContactsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [error, setError] = useState('');

  const addContact = async () => {
    if (name.trim().length < 2) return setError('Enter the contact’s name.');
    if (!isValidPhone(phone)) return setError('Enter a valid phone number.');
    setError('');
    let added;
    try {
      added = await addEmergencyContact({ id: String(Date.now()), name: name.trim(), relation: relation.trim() || 'Emergency contact', phone: phone.trim(), deliveryChannel });
    } catch {
      return setError('Could not save this emergency contact. Try again.');
    }
    const contacts = [...data.emergencyContacts, added];
    update({ emergencyContacts: contacts });
    if (!added.serverSynced) setError('Saved on this phone only. Automatic alerts need the backend connection; it will retry syncing later.');
    setName('');
    setRelation('');
    setPhone('');
    setDeliveryChannel('sms');
  };

  return (
    <Screen>
      <StepProgress step={6} total={9} label="Emergency Contacts" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16 }}>Optional. Continue without adding an emergency contact if you prefer.</Text>

      {data.emergencyContacts.map((c) => (
        <Card key={c.id}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{c.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{c.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {c.relation} · {c.phone}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                void removeEmergencyContact(c).then(() => update({ emergencyContacts: data.emergencyContacts.filter((x) => x.id !== c.id) }))
                  .catch(() => setError('Could not remove this server-saved contact. Check your connection and retry.'));
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <Input label="Name" placeholder="Contact name" value={name} onChangeText={setName} />
      <Input label="Relation" placeholder="Daughter, Son, Friend…" value={relation} onChangeText={setRelation} />
      <Input label="Phone" placeholder="+91 00000 00000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <View style={styles.channelRow}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginRight: 8 }}>Emergency alert by</Text>
        {(['sms', 'whatsapp'] as const).map((channel) => (
          <TouchableOpacity key={channel} onPress={() => setDeliveryChannel(channel)} style={[styles.channelButton, { borderColor: deliveryChannel === channel ? colors.primary : colors.border, backgroundColor: deliveryChannel === channel ? colors.primary + '18' : 'transparent' }]}>
            <Text style={{ color: deliveryChannel === channel ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 11 }}>{channel === 'sms' ? 'SMS' : 'WhatsApp'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}

      <TouchableOpacity onPress={addContact} style={[styles.addRow, { borderColor: colors.primary }]}>
        <Ionicons name="add-circle" size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 6 }}>Add Contact</Text>
      </TouchableOpacity>

      <StepNavButtons onBack={() => navigation.goBack()} onNext={() => navigation.navigate('OnbConsent')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  channelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  channelButton: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderRadius: 18, marginRight: 7 },
});
