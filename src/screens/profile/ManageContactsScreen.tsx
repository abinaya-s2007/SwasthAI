import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useTheme } from '@/theme/ThemeContext';
import { EmergencyContact } from '@/types';
import { isValidPhone } from '@/utils/validation';
import { addEmergencyContact, readEmergencyContacts, removeEmergencyContact } from '@/services/emergencyContacts';

export const ManageContactsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [error, setError] = useState('');

  useEffect(() => { void readEmergencyContacts().then(setContacts); }, []);

  const addContact = async () => {
    if (name.trim().length < 2) return setError('Enter the contact’s name.');
    if (!isValidPhone(phone)) return setError('Enter a valid phone number.');
    try {
      const added = await addEmergencyContact({ id: String(Date.now()), name: name.trim(), relation: 'Contact', phone: phone.trim(), deliveryChannel });
      setContacts((current) => [...current, added]);
      if (!added.serverSynced) setError('Saved on this phone only. Automatic alerts need the backend connection; it will retry syncing later.');
    } catch {
      setError('Could not save this contact. Try again.');
      return;
    }
    setName('');
    setPhone('');
    setDeliveryChannel('sms');
  };

  return (
    <Screen>
      <Header title="Manage Contacts" />
      {contacts.map((c) => (
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
            <TouchableOpacity onPress={() => {
              void removeEmergencyContact(c).then(() => setContacts((all) => all.filter((x) => x.id !== c.id)))
                .catch(() => setError('Could not remove this server-saved contact. Check your connection and retry.'));
            }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: c.serverSynced === false ? colors.warning : colors.textMuted, fontSize: 10, marginTop: 8 }}>
            {c.serverSynced === false ? 'Saved on this phone · automatic server delivery unavailable until synced' : `Alert by ${c.deliveryChannel ?? 'sms'}`}
          </Text>
        </Card>
      ))}
      <Input label="Name" placeholder="Contact name" value={name} onChangeText={setName} />
      <Input label="Phone" placeholder="+91 00000 00000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <View style={styles.channelRow}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginRight: 8 }}>Send SOS by</Text>
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
  },
  channelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  channelButton: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderRadius: 18, marginRight: 7 },
});
