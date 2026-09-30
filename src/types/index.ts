export type RiskLevel = 'low' | 'normal' | 'caution' | 'high';

export type Vitals = {
  heartRate: number;
  spo2: number;
  skinTemp: number;
  steps: number;
};

export type EnvironmentData = {
  location: string;
  temperature: number;
  humidity: number;
  heatIndex: number;
  wbgt: number;
  heatIndexRisk: RiskLevel;
};

export type SubScore = {
  label: string;
  value: number;
  level: RiskLevel;
};

export type RiskScore = {
  overall: number;
  level: RiskLevel;
  subScores: SubScore[];
  confidence: number;
};

export type AlertSeverity = 'High' | 'Medium' | 'Low';

export type AlertItem = {
  id: string;
  title: string;
  severity: AlertSeverity;
  timestamp: string;
  description: string;
  whatToDo: string[];
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  deliveryChannel?: 'sms' | 'whatsapp';
  serverSynced?: boolean;
  notified?: boolean;
  notifiedAt?: string;
};

export type ChronicCondition =
  | 'Cardiac (Heart disease)'
  | 'Respiratory (Asthma, COPD)'
  | 'Diabetes'
  | 'Chronic Kidney Disease'
  | 'Liver Disease'
  | 'Neurological Disorder'
  | 'Bleeding Disorder'
  | 'Other';

export type Medication = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  remindMe: boolean;
};

export type OnboardingData = {
  basicInfo: {
    fullName: string;
    dob: string;
    sex: 'Male' | 'Female' | 'Other' | '';
    phoneOrEmail: string;
  };
  chronicConditions: ChronicCondition[];
  medications: Medication[];
  allergies: string[];
  mobility: {
    hadFalls: boolean | null;
    usesAid: boolean | null;
    gaitConcern: boolean | null;
  };
  emergencyContacts: EmergencyContact[];
  consent: {
    storeVitalsLocally: boolean;
    shareRiskStatus: boolean;
    shareLocationDuringSOS: boolean;
    syncAnonymizedData: boolean;
  };
  devicePaired: boolean;
};

export type TrendPoint = { label: string; value: number };
