import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getTodayYYYYMMDD } from '../utils/date';
import { createMeterReading, getAssetsByOperator } from '../api/services';
import { OperatorAsset } from '../types';
import { generateUuidV4 } from '../utils/uuid';

const METER_TYPES = ['Odometer - km', 'Hour meter - hr'];

export default function AddMeterReadingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddMeterReading'>) {
  const { user } = useAuth();
  const [assetCodeId, setAssetCodeId] = useState('');
  const [meterType, setMeterType] = useState(METER_TYPES[0]);
  const [readingValue, setReadingValue] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assets, setAssets] = useState<OperatorAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetPickerVisible, setAssetPickerVisible] = useState(false);
  const readingDate = getTodayYYYYMMDD();

  useEffect(() => {
    if (!user?.employeeCode) return;
    let cancelled = false;
    (async () => {
      try {
        setAssetsLoading(true);
        const data = await getAssetsByOperator(user.employeeCode);
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setAssets(list);
        if (list.length === 1) setAssetCodeId(list[0].assetCode);
      } catch (error: any) {
        if (!cancelled) Alert.alert('Could not load assets', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
      } finally {
        if (!cancelled) setAssetsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.employeeCode]);

  const selectAsset = (asset: OperatorAsset) => {
    setAssetCodeId(asset.assetCode);
    setAssetPickerVisible(false);
  };

  const usageValue = useMemo(() => {
    const current = Number(readingValue);
    const previous = Number(previousReading);
    if (!readingValue || !previousReading || Number.isNaN(current) || Number.isNaN(previous)) return 0;
    return current - previous;
  }, [readingValue, previousReading]);

  const readingError = useMemo(() => {
    const current = Number(readingValue);
    const previous = Number(previousReading);
    if (!readingValue || !previousReading || Number.isNaN(current) || Number.isNaN(previous)) return null;
    if (current <= previous) return 'Reading value must be higher than the previous reading.';
    return null;
  }, [readingValue, previousReading]);

  const submit = async () => {
    const current = Number(readingValue);
    const previous = Number(previousReading);

    if (!assetCodeId.trim() || !readingValue || Number.isNaN(current) || !previousReading || Number.isNaN(previous)) {
      Alert.alert('Check inputs', 'Select an asset code and enter valid reading and previous reading values.');
      return;
    }
    if (readingError) {
      Alert.alert('Invalid reading', readingError);
      return;
    }
    if (!user?.employeeCode) return;

    try {
      setSubmitting(true);
      await createMeterReading({
        meterReadingId: generateUuidV4(),
        assetCode: assetCodeId.trim(),
        meterType,
        readingDate,
        readingValue: current,
        previousReading: previous,
        usageValue,
        remarks: remarks.trim(),
        recordedBy: user.employeeCode,
      });
      Alert.alert('Saved', 'Meter reading recorded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Could not save', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Asset Code</Text>
            <Pressable
              style={[styles.dropdown, (assetsLoading || !assets.length) && styles.dropdownDisabled]}
              onPress={() => setAssetPickerVisible(true)}
              disabled={assetsLoading || !assets.length}
            >
              <Text style={assetCodeId ? styles.dropdownValue : styles.dropdownPlaceholder}>
                {assetsLoading
                  ? 'Loading assets…'
                  : assetCodeId || (assets.length ? 'Select asset code' : 'No assets assigned to you')}
              </Text>
              {assetsLoading ? <ActivityIndicator size="small" /> : <Ionicons name="chevron-down" size={18} color="#8B929A" />}
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Meter Type</Text>
            <View style={styles.chips}>
              {METER_TYPES.map(type => {
                const selected = meterType === type;
                return (
                  <Pressable key={type} style={[styles.chip, selected && styles.chipSelected]} onPress={() => setMeterType(type)}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <FormField label="Reading Date" value={readingDate} editable={false} />
          <FormField label="Reading Value" placeholder="Enter current reading" keyboardType="decimal-pad" value={readingValue} onChangeText={setReadingValue} />
          <FormField label="Previous Reading" placeholder="Enter previous reading" keyboardType="decimal-pad" value={previousReading} onChangeText={setPreviousReading} />
          {readingError ? <Text style={styles.errorText}>{readingError}</Text> : null}
          <FormField label="Usage Value (auto calculated)" value={String(usageValue)} editable={false} />
          <FormField label="Recorded By" value={user?.employeeCode ?? ''} editable={false} />
          <FormField label="Remarks" placeholder="Optional remarks" multiline numberOfLines={4} value={remarks} onChangeText={setRemarks} style={styles.remarksInput} textAlignVertical="top" />

          <PrimaryButton title="Submit Meter Reading" onPress={submit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={assetPickerVisible} animationType="slide" transparent onRequestClose={() => setAssetPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAssetPickerVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select asset</Text>
            <FlatList
              data={assets}
              keyExtractor={(item, index) => String(item.assetCodeId ?? item.assetCode ?? index)}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.assetCode === assetCodeId;
                return (
                  <Pressable style={[styles.assetOption, isSelected && styles.assetOptionSelected]} onPress={() => selectAsset(item)}>
                    <View>
                      <Text style={[styles.assetOptionCode, isSelected && styles.assetOptionCodeSelected]}>{item.assetCode}</Text>
                      {item.assetClass ? <Text style={styles.assetOptionClass}>{item.assetClass}</Text> : null}
                    </View>
                    {isSelected ? <Ionicons name="checkmark" size={20} color="#176B4D" /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  flex: { flex: 1 },
  container: { padding: 18, gap: 16, paddingBottom: 36 },
  dropdown: {
    minHeight: 50, borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, backgroundColor: '#FFFFFF',
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dropdownDisabled: { backgroundColor: '#F0F2F4' },
  dropdownValue: { fontSize: 15, color: '#15191D', fontWeight: '600' },
  dropdownPlaceholder: { fontSize: 15, color: '#8B929A' },
  errorText: { fontSize: 12, fontWeight: '700', color: '#C0392B', marginTop: -8 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chipSelected: { backgroundColor: '#E4F0EB', borderColor: '#176B4D' },
  chipText: { color: '#5C6460', fontWeight: '700' },
  chipTextSelected: { color: '#176B4D' },
  remarksInput: { minHeight: 96, paddingTop: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C', marginBottom: 12 },
  separator: { height: 1, backgroundColor: '#EEF0EF' },
  assetOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12,
  },
  assetOptionSelected: { backgroundColor: '#E7F1ED' },
  assetOptionCode: { fontSize: 15, fontWeight: '700', color: '#17201C' },
  assetOptionCodeSelected: { color: '#176B4D' },
  assetOptionClass: { fontSize: 12, color: '#8B929A', marginTop: 2 },
});
