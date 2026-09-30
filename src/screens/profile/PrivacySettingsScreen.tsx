import React, { useState } from 'react';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ToggleRow } from '@/components/Selectors';

export const PrivacySettingsScreen: React.FC = () => {
  const [shareStatus, setShareStatus] = useState(true);
  const [shareDuringSOS, setShareDuringSOS] = useState(true);
  const [syncAnonymized, setSyncAnonymized] = useState(false);
  const [caregiverAccess, setCaregiverAccess] = useState(true);

  return (
    <Screen>
      <Header title="Privacy Center" />
      <Card>
        <ToggleRow label="Share risk status" description="During SOS" value={shareStatus} onChange={setShareStatus} icon="stats-chart-outline" />
        <ToggleRow
          label="Share location during SOS"
          value={shareDuringSOS}
          onChange={setShareDuringSOS}
          icon="location-outline"
        />
        <ToggleRow
          label="Sync anonymized data"
          value={syncAnonymized}
          onChange={setSyncAnonymized}
          icon="cloud-outline"
        />
        <ToggleRow label="Caregiver access" value={caregiverAccess} onChange={setCaregiverAccess} icon="people-outline" />
      </Card>
      <Button label="Delete All Data" variant="danger" onPress={() => {}} />
    </Screen>
  );
};
