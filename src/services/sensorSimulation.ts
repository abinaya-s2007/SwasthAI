import type { SensorSample } from '@/types/sensors';

export type SimulationScenario = 'normal' | 'heatStress' | 'fall';

export function applySimulationScenario(sample: SensorSample, scenario: SimulationScenario): SensorSample {
  if (scenario === 'heatStress') {
    return {
      ...sample,
      heartRate: Math.max(sample.heartRate ?? 0, 108),
      surfaceTemperature: Number(Math.max((sample.surfaceTemperature ?? 0) + 2.2, 35.4).toFixed(1)),
      ambientTemperature: Number(Math.max((sample.ambientTemperature ?? 0) + 6, 36).toFixed(1)),
      humidity: Math.max(sample.humidity ?? 0, 72),
    };
  }
  if (scenario === 'fall') {
    return {
      ...sample,
      heartRate: Math.max(sample.heartRate ?? 0, 112),
      acceleration: Number(Math.max(sample.acceleration ?? 0, 18.6).toFixed(2)),
      gyroscope: Number(Math.max(sample.gyroscope ?? 0, 3.4).toFixed(2)),
    };
  }
  return sample;
}

export function createSimulatedSample(timestamp: number, index = timestamp / 1000): SensorSample {
  const wave = (speed: number, amplitude: number, phase = 0) => Math.sin(index * speed + phase) * amplitude;
  const noise = (amplitude: number) => (Math.random() - 0.5) * amplitude;
  return {
    timestamp,
    heartRate: Math.round(73 + wave(0.83, 5) + noise(3)),
    spo2: Number((98 + wave(0.51, 0.55) + noise(0.35)).toFixed(1)),
    surfaceTemperature: Number((33.2 + wave(0.39, 0.22) + noise(0.18)).toFixed(1)),
    ambientTemperature: Number((29.5 + wave(0.28, 0.45, 1) + noise(0.24)).toFixed(1)),
    humidity: Math.round(58 + wave(0.42, 3.5) + noise(2)),
    pressure: Math.round(1007 + wave(0.31, 1.6) + noise(1)),
    acceleration: Number((9.8 + wave(1.1, 0.18) + noise(0.12)).toFixed(2)),
    gyroscope: Number((0.1 + wave(0.72, 0.09) + noise(0.04)).toFixed(2)),
    steps: 3245 + Math.floor(index * 0.02),
  };
}

export function createSimulationHistory(count: number, endTime = Date.now()): SensorSample[] {
  return Array.from({ length: count }, (_, index) => {
    const timestamp = endTime - (count - 1 - index) * 1000;
    return createSimulatedSample(timestamp, index);
  });
}
