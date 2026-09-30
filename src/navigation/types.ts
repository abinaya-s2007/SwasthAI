export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OTPVerification: { phoneOrEmail: string };
  ResetPassword: undefined;
};

export type OnboardingStackParamList = {
  OnbBasicInfo: undefined;
  OnbChronicConditions: undefined;
  OnbMedications: undefined;
  OnbAllergies: undefined;
  OnbMobility: undefined;
  OnbEmergencyContacts: undefined;
  OnbConsent: undefined;
  OnbDevicePairing: undefined;
  OnbBaseline: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  AlertsTab: undefined;
  SOSTab: undefined;
  TrendsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  OTPVerification: { phoneOrEmail: string };
  ResetPassword: undefined;

  OnbBasicInfo: undefined;
  OnbChronicConditions: undefined;
  OnbMedications: undefined;
  OnbAllergies: undefined;
  OnbMobility: undefined;
  OnbEmergencyContacts: undefined;
  OnbConsent: undefined;
  OnbDevicePairing: undefined;
  OnbBaseline: undefined;

  MainTabs: { screen?: keyof MainTabParamList } | undefined;

  EnvironmentPanel: undefined;
  OfflineStatus: undefined;
  VitalDetailHeartRate: undefined;
  SleepActivityDetail: undefined;

  RiskDetail: undefined;
  SubScoreDetail: { label: string };
  Explainability: undefined;

  AlertDetail: { alertId: string };
  AlertHistory: undefined;

  SOSConfirmation: undefined;
  SOSCountdown: undefined;
  SOSDispatch: undefined;
  SOSSent: undefined;
  ContactCascade: undefined;
  SOSInProgress: undefined;

  PersonalBaseline: undefined;
  RecoveryTracking: undefined;
  ExportSummary: undefined;
  ShareOptions: undefined;

  EditPersonalInfo: undefined;
  ManageContacts: undefined;
  DeviceManagement: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  Accessibility: undefined;
  HelpSupport: undefined;
  LogoutConfirm: undefined;

  VoiceAssistant: undefined;

  CaregiverLogin: undefined;
  CaregiverDashboard: undefined;
  CaregiverSOSDetail: undefined;
  CaregiverSettings: undefined;
};
