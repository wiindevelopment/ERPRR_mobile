import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import FormField from '../components/FormField';
import AssetCodeSelect from '../components/AssetCodeSelect';
import DefectMultiSelect from '../components/DefectMultiSelect';
import RequestTypeSelect from '../components/RequestTypeSelect';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { createServiceRequest, getServiceRequestsByProject } from '../api/services';
import { generateUuidV4 } from '../utils/uuid';
import { joinDefects } from '../constants/maintenanceDefects';

export default function AddServiceRequestScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddServiceRequest'>) {
  const { user, selectedProject } = useAuth();
  const [assetCode, setAssetCode] = useState('');
  const [operatorName, setOperatorName] = useState(user?.employeeName ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requestType, setRequestType] = useState('');
  const [maintenanceWorks, setMaintenanceWorks] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!assetCode.trim()) {
      Alert.alert('Asset code required', 'Select the asset code this request is for.');
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
    if (!requestType) {
      Alert.alert('Request type required', 'Select a request type.');
      return;
    }
    if (!maintenanceWorks.length) {
      Alert.alert('Maintenance works required', 'Select at least one defect.');
      return;
    }
    if (!selectedProject?.projectCode) {
      Alert.alert('No project selected', 'Select a project on the home screen before submitting a request.');
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
        maintenanceWorks: joinDefects(maintenanceWorks),
        requestType,
        remarks: remarks.trim(),
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
          <AssetCodeSelect label="Asset Code" value={assetCode} onChange={setAssetCode} />

          <FormField label="Project" value={selectedProject?.projectName ?? 'No project selected'} editable={false} />
          <FormField label="Operator Name" placeholder="Enter operator name" value={operatorName} onChangeText={setOperatorName} />
          <FormField label="Phone Number" placeholder="Enter contact number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
          <RequestTypeSelect label="Request Type" value={requestType} onChange={setRequestType} />
          <DefectMultiSelect label="Maintenance Works" value={maintenanceWorks} onChange={setMaintenanceWorks} />
          <FormField
            label="Remarks"
            placeholder="Optional remarks"
            multiline
            numberOfLines={4}
            value={remarks}
            onChangeText={setRemarks}
            style={styles.remarksInput}
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
  remarksInput: { minHeight: 96, paddingTop: 14 },
});
