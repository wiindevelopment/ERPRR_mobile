import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getTodayYYYYMMDD } from '../utils/date';
import { createMeterReading } from '../api/services';
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
  const readingDate = getTodayYYYYMMDD();

  const usageValue = useMemo(() => {
    const current = Number(readingValue);
    const previous = Number(previousReading);
    if (!readingValue || !previousReading || Number.isNaN(current) || Number.isNaN(previous)) return 0;
    return current - previous;
  }, [readingValue, previousReading]);

  const submit = async () => {
    const assetId = Number(assetCodeId);
    const current = Number(readingValue);
    const previous = Number(previousReading);

    if (!assetCodeId || Number.isNaN(assetId) || !readingValue || Number.isNaN(current) || !previousReading || Number.isNaN(previous)) {
      Alert.alert('Check inputs', 'Enter a valid asset code ID, reading value and previous reading value.');
      return;
    }
    if (usageValue < 0) {
      Alert.alert('Invalid reading', 'Reading value cannot be lower than the previous reading.');
      return;
    }
    if (!user?.employeeCode) return;

    try {
      setSubmitting(true);
      await createMeterReading({
        meterReadingId: generateUuidV4(),
        assetCodeId: assetId,
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
          <FormField label="Asset Code ID" placeholder="Enter asset code ID" keyboardType="number-pad" value={assetCodeId} onChangeText={setAssetCodeId} />

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
          <FormField label="Usage Value (auto calculated)" value={String(usageValue)} editable={false} />
          <FormField label="Recorded By" value={user?.employeeCode ?? ''} editable={false} />
          <FormField label="Remarks" placeholder="Optional remarks" multiline numberOfLines={4} value={remarks} onChangeText={setRemarks} style={styles.remarksInput} textAlignVertical="top" />

          <PrimaryButton title="Submit Meter Reading" onPress={submit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  flex: { flex: 1 },
  container: { padding: 18, gap: 16, paddingBottom: 36 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chipSelected: { backgroundColor: '#E4F0EB', borderColor: '#176B4D' },
  chipText: { color: '#5C6460', fontWeight: '700' },
  chipTextSelected: { color: '#176B4D' },
  remarksInput: { minHeight: 96, paddingTop: 14 },
});
