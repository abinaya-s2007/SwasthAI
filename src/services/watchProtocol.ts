import type { SensorSample } from '@/types/sensors';

export const WATCH_NAME = 'SwasthAI-Watch';
export const WATCH_SERVICE_UUID = '7b100001-6d5a-4a54-9d39-9a3e2a100001';
export const WATCH_VITALS_UUID = '7b100002-6d5a-4a54-9d39-9a3e2a100001';
export const WATCH_EVENT_UUID = '7b100003-6d5a-4a54-9d39-9a3e2a100001';
export const WATCH_STATUS_UUID = '7b100004-6d5a-4a54-9d39-9a3e2a100001';
export const WATCH_COMMAND_UUID = '7b100005-6d5a-4a54-9d39-9a3e2a100001';

export type WatchStatus = Pick<SensorSample,
  'ambientTemperature' | 'humidity' | 'pressure' | 'gasResistance' | 'riskLevel' |
  'monitoringConfidence' | 'anomalyScore' | 'heatRisk' | 'warningCode'
>;

function u16(bytes: number[], index: number): number {
  return (bytes[index] & 0xff) | ((bytes[index + 1] & 0xff) << 8);
}

function s16(bytes: number[], index: number): number {
  const value = u16(bytes, index);
  return value & 0x8000 ? value - 0x10000 : value;
}

const riskLevels: SensorSample['riskLevel'][] = ['no_data', 'normal', 'observe', 'caution', 'high', 'emergency'];
const activityStates: NonNullable<SensorSample['activityState']>[] = ['rest', 'walk', 'active', 'unknown'];

export function decodeVitalsPacket(bytes: number[], now = Date.now()): SensorSample | null {
  if (bytes.length !== 16 || bytes[0] !== 4) return null;
  const flags = u16(bytes, 14);
  const hrAge = bytes[7] === 255 ? null : bytes[7];
  const spo2Age = bytes[8] === 255 ? null : bytes[8];
  const hrState = bytes[9]; // 0 red/unavailable, 1 yellow/retained, 2 green/fresh
  const o2State = bytes[10];
  const hrAvailable = bytes[2] !== 255 && (flags & 0x0002) !== 0 && hrState !== 0 && hrAge !== null && hrAge <= 10;
  const o2Available = bytes[3] !== 255 && (flags & 0x0004) !== 0 && o2State !== 0 && spo2Age !== null && spo2Age <= 10;

  return {
    timestamp: now,
    heartRate: hrAvailable ? bytes[2] : null,
    spo2: o2Available ? bytes[3] : null,
    surfaceTemperature: null,
    ambientTemperature: null,
    humidity: null,
    pressure: null,
    acceleration: null,
    gyroscope: null,
    steps: null,
    heartRateQuality: bytes[4],
    spo2Quality: bytes[5],
    ppgQuality: bytes[6],
    heartRateAgeSeconds: hrAge,
    spo2AgeSeconds: spo2Age,
    heartRateFreshness: !hrAvailable ? 'unavailable' : hrState === 2 ? 'fresh' : 'retained',
    spo2Freshness: !o2Available ? 'unavailable' : o2State === 2 ? 'fresh' : 'retained',
    activityState: activityStates[bytes[11]] ?? 'unknown',
    motionLevel: u16(bytes, 12) / 1000,
    sensorFlags: flags,
  };
}

export function decodeStatusPacket(bytes: number[]): WatchStatus | null {
  if (bytes.length !== 18 || bytes[0] !== 4) return null;
  const temp100 = s16(bytes, 2);
  const humidity100 = u16(bytes, 4);
  const pressure10 = u16(bytes, 6);
  const gas10 = u16(bytes, 8);
  return {
    ambientTemperature: temp100 === -32768 ? null : temp100 / 100,
    humidity: humidity100 === 0xffff ? null : humidity100 / 100,
    pressure: pressure10 === 0xffff ? null : pressure10 / 10,
    gasResistance: gas10 === 0xffff ? null : gas10 / 10,
    riskLevel: riskLevels[bytes[10]] ?? 'no_data',
    monitoringConfidence: bytes[11],
    anomalyScore: bytes[12],
    heatRisk: bytes[13],
    warningCode: bytes[14],
  };
}

export function decodeEvent(bytes: number[]): string {
  return String.fromCharCode(...bytes).replace(/\0+$/, '').trim().toUpperCase();
}
