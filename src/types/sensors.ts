export type SensorMetricKey =
  | 'heartRate'
  | 'spo2'
  | 'surfaceTemperature'
  | 'ambientTemperature'
  | 'humidity'
  | 'pressure'
  | 'acceleration'
  | 'gyroscope';

export type SensorSample = {
  timestamp: number;
  heartRate: number | null;
  spo2: number | null;
  surfaceTemperature: number | null;
  ambientTemperature: number | null;
  humidity: number | null;
  pressure: number | null;
  acceleration: number | null;
  gyroscope: number | null;
  steps: number | null;
  /** UI-only estimate when the watch firmware does not transmit skin temperature. */
  estimatedSkinTemperatureF?: number;
  /** Wearable diagnostic fields are present only for real ESP32 samples. */
  heartRateQuality?: number;
  spo2Quality?: number;
  ppgQuality?: number;
  heartRateAgeSeconds?: number | null;
  spo2AgeSeconds?: number | null;
  heartRateFreshness?: 'fresh' | 'retained' | 'unavailable';
  spo2Freshness?: 'fresh' | 'retained' | 'unavailable';
  activityState?: 'rest' | 'walk' | 'active' | 'unknown';
  motionLevel?: number;
  sensorFlags?: number;
  riskLevel?: 'no_data' | 'normal' | 'observe' | 'caution' | 'high' | 'emergency';
  monitoringConfidence?: number;
  anomalyScore?: number;
  heatRisk?: number;
  warningCode?: number;
  gasResistance?: number | null;
};

export type SensorSource = 'simulation' | 'esp32';

export type SensorEvent = {
  id: string;
  timestamp: number;
  event: string;
  detail: string;
};
