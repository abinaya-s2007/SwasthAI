import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EmergencyContact } from '@/types';
import { authenticatedDelete, authenticatedGet, authenticatedRequest } from '@/services/api';

const KEY = 'emergencyContacts';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type ContactInput = Omit<EmergencyContact, 'serverSynced'>;

async function localContacts(): Promise<EmergencyContact[]> {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    const parsed = saved ? JSON.parse(saved) as unknown : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is EmergencyContact =>
      !!item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.phone === 'string',
    );
  } catch {
    return [];
  }
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(contacts));
}

export async function readEmergencyContacts(): Promise<EmergencyContact[]> {
  const cached = await localContacts();
  const token = await AsyncStorage.getItem('authToken');
  if (!token) return cached;
  try {
    const remote = await authenticatedGet<Array<EmergencyContact & { deliveryChannel?: 'sms' | 'whatsapp' }>>('/profile/contacts', token);
    const merged = [...remote.map((item) => ({ ...item, deliveryChannel: item.deliveryChannel ?? 'sms' as const, serverSynced: true }))];
    const remotePhones = new Set(remote.map((item) => item.phone.replace(/\D/g, '')));
    const pending = cached.filter((item) => !item.serverSynced && !remotePhones.has(item.phone.replace(/\D/g, '')));
    for (const item of pending) {
      try {
        const synced = await authenticatedRequest<EmergencyContact>('/profile/contacts', {
          name: item.name, relation: item.relation || 'Emergency contact', phone: item.phone,
          deliveryChannel: item.deliveryChannel ?? 'sms',
        }, token);
        merged.push({ ...synced, deliveryChannel: synced.deliveryChannel ?? item.deliveryChannel ?? 'sms', serverSynced: true });
      } catch {
        merged.push(item);
      }
    }
    await saveEmergencyContacts(merged);
    return merged;
  } catch {
    return cached;
  }
}

export async function addEmergencyContact(contact: ContactInput): Promise<EmergencyContact> {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    try {
      const saved = await authenticatedRequest<EmergencyContact>('/profile/contacts', {
        name: contact.name, relation: contact.relation || 'Emergency contact', phone: contact.phone,
        deliveryChannel: contact.deliveryChannel ?? 'sms',
      }, token);
      const result = { ...saved, deliveryChannel: saved.deliveryChannel ?? contact.deliveryChannel ?? 'sms', serverSynced: true };
      await saveEmergencyContacts([...await localContacts(), result]);
      return result;
    } catch {
      // Keep the contact on this device for a manual SOS fallback; it will be synced later.
    }
  }
  const local = { ...contact, serverSynced: false };
  await saveEmergencyContacts([...await localContacts(), local]);
  return local;
}

export async function removeEmergencyContact(contact: EmergencyContact): Promise<void> {
  const token = await AsyncStorage.getItem('authToken');
  if (token && UUID.test(contact.id)) {
    await authenticatedDelete(`/profile/contacts/${contact.id}`, token);
  }
  await saveEmergencyContacts((await localContacts()).filter((item) => item.id !== contact.id));
}
