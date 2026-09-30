import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAssetsByOperator } from '../api/services';
import { OperatorAsset } from '../types';

type Props = {
  label: string;
  value: string;
  onChange: (assetCode: string) => void;
};

export default function AssetCodeSelect({ label, value, onChange }: Props) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<OperatorAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!user?.employeeCode) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAssetsByOperator(user.employeeCode);
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setAssets(list);
        if (list.length === 1 && !value) onChange(list[0].assetCode);
      } catch (error: any) {
        if (!cancelled) Alert.alert('Could not load assets', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // Load once per user; value/onChange are only read for the single-asset default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.employeeCode]);

  const select = (asset: OperatorAsset) => {
    onChange(asset.assetCode);
    setPickerVisible(false);
  };

  const disabled = loading || !assets.length;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.dropdown, disabled && styles.dropdownDisabled]} onPress={() => setPickerVisible(true)} disabled={disabled}>
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {loading ? 'Loading assets…' : value || (assets.length ? 'Select asset code' : 'No assets assigned to you')}
        </Text>
        {loading ? <ActivityIndicator size="small" /> : <Ionicons name="chevron-down" size={18} color="#8B929A" />}
      </Pressable>

      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select asset</Text>
            <FlatList
              data={assets}
              keyExtractor={(item, index) => String(item.assetCodeId ?? item.assetCode ?? index)}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.assetCode === value;
                return (
                  <Pressable style={[styles.option, isSelected && styles.optionSelected]} onPress={() => select(item)}>
                    <View>
                      <Text style={[styles.optionCode, isSelected && styles.optionCodeSelected]}>{item.assetCode}</Text>
                      {item.assetClass ? <Text style={styles.optionClass}>{item.assetClass}</Text> : null}
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
  optionCode: { fontSize: 15, fontWeight: '700', color: '#17201C' },
  optionCodeSelected: { color: '#176B4D' },
  optionClass: { fontSize: 12, color: '#8B929A', marginTop: 2 },
});
