import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { createServiceRequest, getServiceRequestsByProject, verifyAssetLocation } from '../api/services';
import { generateUuidV4 } from '../utils/uuid';

export default function AddServiceRequestScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddServiceRequest'>) {
  const { user, selectedProject } = useAuth();
  const [assetCode, setAssetCode] = useState('');
  const [operatorName, setOperatorName] = useState(user?.employeeName ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maintenanceWorks, setMaintenanceWorks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'mismatch' | null>(null);

  const handleAssetCodeChange = (text: string) => {
    setAssetCode(text);
    setVerificationStatus(null);
  };

  const handleVerifyLocation = async () => {
    if (!assetCode.trim()) {
      Alert.alert('Asset code required', 'Enter an asset code first.');
      return;
    }
    if (!selectedProject?.projectCode) {
      Alert.alert('No project selected', 'Select a project on the home screen before verifying.');
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyAssetLocation(assetCode.trim(), selectedProject.projectCode);
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

  const submit = async () => {
    if (!assetCode.trim()) {
      Alert.alert('Asset code required', 'Enter the asset code this request is for.');
      return;
    }
    if (!operatorName.trim()) {
      Alert.alert('Operator name required', 'Enter the operator name.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Phone number required', 'Enter a contact phone number.');
      return;
    }
    if (!maintenanceWorks.trim()) {
      Alert.alert('Maintenance works required', 'Describe the maintenance work needed.');
      return;
    }
    if (!selectedProject?.projectCode) {
      Alert.alert('No project selected', 'Select a project on the home screen before submitting a request.');
      return;
    }
    if (verificationStatus !== 'verified') {
      Alert.alert('Verify asset code', 'Verify the asset code location before submitting the request.');
      return;
    }
    if (!user?.employeeCode) return;

    try {
      setSubmitting(true);
      const existing = await getServiceRequestsByProject(selectedProject.projectCode);
      const nextNumber = (Array.isArray(existing) ? existing.length : 0) + 1;
      const serviceRequestCode = `SR-${selectedProject.projectCode}-M-${nextNumber}`;
      await createServiceRequest({
        serviceRequestId: generateUuidV4(),
        serviceRequestCode,
        submittedBy: user.employeeCode,
        requestedDate: new Date().toISOString(),
        projectCode: selectedProject.projectCode,
        assetCode: assetCode.trim(),
        operatorName: operatorName.trim(),
        phoneNumber: phoneNumber.trim(),
        maintenanceWorks: maintenanceWorks.trim(),
      });
      Alert.alert('Saved', 'Service request submitted successfully.', [
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
                <FormField label="Asset Code" placeholder="Enter asset code" autoCapitalize="characters" value={assetCode} onChangeText={handleAssetCodeChange} />
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

          <FormField label="Project" value={selectedProject?.projectName ?? 'No project selected'} editable={false} />
          <FormField label="Operator Name" placeholder="Enter operator name" value={operatorName} onChangeText={setOperatorName} />
          <FormField label="Phone Number" placeholder="Enter contact number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
          <FormField
            label="Maintenance Works"
            placeholder="Describe the maintenance work needed"
            multiline
            numberOfLines={5}
            value={maintenanceWorks}
            onChangeText={setMaintenanceWorks}
            style={styles.maintenanceInput}
            textAlignVertical="top"
          />

          <PrimaryButton title="Submit Service Request" onPress={submit} loading={submitting} />
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
  maintenanceInput: { minHeight: 110, paddingTop: 14 },
});
