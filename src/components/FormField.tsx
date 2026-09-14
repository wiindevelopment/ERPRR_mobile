import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
  rightAccessory?: React.ReactNode;
};

export default function FormField({ label, style, rightAccessory, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          placeholderTextColor="#8B929A"
          style={[
            styles.input,
            props.editable === false && styles.readOnly,
            rightAccessory ? styles.inputWithAccessory : null,
            style,
          ]}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  inputRow: { position: 'relative', justifyContent: 'center' },
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
  inputWithAccessory: { paddingRight: 44 },
  accessory: { position: 'absolute', right: 12 },
  readOnly: { backgroundColor: '#F0F2F4', color: '#687078' },
});
