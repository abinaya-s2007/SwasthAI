import { Platform } from 'react-native';

// Physical Android development phones use ADB reverse (tcp:4000 tcp:4000),
// which forwards the phone's loopback to the computer's backend. Android
// emulators use 10.0.2.2 instead. This is a development-only address.
export const API_BASE_URL = Platform.OS === 'android'
  ? 'http://127.0.0.1:4000'
  : 'http://localhost:4000';

export async function apiRequest<T>(path: string, body: unknown): Promise<T> {
  return send<T>(path, 'POST', body);
}

export async function authenticatedRequest<T>(path: string, body: unknown, token: string): Promise<T> {
  return send<T>(path, 'POST', body, token);
}

export async function authenticatedGet<T>(path: string, token: string): Promise<T> {
  return send<T>(path, 'GET', undefined, token);
}

export async function authenticatedPatch<T>(path: string, body: unknown, token: string): Promise<T> {
  return send<T>(path, 'PATCH', body, token);
}

export async function authenticatedDelete(path: string, token: string): Promise<void> {
  await send<unknown>(path, 'DELETE', undefined, token);
}

async function send<T>(path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload as T;
}
