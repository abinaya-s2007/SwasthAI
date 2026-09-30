import React, { createContext, useContext, useState } from 'react';
import { OnboardingData } from '@/types';

const initialData: OnboardingData = {
  basicInfo: { fullName: '', dob: '', sex: '', phoneOrEmail: '' },
  chronicConditions: [],
  medications: [],
  allergies: [],
  mobility: { hadFalls: null, usesAid: null, gaitConcern: null },
  emergencyContacts: [],
  consent: {
    storeVitalsLocally: true,
    shareRiskStatus: false,
    shareLocationDuringSOS: false,
    syncAnonymizedData: false,
  },
  devicePaired: false,
};

type Ctx = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<Ctx | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));
  return <OnboardingContext.Provider value={{ data, update }}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
