import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingProvider } from '@/screens/onboarding/OnboardingContext';

// Auth
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { OTPVerificationScreen } from '@/screens/auth/OTPVerificationScreen';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';

// Onboarding
import { BasicInfoScreen } from '@/screens/onboarding/BasicInfoScreen';
import { ChronicConditionsScreen } from '@/screens/onboarding/ChronicConditionsScreen';
import { MedicationsScreen } from '@/screens/onboarding/MedicationsScreen';
import { AllergiesScreen } from '@/screens/onboarding/AllergiesScreen';
import { MobilityScreen } from '@/screens/onboarding/MobilityScreen';
import { EmergencyContactsScreen } from '@/screens/onboarding/EmergencyContactsScreen';
import { ConsentScreen } from '@/screens/onboarding/ConsentScreen';
import { DevicePairingScreen } from '@/screens/onboarding/DevicePairingScreen';
import { BaselineLearningScreen } from '@/screens/onboarding/BaselineLearningScreen';

// Home / Vitals
import { EnvironmentPanelScreen } from '@/screens/home/EnvironmentPanelScreen';
import { OfflineStatusScreen } from '@/screens/home/OfflineStatusScreen';
import { VitalDetailHeartRateScreen } from '@/screens/vitals/VitalDetailHeartRateScreen';
import { SleepActivityDetailScreen } from '@/screens/vitals/SleepActivityDetailScreen';

// Risk
import { RiskDetailScreen } from '@/screens/risk/RiskDetailScreen';
import { SubScoreDetailScreen } from '@/screens/risk/SubScoreDetailScreen';
import { ExplainabilityScreen } from '@/screens/risk/ExplainabilityScreen';

// Alerts
import { AlertDetailScreen } from '@/screens/alerts/AlertDetailScreen';
import { AlertHistoryScreen } from '@/screens/alerts/AlertHistoryScreen';

// SOS
import { SOSConfirmationScreen } from '@/screens/sos/SOSConfirmationScreen';
import { SOSCountdownScreen } from '@/screens/sos/SOSCountdownScreen';
import { SOSDispatchScreen } from '@/screens/sos/SOSDispatchScreen';
import { SOSSentScreen } from '@/screens/sos/SOSSentScreen';
import { ContactCascadeScreen } from '@/screens/sos/ContactCascadeScreen';
import { SOSInProgressScreen } from '@/screens/sos/SOSInProgressScreen';

// Trends
import { PersonalBaselineScreen } from '@/screens/trends/PersonalBaselineScreen';
import { RecoveryTrackingScreen } from '@/screens/trends/RecoveryTrackingScreen';
import { ExportSummaryScreen } from '@/screens/trends/ExportSummaryScreen';
import { ShareOptionsScreen } from '@/screens/trends/ShareOptionsScreen';

// Profile
import { EditPersonalInfoScreen } from '@/screens/profile/EditPersonalInfoScreen';
import { ManageContactsScreen } from '@/screens/profile/ManageContactsScreen';
import { DeviceManagementScreen } from '@/screens/profile/DeviceManagementScreen';
import { PrivacySettingsScreen } from '@/screens/profile/PrivacySettingsScreen';
import { NotificationSettingsScreen } from '@/screens/profile/NotificationSettingsScreen';
import { AccessibilityScreen } from '@/screens/profile/AccessibilityScreen';
import { HelpSupportScreen } from '@/screens/profile/HelpSupportScreen';
import { LogoutConfirmScreen } from '@/screens/profile/LogoutConfirmScreen';

// Voice
import { VoiceAssistantScreen } from '@/screens/voice/VoiceAssistantScreen';

// Caregiver
import { CaregiverLoginScreen } from '@/screens/caregiver/CaregiverLoginScreen';
import { CaregiverDashboardScreen } from '@/screens/caregiver/CaregiverDashboardScreen';
import { CaregiverSOSDetailScreen } from '@/screens/caregiver/CaregiverSOSDetailScreen';
import { CaregiverSettingsScreen } from '@/screens/caregiver/CaregiverSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <OnboardingProvider>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
      >
        {/* Auth */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Onboarding */}
        <Stack.Screen name="OnbBasicInfo" component={BasicInfoScreen} />
        <Stack.Screen name="OnbChronicConditions" component={ChronicConditionsScreen} />
        <Stack.Screen name="OnbMedications" component={MedicationsScreen} />
        <Stack.Screen name="OnbAllergies" component={AllergiesScreen} />
        <Stack.Screen name="OnbMobility" component={MobilityScreen} />
        <Stack.Screen name="OnbEmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen name="OnbConsent" component={ConsentScreen} />
        <Stack.Screen name="OnbDevicePairing" component={DevicePairingScreen} />
        <Stack.Screen name="OnbBaseline" component={BaselineLearningScreen} />

        {/* Main app shell */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* Home / Vitals detail */}
        <Stack.Screen name="EnvironmentPanel" component={EnvironmentPanelScreen} />
        <Stack.Screen name="OfflineStatus" component={OfflineStatusScreen} />
        <Stack.Screen name="VitalDetailHeartRate" component={VitalDetailHeartRateScreen} />
        <Stack.Screen name="SleepActivityDetail" component={SleepActivityDetailScreen} />

        {/* Risk */}
        <Stack.Screen name="RiskDetail" component={RiskDetailScreen} />
        <Stack.Screen name="SubScoreDetail" component={SubScoreDetailScreen} />
        <Stack.Screen name="Explainability" component={ExplainabilityScreen} />

        {/* Alerts */}
        <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
        <Stack.Screen name="AlertHistory" component={AlertHistoryScreen} />

        {/* SOS */}
        <Stack.Screen name="SOSConfirmation" component={SOSConfirmationScreen} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="SOSCountdown" component={SOSCountdownScreen} />
        <Stack.Screen name="SOSDispatch" component={SOSDispatchScreen} />
        <Stack.Screen name="SOSSent" component={SOSSentScreen} />
        <Stack.Screen name="ContactCascade" component={ContactCascadeScreen} />
        <Stack.Screen name="SOSInProgress" component={SOSInProgressScreen} />

        {/* Trends */}
        <Stack.Screen name="PersonalBaseline" component={PersonalBaselineScreen} />
        <Stack.Screen name="RecoveryTracking" component={RecoveryTrackingScreen} />
        <Stack.Screen name="ExportSummary" component={ExportSummaryScreen} />
        <Stack.Screen name="ShareOptions" component={ShareOptionsScreen} />

        {/* Profile */}
        <Stack.Screen name="EditPersonalInfo" component={EditPersonalInfoScreen} />
        <Stack.Screen name="ManageContacts" component={ManageContactsScreen} />
        <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="LogoutConfirm" component={LogoutConfirmScreen} />

        {/* Voice */}
        <Stack.Screen name="VoiceAssistant" component={VoiceAssistantScreen} />

        {/* Caregiver */}
        <Stack.Screen name="CaregiverLogin" component={CaregiverLoginScreen} />
        <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboardScreen} />
        <Stack.Screen name="CaregiverSOSDetail" component={CaregiverSOSDetailScreen} />
        <Stack.Screen name="CaregiverSettings" component={CaregiverSettingsScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
};
