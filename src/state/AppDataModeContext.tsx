import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applySimulationScenario, createSimulationHistory, createSimulatedSample, type SimulationScenario } from '@/services/sensorSimulation';
import type { SensorEvent, SensorSample } from '@/types/sensors';
import { createWatchSession, type WatchConnectionState } from '@/services/bluetoothWatch';
import type { WatchStatus } from '@/services/watchProtocol';
import { getCurrentCoordinates } from '@/services/weather';
import { authenticatedRequest } from '@/services/api';

export type AppDataMode = 'offline' | 'simulation' | 'bluetooth';
type AppDataModeContextValue = {
  mode: AppDataMode;
  setMode: (mode: AppDataMode) => void;
  scenario: SimulationScenario;
  setScenario: (scenario: SimulationScenario) => void;
  samples: SensorSample[];
  latest: SensorSample | null;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  bluetoothConnected: boolean;
  setBluetoothConnected: (connected: boolean) => void;
  publishBluetoothSample: (sample: SensorSample) => void;
  bluetoothState: WatchConnectionState;
  bluetoothDetail: string;
  bluetoothDeviceId: string | null;
  watchStatus: WatchStatus | null;
  watchEvents: SensorEvent[];
  retryBluetooth: () => void;
};

const STORAGE_KEY = 'swasthai.dataMode';
const MAX_HISTORY = 3600;
const AppDataModeContext = createContext<AppDataModeContextValue | null>(null);

export const AppDataModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setModeState] = useState<AppDataMode>('offline');
  const [scenario, setScenario] = useState<SimulationScenario>('normal');
  const [samples, setSamples] = useState<SensorSample[]>([]);
  const [paused, setPaused] = useState(false);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothState, setBluetoothState] = useState<WatchConnectionState>('off');
  const [bluetoothDetail, setBluetoothDetail] = useState('Bluetooth mode is off.');
  const [bluetoothDeviceId, setBluetoothDeviceId] = useState<string | null>(null);
  const [watchStatus, setWatchStatus] = useState<WatchStatus | null>(null);
  const watchStatusRef = useRef<WatchStatus | null>(null);
  const [watchEvents, setWatchEvents] = useState<SensorEvent[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const watchSession = useRef<ReturnType<typeof createWatchSession> | null>(null);
  const handledEmergencyEvents = useRef(new Set<string>());
  const estimatedStepCount = useRef(0);
  const stepRemainder = useRef(0);
  const lastWearableSampleAt = useRef<number | null>(null);
  const lastEstimatedTempAt = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem('watchEmergencyEvents').then((saved) => {
      if (saved) setWatchEvents(JSON.parse(saved) as SensorEvent[]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (mounted && (saved === 'offline' || saved === 'simulation' || saved === 'bluetooth')) {
        setModeState(saved);
        setSamples(saved === 'simulation' ? createSimulationHistory(58) : []);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const setMode = (nextMode: AppDataMode) => {
    setModeState(nextMode);
    setScenario('normal');
    setPaused(false);
    setBluetoothConnected(false);
    setSamples(nextMode === 'simulation' ? createSimulationHistory(58) : []);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => {});
  };

  useEffect(() => {
    if (mode !== 'simulation' || paused) return undefined;
    const timer = setInterval(() => {
      setSamples((current) => {
        const previous = current[current.length - 1];
        const generated = applySimulationScenario(createSimulatedSample(Date.now(), current.length), scenario);
        generated.steps = (previous?.steps ?? 3245) + (Math.random() < 0.2 ? 1 : 0);
        return [...current, generated].slice(-MAX_HISTORY);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, paused, scenario]);

  useEffect(() => {
    if (mode !== 'simulation' || !samples.length) return;
    setSamples((current) => {
      if (!current.length) return current;
      const updated = [...current];
      const previous = updated[updated.length - 1];
      const baseline = createSimulatedSample(Date.now(), current.length);
      baseline.steps = previous.steps;
      updated[updated.length - 1] = applySimulationScenario(baseline, scenario);
      return updated;
    });
  }, [mode, scenario]);

  useEffect(() => {
    if (mode !== 'bluetooth') {
      watchSession.current?.stop();
      watchSession.current = null;
      setBluetoothConnected(false);
      setBluetoothDeviceId(null);
      setWatchStatus(null);
      watchStatusRef.current = null;
      setBluetoothState('off');
      setBluetoothDetail('Bluetooth mode is off.');
      return undefined;
    }

    setSamples([]);
    estimatedStepCount.current = 0;
    stepRemainder.current = 0;
    lastWearableSampleAt.current = null;
    lastEstimatedTempAt.current = 0;
    setWatchStatus(null);
    watchStatusRef.current = null;
    setBluetoothConnected(false);
    const session = createWatchSession({
      onState: (state, detail) => {
        setBluetoothState(state);
        if (detail) setBluetoothDetail(detail);
        if (state === 'disconnected' || state === 'off' || state === 'error') {
          setBluetoothConnected(false);
          watchStatusRef.current = null;
          setWatchStatus(null);
          setSamples((current) => {
            const previous = current[current.length - 1];
            if (!previous || (previous.heartRate == null && previous.spo2 == null && previous.ambientTemperature == null)) return current;
            const unavailable: SensorSample = {
              ...previous,
              timestamp: Date.now(),
              heartRate: null,
              spo2: null,
              ambientTemperature: null,
              humidity: null,
              pressure: null,
              gasResistance: null,
              heartRateAgeSeconds: null,
              spo2AgeSeconds: null,
              heartRateFreshness: 'unavailable',
              spo2Freshness: 'unavailable',
              riskLevel: 'no_data',
              monitoringConfidence: 0,
            };
            return [...current, unavailable].slice(-MAX_HISTORY);
          });
        }
      },
      onSample: (sample) => {
        setBluetoothConnected(true);
        setSamples((current) => {
          const previous = current[current.length - 1];
          const previousAt = lastWearableSampleAt.current;
          const elapsed = previousAt == null ? 0 : Math.min(Math.max((sample.timestamp - previousAt) / 1000, 0), 3);
          lastWearableSampleAt.current = sample.timestamp;
          if (sample.activityState === 'walk' || sample.activityState === 'active') {
            const cadence = sample.activityState === 'walk' ? 1.8 : 2.3;
            const accumulated = stepRemainder.current + elapsed * cadence;
            estimatedStepCount.current += Math.floor(accumulated);
            stepRemainder.current = accumulated % 1;
          }
          const shouldRefreshEstimatedTemp = sample.timestamp - lastEstimatedTempAt.current >= 60_000;
          const estimatedSkinTemperatureF = sample.surfaceTemperature != null
            ? undefined
            : shouldRefreshEstimatedTemp || previous?.estimatedSkinTemperatureF == null
              ? Math.round((94 + Math.random() * 4) * 10) / 10
              : previous.estimatedSkinTemperatureF;
          if (sample.surfaceTemperature == null && (shouldRefreshEstimatedTemp || lastEstimatedTempAt.current === 0)) {
            lastEstimatedTempAt.current = sample.timestamp;
          }
          const merged = {
            ...sample,
            steps: sample.steps ?? estimatedStepCount.current,
            estimatedSkinTemperatureF,
            ...(watchStatusRef.current ?? {}),
          };
          return [...current, merged].slice(-MAX_HISTORY);
        });
      },
      onStatus: (status) => {
        watchStatusRef.current = status;
        setWatchStatus(status);
        setSamples((current) => {
          if (!current.length) return current;
          const updated = [...current];
          updated[updated.length - 1] = { ...updated[updated.length - 1], ...status };
          return updated;
        });
      },
      onPeripheral: (id) => setBluetoothDeviceId(id),
      onEvent: async (event, receivedAt) => {
        const saved: SensorEvent = {
          id: `${receivedAt}-${event}`,
          timestamp: receivedAt,
          event,
          detail: event === 'MANUAL_SOS' ? 'Manual SOS received from the watch.'
            : event === 'FALL_CONFIRMED' ? 'Fall emergency received from the watch.'
              : event === 'SOS_CANCELLED' || event === 'FALL_CANCELLED' ? 'Emergency cancellation received from the watch.'
                : `Watch event: ${event}`,
        };
        setWatchEvents((current) => [saved, ...current].slice(0, 50));
        const previous = await AsyncStorage.getItem('watchEmergencyEvents');
        const history = previous ? JSON.parse(previous) as SensorEvent[] : [];
        await AsyncStorage.setItem('watchEmergencyEvents', JSON.stringify([saved, ...history].slice(0, 100)));

        if (event === 'MANUAL_SOS' || event === 'FALL_CONFIRMED') {
          const dedupeKey = event;
          if (!handledEmergencyEvents.current.has(dedupeKey)) {
            handledEmergencyEvents.current.add(dedupeKey);
            void sendWatchEmergency(event);
          }
        }
        if (event.endsWith('CANCELLED')) handledEmergencyEvents.current.clear();
      },
    });
    watchSession.current = session;
    void session.start();
    return () => {
      session.stop();
      if (watchSession.current === session) watchSession.current = null;
    };
  }, [mode, retryKey]);

  const publishBluetoothSample = (sample: SensorSample) => {
    if (mode !== 'bluetooth') return;
    setBluetoothConnected(true);
    setSamples((current) => [...current, sample].slice(-MAX_HISTORY));
  };

  const retryBluetooth = () => setRetryKey((current) => current + 1);

  const value = useMemo(() => ({
    mode, setMode, scenario, setScenario, samples, latest: samples[samples.length - 1] ?? null,
    paused, setPaused, bluetoothConnected, setBluetoothConnected, publishBluetoothSample,
    bluetoothState, bluetoothDetail, bluetoothDeviceId, watchStatus, watchEvents, retryBluetooth,
  }), [mode, scenario, samples, paused, bluetoothConnected, bluetoothState, bluetoothDetail, bluetoothDeviceId, watchStatus, watchEvents]);

  return <AppDataModeContext.Provider value={value}>{children}</AppDataModeContext.Provider>;
};

export function useAppDataMode(): AppDataModeContextValue {
  const value = useContext(AppDataModeContext);
  if (!value) throw new Error('useAppDataMode must be used within AppDataModeProvider');
  return value;
}

async function sendWatchEmergency(event: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    let coordinates: Awaited<ReturnType<typeof getCurrentCoordinates>> = null;
    try { coordinates = await getCurrentCoordinates(); } catch { /* A denied GPS must not block the SOS. */ }
    await authenticatedRequest('/sos', {
      eventType: event === 'FALL_CONFIRMED' ? 'fall' : 'manual_sos',
      ...(coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : {}),
      note: `Emergency event received from SwasthAI-Watch: ${event}`,
    }, token);
  } catch {
    // The event has already been saved locally; cloud contact delivery can be unavailable offline.
  }
}
