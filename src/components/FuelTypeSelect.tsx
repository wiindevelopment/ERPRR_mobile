import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { getFuelTypes } from '../api/services';
import { FuelType } from '../types';

/** Loads the fuel item codes once; used by the picker and to show names for stored codes. */
export function useFuelTypes() {
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getFuelTypes();
        if (!cancelled) setFuelTypes(Array.isArray(data) ? data : []);
      } catch (error: any) {
        if (!cancelled) Alert.alert('Could not load fuel types', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { fuelTypes, loading };
}

/** Shows "Fuel, Diesel" style names without the "Fuel, " prefix every option shares. */
export function fuelTypeName(fuelTypes: FuelType[], itemCodeCode?: string) {
  if (!itemCodeCode) return '';
  const name = fuelTypes.find(type => type.itemCodeCode === itemCodeCode)?.itemCodeName;
  return name ? name.replace(/^Fuel,\s*/i, '') : itemCodeCode;
}

type Props = {
  label: string;
  /** Selected item code, e.g. FLN-FUL-0001. */
  value: string;
  onChange: (itemCodeCode: string) => void;
  fuelTypes: FuelType[];
  loading: boolean;
};

export default function FuelTypeSelect({ label, value, onChange, fuelTypes, loading }: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const select = (fuelType: FuelType) => {
    onChange(fuelType.itemCodeCode);
    setPickerVisible(false);
  };

  const disabled = loading || !fuelTypes.length;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.dropdown, disabled && styles.dropdownDisabled]} onPress={() => setPickerVisible(true)} disabled={disabled}>
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {loading ? 'Loading fuel types…' : fuelTypeName(fuelTypes, value) || (fuelTypes.length ? 'Select fuel type' : 'No fuel types available')}
        </Text>
        {loading ? <ActivityIndicator size="small" /> : <Ionicons name="chevron-down" size={18} color="#8B929A" />}
      </Pressable>

      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select fuel type</Text>
            <FlatList
              data={fuelTypes}
              keyExtractor={item => item.itemCodeCode}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.itemCodeCode === value;
                return (
                  <Pressable style={[styles.option, isSelected && styles.optionSelected]} onPress={() => select(item)}>
                    <View>
                      <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>{fuelTypeName(fuelTypes, item.itemCodeCode)}</Text>
                      <Text style={styles.optionCode}>{item.itemCodeCode}</Text>
                    </View>
                    {isSelected ? <Ionicons name="checkmark" size={20} color="#176B4D" /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  dropdown: {
    minHeight: 50, borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, backgroundColor: '#FFFFFF',
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dropdownDisabled: { backgroundColor: '#F0F2F4' },
  dropdownValue: { fontSize: 15, color: '#15191D', fontWeight: '600' },
  dropdownPlaceholder: { fontSize: 15, color: '#8B929A' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C', marginBottom: 12 },
  separator: { height: 1, backgroundColor: '#EEF0EF' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12,
  },
  optionSelected: { backgroundColor: '#E7F1ED' },
  optionName: { fontSize: 15, fontWeight: '700', color: '#17201C' },
  optionNameSelected: { color: '#176B4D' },
  optionCode: { fontSize: 12, color: '#8B929A', marginTop: 2 },
});
