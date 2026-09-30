import type { AlertItem } from '@/types';
import type { SensorEvent, SensorSample } from '@/types/sensors';

function timestampLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function transitionAlerts(
  samples: SensorSample[],
  key: string,
  matches: (sample: SensorSample) => boolean,
  build: (sample: SensorSample) => Omit<AlertItem, 'id' | 'timestamp'>,
): AlertItem[] {
  const result: AlertItem[] = [];
  let wasMatching = false;
  let previousAt = 0;
  for (const sample of samples) {
    if (previousAt && sample.timestamp - previousAt > 15_000) wasMatching = false;
    const matching = matches(sample);
    if (matching && !wasMatching) {
      result.push({
        ...build(sample),
        id: `live-${key}-${sample.timestamp}`,
        timestamp: timestampLabel(sample.timestamp),
      });
    }
    wasMatching = matching;
    previousAt = sample.timestamp;
  }
  return result;
}

export function buildLiveAlerts(samples: SensorSample[], events: SensorEvent[]): AlertItem[] {
  const alerts: AlertItem[] = [
    ...transitionAlerts(samples, 'spo2', (s) => s.spo2 != null && s.spo2 <= 90, (s) => ({
      title: 'Low SpO₂', severity: 'High',
      description: `The watch reported SpO₂ at ${s.spo2}%.`,
      whatToDo: ['Pause activity and sit upright.', 'Check that the band is fitted correctly.', 'Seek medical help if you feel unwell or the reading stays low.'],
    })),
    ...transitionAlerts(samples, 'heart-rate', (s) => s.heartRate != null && (s.heartRate > 120 || s.heartRate < 45), (s) => ({
      title: 'Heart rate outside alert range', severity: 'High',
      description: `The watch reported a heart rate of ${s.heartRate} bpm.`,
      whatToDo: ['Stop and rest.', 'Check the band fit and repeat the reading.', 'Seek medical help for symptoms or a persistent reading.'],
    })),
    ...transitionAlerts(samples, 'risk', (s) => s.riskLevel === 'high' || s.riskLevel === 'emergency', (s) => ({
      title: s.riskLevel === 'emergency' ? 'Emergency risk detected' : 'High risk detected',
      severity: 'High',
      description: `The watch risk status is ${s.riskLevel}.`,
      whatToDo: ['Pause activity and check how you feel.', 'Ask someone nearby for help if needed.', 'Call local emergency services for urgent symptoms.'],
    })),
    ...transitionAlerts(samples, 'risk-caution', (s) => s.riskLevel === 'caution' || s.riskLevel === 'observe', (s) => ({
      title: 'Health risk needs attention', severity: 'Medium',
      description: `The watch risk status is ${s.riskLevel}.`,
      whatToDo: ['Take a short rest.', 'Check the latest readings again soon.', 'Get help if symptoms appear or worsen.'],
    })),
    ...transitionAlerts(samples, 'heat', (s) => s.heatRisk != null && s.heatRisk >= 35, (s) => ({
      title: s.heatRisk != null && s.heatRisk >= 60 ? 'High heat risk' : 'Heat risk caution',
      severity: s.heatRisk != null && s.heatRisk >= 60 ? 'High' : 'Medium',
      description: `The watch reports a heat risk score of ${s.heatRisk}/100.`,
      whatToDo: ['Move to a cool or shaded place.', 'Drink water if appropriate for you.', 'Avoid strenuous activity until you feel well.'],
    })),
  ];

  for (const event of events) {
    if (event.event !== 'MANUAL_SOS' && event.event !== 'FALL_CONFIRMED') continue;
    alerts.push({
      id: event.id,
      title: event.event === 'FALL_CONFIRMED' ? 'Fall detected by watch' : 'SOS from watch',
      severity: 'High',
      timestamp: timestampLabel(event.timestamp),
      description: event.detail,
      whatToDo: ['Check on the wearer immediately.', 'Contact the wearer or their emergency contact.', 'Call local emergency services if urgent help is needed.'],
    });
  }

  const eventTime = (id: string) => {
    const match = id.match(/^(?:live-[a-z-]+-|)(\d+)$/) ?? id.match(/^(\d+)-/);
    return match ? Number(match[1]) : 0;
  };
  return alerts.sort((a, b) => eventTime(b.id) - eventTime(a.id));
}
