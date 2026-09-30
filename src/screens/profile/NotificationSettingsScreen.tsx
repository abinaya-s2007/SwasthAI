import React, { useState } from 'react';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { ToggleRow } from '@/components/Selectors';

export const NotificationSettingsScreen: React.FC = () => {
  const [highRisk, setHighRisk] = useState(true);
  const [mediumRisk, setMediumRisk] = useState(true);
  const [lowRisk, setLowRisk] = useState(false);
  const [medReminders, setMedReminders] = useState(true);
  const [disasterAdvisory, setDisasterAdvisory] = useState(true);

  return (
    <Screen>
      <Header title="Notification Settings" />
      <Card>
        <ToggleRow label="High Risk Alerts" value={highRisk} onChange={setHighRisk} icon="alert-circle-outline" />
        <ToggleRow label="Medium Risk Alerts" value={mediumRisk} onChange={setMediumRisk} icon="warning-outline" />
        <ToggleRow label="Low Risk Alerts" value={lowRisk} onChange={setLowRisk} icon="information-circle-outline" />
        <ToggleRow label="Medication Reminders" value={medReminders} onChange={setMedReminders} icon="alarm-outline" />
        <ToggleRow label="Disaster Advisories" value={disasterAdvisory} onChange={setDisasterAdvisory} icon="megaphone-outline" />
      </Card>
    </Screen>
  );
};
