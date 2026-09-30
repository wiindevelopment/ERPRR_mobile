import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const REQUEST_TYPES = ['Breakdown', 'Faults', 'Accident'];

type Props = {
  label: string;
  value: string;
  onChange: (requestType: string) => void;
};

export default function RequestTypeSelect({ label, value, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {REQUEST_TYPES.map(type => {
          const selected = value === type;
          return (
            <Pressable key={type} style={[styles.chip, selected && styles.chipSelected]} onPress={() => onChange(type)}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexGrow: 1, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE1E6',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  chipSelected: { backgroundColor: '#E4F0EB', borderColor: '#176B4D' },
  chipText: { color: '#5C6460', fontWeight: '700' },
  chipTextSelected: { color: '#176B4D' },
});
