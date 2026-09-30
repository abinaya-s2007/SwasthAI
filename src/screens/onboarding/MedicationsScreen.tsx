import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { StepProgress } from '@/components/StepProgress';
import { Input } from '@/components/Input';
import { StepNavButtons } from '@/components/StepNavButtons';
import { Card } from '@/components/Card';
import { ToggleRow } from '@/components/Selectors';
import { useTheme } from '@/theme/ThemeContext';
import { useOnboarding } from './OnboardingContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnbMedications'>;

export const MedicationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data, update } = useOnboarding();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('500 mg');
  const [frequency, setFrequency] = useState('Once daily');
  const [remindMe, setRemindMe] = useState(true);

  const addMedication = () => {
    if (!name.trim()) return;
    update({
      medications: [
        ...data.medications,
        { id: String(Date.now()), name, dose, frequency, remindMe },
      ],
    });
    setName('');
  };

  return (
    <Screen>
      <StepProgress step={3} total={9} label="Medications" />
      <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 16 }}>Optional. You can skip this step or add medication details later.</Text>
      <Input label="Medication name" placeholder="Paracetamol" value={name} onChangeText={setName} />
      <Input label="Dose" placeholder="500 mg" value={dose} onChangeText={setDose} />
      <Input label="Frequency" placeholder="Once daily" value={frequency} onChangeText={setFrequency} />
      <ToggleRow label="Remind me" value={remindMe} onChange={setRemindMe} icon="alarm-outline" />

      <TouchableOpacity onPress={addMedication} style={[styles.addRow, { borderColor: colors.primary }]}>
        <Ionicons name="add-circle" size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 6 }}>Add Medication</Text>
      </TouchableOpacity>

      {data.medications.map((m) => (
        <Card key={m.id}>
          <View style={styles.medRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{m.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {m.dose} · {m.frequency}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => update({ medications: data.medications.filter((x) => x.id !== m.id) })}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <StepNavButtons onBack={() => navigation.goBack()} onNext={() => navigation.navigate('OnbAllergies')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  medRow: { flexDirection: 'row', alignItems: 'center' },
});
