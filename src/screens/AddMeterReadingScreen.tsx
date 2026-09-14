import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getTodayYYYYMMDD } from '../utils/date';
import { createMeterReading, verifyAssetLocation } from '../api/services';
import { generateUuidV4 } from '../utils/uuid';

const METER_TYPES = ['Odometer - km', 'Hour meter - hr'];

export default function AddMeterReadingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddMeterReading'>) {
  const { user, selectedProject } = useAuth();
  const [assetCodeId, setAssetCodeId] = useState('');
  const [meterType, setMeterType] = useState(METER_TYPES[0]);
  const [readingValue, setReadingValue] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'mismatch' | null>(null);
  const readingDate = getTodayYYYYMMDD();

  const handleAssetCodeChange = (text: string) => {
    setAssetCodeId(text);
    setVerificationStatus(null);
  };

  const handleVerifyLocation = async () => {
    if (!assetCodeId.trim()) {
      Alert.alert('Asset code required', 'Enter an asset code first.');
      return;
    }
    if (!selectedProject?.projectCode) {
      Alert.alert('No project selected', 'Select a project on the home screen before verifying.');
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyAssetLocation(assetCodeId.trim(), selectedProject.projectCode);
      if (result.correctLocation) {
        setVerificationStatus('verified');
        Alert.alert(
          'Location verified',
          `Asset ${result.assetCode} is at ${result.currentLocation ?? selectedProject.projectName}, matching ${selectedProject.projectName}.`,
        );
      } else {
        setVerificationStatus('mismatch');
        Alert.alert(
          'Location mismatch',
          result.currentLocation
            ? `Asset ${result.assetCode} is currently recorded at "${result.currentLocation}", not ${selectedProject.projectName} (${selectedProject.projectCode}).`
            : `Asset ${result.assetCode} has no recorded location, so it cannot be confirmed at ${selectedProject.projectName} (${selectedProject.projectCode}).`,
        );
      }
    } catch (error: any) {
      setVerificationStatus(null);
      Alert.alert('Verification failed', error?.response?.data?.message ?? error?.message ?? 'Could not verify asset location.');
    } finally {
      setVerifying(false);
    }
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
      Alert.alert('Check inputs', 'Enter a valid asset code, reading value and previous reading value.');
      return;
    }
    if (readingError) {
      Alert.alert('Invalid reading', readingError);
      return;
    }
    if (verificationStatus !== 'verified') {
      Alert.alert('Verify asset code', 'Verify the asset code location before submitting the reading.');
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
          <View>
            <View style={styles.assetRow}>
              <View style={styles.assetField}>
                <FormField label="Asset Code" placeholder="Enter asset code" autoCapitalize="characters" value={assetCodeId} onChangeText={handleAssetCodeChange} />
              </View>
              <Pressable style={styles.verifyButton} onPress={handleVerifyLocation} disabled={verifying}>
                <Text style={styles.verifyButtonText}>{verifying ? 'Checking…' : 'Verify'}</Text>
              </Pressable>
            </View>
            {verificationStatus ? (
              <Text style={verificationStatus === 'verified' ? styles.verifiedText : styles.mismatchText}>
                {verificationStatus === 'verified' ? 'Verified' : 'Not verified'}
              </Text>
            ) : null}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  flex: { flex: 1 },
  container: { padding: 18, gap: 16, paddingBottom: 36 },
  assetRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  assetField: { flex: 1 },
  verifyButton: {
    backgroundColor: '#176B4D', borderRadius: 12, paddingHorizontal: 16,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  verifyButtonText: { color: '#FFFFFF', fontWeight: '700' },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#176B4D', marginTop: 5 },
  mismatchText: { fontSize: 11, fontWeight: '700', color: '#C0392B', marginTop: 5 },
  errorText: { fontSize: 12, fontWeight: '700', color: '#C0392B', marginTop: -8 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chipSelected: { backgroundColor: '#E4F0EB', borderColor: '#176B4D' },
  chipText: { color: '#5C6460', fontWeight: '700' },
  chipTextSelected: { color: '#176B4D' },
  remarksInput: { minHeight: 96, paddingTop: 14 },
});
