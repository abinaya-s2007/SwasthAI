import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { API_BASE_URL } from './api';

export type Coordinates = { latitude: number; longitude: number };
type LocationFailure = Error & { code?: number };
export type CurrentWeather = {
  location: string;
  temperature: number;
  feelsLike: number | null;
  humidity: number;
  condition: string;
  windSpeed: number | null;
  fetchedAt: string;
};

export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  if (Platform.OS === 'android') {
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    const granted = Object.values(permissions).some((status) => status === PermissionsAndroid.RESULTS.GRANTED);
    if (!granted) return null;
  } else if (Platform.OS === 'ios') {
    const authorization = await Geolocation.requestAuthorization('whenInUse');
    if (authorization !== 'granted') return null;
  }

  const readPosition = (options: NonNullable<Parameters<typeof Geolocation.getCurrentPosition>[2]>): Promise<Coordinates | null> => new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => {
        if (error.code === 1) resolve(null);
        else reject(Object.assign(new Error(error.message || 'Could not read the current location'), { code: error.code }));
      },
      options,
    );
  });

  try {
    return await readPosition({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 120000,
      showLocationDialog: true,
      forceRequestLocation: true,
    });
  } catch (primaryError) {
    // Some Android devices/emulators have a working OS location toggle but an unavailable
    // fused provider. Retry once through Android's native LocationManager in that case.
    if (Platform.OS === 'android') {
      try {
        return await readPosition({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 120000,
          showLocationDialog: true,
          forceLocationManager: true,
        });
      } catch {
        // Preserve the primary provider error: it is the most useful diagnostic.
      }
    }
    const failure = primaryError as LocationFailure;
    const reasonByCode: Record<number, string> = {
      2: 'Android could not get a location fix. Check Google Location Accuracy, then try outdoors.',
      3: 'The location request timed out. Try again outdoors or disable battery saver.',
      4: 'Google Play services location is unavailable or needs updating.',
      5: 'Android location settings do not allow a high-accuracy location fix.',
      [-1]: 'The Android location provider failed to start. Close and reopen the app, then retry.',
    };
    throw new Error(reasonByCode[failure.code ?? -99] || failure.message || 'Could not read the current location.');
  }
}

export async function fetchCurrentWeather(
  token: string,
  coordinates: Coordinates | null,
  fallbackCity: string,
): Promise<CurrentWeather> {
  const query = coordinates
    ? `lat=${coordinates.latitude}&lon=${coordinates.longitude}`
    : `city=${encodeURIComponent(fallbackCity)}`;
  const response = await fetch(`${API_BASE_URL}/weather/current?${query}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({})) as CurrentWeather & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Weather request failed (${response.status})`);
  return payload;
}
