import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';

type Props = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
};

export const StepNavButtons: React.FC<Props> = ({ onBack, onNext, nextLabel = 'Next' }) => (
  <View style={styles.row}>
    <Button label="Back" variant="secondary" onPress={onBack} style={styles.half} />
    <Button label={nextLabel} onPress={onNext} style={styles.half} />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  half: { flex: 1 },
});
