import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionUser = {
  id?: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  sex?: string | null;
};

export type ApiUser = {
  id?: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
};

export async function saveSession(token: string, user: ApiUser, mode: 'patient' | 'caregiver' = 'patient') {
  const profile: SessionUser = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.date_of_birth,
    sex: user.sex,
  };
  await Promise.all([
    AsyncStorage.setItem('authToken', token),
    AsyncStorage.setItem('sessionUser', JSON.stringify(profile)),
    AsyncStorage.setItem('accountMode', mode),
  ]);
  return profile;
}

export async function loadSessionUser(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem('sessionUser');
  if (!raw) return null;
  try { return JSON.parse(raw) as SessionUser; } catch { return null; }
}

export async function saveSessionUser(profile: SessionUser) {
  await AsyncStorage.setItem('sessionUser', JSON.stringify(profile));
}
