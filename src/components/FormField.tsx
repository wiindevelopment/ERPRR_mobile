import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
};

export default function FormField({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#8B929A"
        style={[styles.input, props.editable === false && styles.readOnly, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#15191D',
  },
  readOnly: { backgroundColor: '#F0F2F4', color: '#687078' },
});
