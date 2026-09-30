import { PermissionsAndroid, Platform } from 'react-native';
import BleManager, { BleState, type Peripheral } from 'react-native-ble-manager';
import type { SensorSample } from '@/types/sensors';
import { decodeEvent, decodeStatusPacket, decodeVitalsPacket, WATCH_COMMAND_UUID, WATCH_EVENT_UUID, WATCH_NAME, WATCH_SERVICE_UUID, WATCH_STATUS_UUID, WATCH_VITALS_UUID, type WatchStatus } from './watchProtocol';

export type WatchConnectionState = 'off' | 'permission' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type WatchCallbacks = {
  onState: (state: WatchConnectionState, detail?: string) => void;
  onSample: (sample: SensorSample) => void;
  onStatus: (status: WatchStatus) => void;
  onEvent: (event: string, receivedAt: number) => Promise<void> | void;
  onPeripheral?: (id: string, rssi: number) => void;
};

const emergencyEvents = new Set(['MANUAL_SOS', 'FALL_CONFIRMED']);
let managerStarted: Promise<void> | null = null;

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const version = Number(Platform.Version);
  const permissions = version >= 31
    ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const result = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every((permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED);
}

export function createWatchSession(callbacks: WatchCallbacks) {
  let stopped = false;
  let scanInProgress = false;
  let connectInProgress = false;
  let peripheralId: string | null = null;
  let lastVitalsSequence: number | null = null;
  let lastStatusSequence: number | null = null;
  let lastAcknowledgedEvent = '';
  let lastVitalsReceivedAt = 0;
  let adapterOn = true;
  let restartTimer: ReturnType<typeof setTimeout> | undefined;
  let scanTimer: ReturnType<typeof setTimeout> | undefined;
  const subscriptions: Array<{ remove: () => void }> = [];

  const scheduleScan = (delay = 1200) => {
    if (stopped || restartTimer) return;
    restartTimer = setTimeout(() => {
      restartTimer = undefined;
      void scan();
    }, delay);
  };

  const onNotification = async (event: { peripheral: string; characteristic: string; value: number[] }) => {
    if (event.peripheral !== peripheralId) return;
    const characteristic = event.characteristic.toLowerCase();
    if (characteristic === WATCH_VITALS_UUID) {
      const sample = decodeVitalsPacket(event.value);
      if (!sample) return;
      const sequence = event.value[1];
      if (sequence === lastVitalsSequence) return;
      lastVitalsSequence = sequence;
      lastVitalsReceivedAt = Date.now();
      callbacks.onSample(sample);
      return;
    }
    if (characteristic === WATCH_STATUS_UUID) {
      const status = decodeStatusPacket(event.value);
      if (!status) return;
      const sequence = event.value[1];
      if (sequence === lastStatusSequence) return;
      lastStatusSequence = sequence;
      callbacks.onStatus(status);
      return;
    }
    if (characteristic !== WATCH_EVENT_UUID) return;

    const value = decodeEvent(event.value);
    if (!value) return;
    const receivedAt = Date.now();
    if (value !== lastAcknowledgedEvent) {
      lastAcknowledgedEvent = value;
      await callbacks.onEvent(value, receivedAt);
    }
    // The firmware's ACK means "phone received", not "cancel SOS".
    if (emergencyEvents.has(value) && peripheralId) {
      try {
        await BleManager.write(peripheralId, WATCH_SERVICE_UUID, WATCH_COMMAND_UUID, [65, 67, 75]);
      } catch {
        // The watch retries the pending event when the link is restored.
      }
    }
    if (value.endsWith('CANCELLED')) lastAcknowledgedEvent = '';
  };

  subscriptions.push(BleManager.onDiscoverPeripheral((peripheral: Peripheral) => {
    if (stopped || !scanInProgress || connectInProgress) return;
    const advertisedName = peripheral.advertising?.localName || peripheral.name;
    if (advertisedName !== WATCH_NAME) return;
    connectInProgress = true;
    peripheralId = peripheral.id;
    callbacks.onState('connecting', `Connecting to ${WATCH_NAME}…`);
    void (async () => {
      try {
        await BleManager.stopScan();
        await BleManager.connect(peripheral.id);
        if (stopped) return;
        await BleManager.retrieveServices(peripheral.id, [WATCH_SERVICE_UUID]);
        await BleManager.startNotification(peripheral.id, WATCH_SERVICE_UUID, WATCH_VITALS_UUID);
        await BleManager.startNotification(peripheral.id, WATCH_SERVICE_UUID, WATCH_STATUS_UUID);
        await BleManager.startNotification(peripheral.id, WATCH_SERVICE_UUID, WATCH_EVENT_UUID);
        if (stopped) return;
        callbacks.onPeripheral?.(peripheral.id, peripheral.rssi);
        callbacks.onState('connected', `Connected to ${WATCH_NAME}`);
        scanInProgress = false;
        connectInProgress = false;
        if (!stopped) {
          try {
            const vitals = await BleManager.read(peripheral.id, WATCH_SERVICE_UUID, WATCH_VITALS_UUID);
            const sample = decodeVitalsPacket(vitals);
            if (sample) callbacks.onSample(sample);
          } catch { /* Notifications provide the next live packet. */ }
          try {
            const status = await BleManager.read(peripheral.id, WATCH_SERVICE_UUID, WATCH_STATUS_UUID);
            const decoded = decodeStatusPacket(status);
            if (decoded) callbacks.onStatus(decoded);
          } catch { /* Status is also sent in periodic notifications. */ }
        }
      } catch (error) {
        peripheralId = null;
        connectInProgress = false;
        callbacks.onState('error', error instanceof Error ? error.message : 'Could not connect to the watch.');
        scheduleScan(2500);
      }
    })();
  }));

  subscriptions.push(BleManager.onDidUpdateValueForCharacteristic((event) => { void onNotification(event); }));
  subscriptions.push(BleManager.onDisconnectPeripheral((event) => {
    if (event.peripheral !== peripheralId || stopped) return;
    peripheralId = null;
    connectInProgress = false;
    scanInProgress = false;
    callbacks.onState('disconnected', 'Watch disconnected. Reconnecting…');
    scheduleScan(1800);
  }));
  subscriptions.push(BleManager.onStopScan(() => {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = undefined;
    scanInProgress = false;
    if (!stopped && !peripheralId && !connectInProgress) {
      callbacks.onState('disconnected', 'Watch not found yet. Searching again…');
      scheduleScan(1800);
    }
  }));
  subscriptions.push(BleManager.onDidUpdateState(({ state }) => {
    adapterOn = state === BleState.On;
    if (!adapterOn && !stopped) {
      if (restartTimer) clearTimeout(restartTimer);
      restartTimer = undefined;
      callbacks.onState('off', 'Turn on Bluetooth to connect to the watch.');
    }
    if (adapterOn && !stopped && !peripheralId && !scanInProgress && !connectInProgress) scheduleScan();
  }));

  const freshnessTimer = setInterval(() => {
    if (!stopped && peripheralId && lastVitalsReceivedAt && Date.now() - lastVitalsReceivedAt > 5000) {
      const id = peripheralId;
      lastVitalsReceivedAt = Date.now();
      callbacks.onState('disconnected', 'The watch stopped sending readings. Reconnecting…');
      void BleManager.disconnect(id).catch(() => {});
    }
  }, 1500);

  const scan = async () => {
    if (stopped || scanInProgress || connectInProgress || peripheralId) return;
    try {
      adapterOn = (await BleManager.checkState()) === BleState.On;
      if (!adapterOn) {
        callbacks.onState('off', 'Turn on Bluetooth to connect to the watch.');
        return;
      }
      callbacks.onState('scanning', `Searching for ${WATCH_NAME}…`);
      scanInProgress = true;
      await BleManager.scan({ serviceUUIDs: [WATCH_SERVICE_UUID], seconds: 10, allowDuplicates: false });
      scanTimer = setTimeout(() => {
        if (scanInProgress && !stopped) void BleManager.stopScan();
      }, 10_500);
    } catch (error) {
      scanInProgress = false;
      callbacks.onState('error', error instanceof Error ? error.message : 'Bluetooth scan failed.');
      scheduleScan(3000);
    }
  };

  const start = async () => {
    callbacks.onState('permission', 'Checking Bluetooth permission…');
    try {
      if (!(await requestBlePermissions())) {
        callbacks.onState('error', 'Bluetooth permission is needed to find the watch.');
        return;
      }
      if (!managerStarted) {
        managerStarted = BleManager.start({ showAlert: false }).catch((error) => {
          managerStarted = null;
          throw error;
        });
      }
      await managerStarted;
      const state = await BleManager.checkState();
      if (state !== BleState.On) {
        callbacks.onState('off', 'Turn on Bluetooth to connect to the watch.');
        return;
      }
      await scan();
    } catch (error) {
      callbacks.onState('error', error instanceof Error ? error.message : 'Could not start Bluetooth.');
    }
  };

  const stop = () => {
    stopped = true;
    clearInterval(freshnessTimer);
    if (restartTimer) clearTimeout(restartTimer);
    if (scanTimer) clearTimeout(scanTimer);
    void BleManager.stopScan();
    if (peripheralId) void BleManager.disconnect(peripheralId).catch(() => {});
    subscriptions.forEach((subscription) => subscription.remove());
  };

  return { start, scan, stop };
}
