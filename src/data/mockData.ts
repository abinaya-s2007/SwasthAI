import {
  AlertItem,
  EmergencyContact,
  EnvironmentData,
  RiskScore,
  TrendPoint,
  Vitals,
} from '@/types';

export const mockUser = {
  name: 'Anita S',
  phone: '+91 98765 43210',
  memberSince: 'Jan 2080',
};

export const mockVitals: Vitals = {
  heartRate: 72,
  spo2: 98,
  skinTemp: 36.5,
  steps: 3245,
};

export const mockEnvironment: EnvironmentData = {
  location: 'Chennai, Tamil Nadu',
  temperature: 28,
  humidity: 60,
  heatIndex: 28,
  wbgt: 85,
  heatIndexRisk: 'high',
};

export const mockRiskScore: RiskScore = {
  overall: 25,
  level: 'normal',
  confidence: 85,
  subScores: [
    { label: 'Cardiac', value: 20, level: 'normal' },
    { label: 'Heat', value: 30, level: 'caution' },
    { label: 'Dehydration', value: 25, level: 'normal' },
    { label: 'Respiratory', value: 15, level: 'normal' },
    { label: 'Fatigue', value: 35, level: 'caution' },
  ],
};

export const mockHeatRisk = { overall: 30, level: 'caution' as const };

export const mockTopFactors = [
  { label: 'Higher than normal temperature', weight: 40 },
  { label: 'Low hydration', weight: 25 },
  { label: 'Increased activity', weight: 15 },
];

export const mockAlerts: AlertItem[] = [
  {
    id: 'a1',
    title: 'High Risk Detected',
    severity: 'High',
    timestamp: '10:12 AM',
    description: 'Heart rate elevated beyond your normal baseline range for a sustained period.',
    whatToDo: ['Rest and avoid exertion', 'Take deep breaths', 'If it persists, contact a doctor'],
  },
  {
    id: 'a2',
    title: 'Low SpO2 Alert',
    severity: 'High',
    timestamp: 'Yesterday, 4:45 PM',
    description: 'SpO2 dropped to 90%, below your safe threshold.',
    whatToDo: ['Rest and hydrate', 'Sit upright', 'Contact a doctor if it does not recover'],
  },
  {
    id: 'a3',
    title: 'Heat Stress Risk',
    severity: 'Medium',
    timestamp: '22 Sep, 2:10 PM',
    description: 'Heat index in your area is elevated. Increased fatigue risk during outdoor activity.',
    whatToDo: ['Stay hydrated', 'Avoid direct sun 12–4 PM', 'Take your medication on schedule'],
  },
];

export const mockContacts: EmergencyContact[] = [
  { id: 'c1', name: 'Priya Sharma', relation: 'Daughter', phone: '+91 98765 43210', notified: true, notifiedAt: '10:12 AM' },
  { id: 'c2', name: 'Rajesh Kumar', relation: 'Son', phone: '+91 91234 56789', notified: true, notifiedAt: '10:12 AM' },
];

export const mockHeartRateTrend: TrendPoint[] = [
  { label: '04:00', value: 66 },
  { label: '08:00', value: 74 },
  { label: '12:00', value: 82 },
  { label: '16:00', value: 78 },
  { label: '20:00', value: 70 },
  { label: '23:00', value: 68 },
];

export const mockSpO2Trend: TrendPoint[] = [
  { label: 'Mon', value: 97 },
  { label: 'Tue', value: 98 },
  { label: 'Wed', value: 96 },
  { label: 'Thu', value: 98 },
  { label: 'Fri', value: 99 },
  { label: 'Sat', value: 97 },
  { label: 'Sun', value: 98 },
];

// All trend values below are illustrative demo data until band sync is connected.
export const mockTrendsByRange: Record<'Day' | 'Week' | 'Month', { heartRate: TrendPoint[]; spo2: TrendPoint[] }> = {
  Day: {
    heartRate: mockHeartRateTrend,
    spo2: [
      { label: '04:00', value: 97 },
      { label: '08:00', value: 98 },
      { label: '12:00', value: 98 },
      { label: '16:00', value: 97 },
      { label: '20:00', value: 99 },
      { label: '23:00', value: 98 },
    ],
  },
  Week: {
    heartRate: [
      { label: 'Mon', value: 69 },
      { label: 'Tue', value: 72 },
      { label: 'Wed', value: 70 },
      { label: 'Thu', value: 75 },
      { label: 'Fri', value: 73 },
      { label: 'Sat', value: 71 },
      { label: 'Sun', value: 72 },
    ],
    spo2: mockSpO2Trend,
  },
  Month: {
    heartRate: [
      { label: 'Wk 1', value: 70 },
      { label: 'Wk 2', value: 72 },
      { label: 'Wk 3', value: 71 },
      { label: 'Wk 4', value: 74 },
    ],
    spo2: [
      { label: 'Wk 1', value: 97 },
      { label: 'Wk 2', value: 98 },
      { label: 'Wk 3', value: 97 },
      { label: 'Wk 4', value: 98 },
    ],
  },
};

export const mockSleepActivity = {
  sleepDuration: '7h 20m',
  sleepQuality: 'Good Quality',
  steps: 3245,
  stepGoal: 10000,
  hourlySteps: [10, 25, 40, 65, 50, 30, 20, 45, 60, 35, 15, 20],
};

export const mockDevices = [
  { id: 'd1', name: 'HealthBand Pro', mac: '2C:4B:45:C0:00', status: 'Connected', battery: 80 },
  { id: 'd2', name: 'SmartWatch X', mac: '4C:05:C0:78:9F', status: 'Disconnected', battery: 0 },
];

export const mockBaseline = {
  heartRateRange: '60 – 100 bpm',
  learnedOverDays: 7,
};

export const mockRecovery = { score: 78, level: 'Good' as const };

export const caregiverMockPatient = {
  name: 'Anita S',
  riskLevel: 'High Risk' as const,
  lastUpdate: '10:12 AM',
};
