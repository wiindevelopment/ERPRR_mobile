import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { getServiceRequestsByProject, updateServiceRequest } from '../api/services';
import { ServiceRequest } from '../types';
import PrimaryButton from '../components/PrimaryButton';
import FormField from '../components/FormField';

function display(value: unknown, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function canEditRequest(item: ServiceRequest) {
  return !item.isApproved;
}

export default function ServiceRequestsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ServiceRequests'>) {
  const { selectedProject } = useAuth();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [editing, setEditing] = useState(false);
  const [assetCode, setAssetCode] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maintenanceWorks, setMaintenanceWorks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (showLoader = true) => {
    if (!selectedProject?.projectCode) return;
    try {
      if (showLoader) setLoading(true);
      const data = await getServiceRequestsByProject(selectedProject.projectCode);
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Could not load service requests', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedProject?.projectCode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openDetails = (item: ServiceRequest) => {
    setSelected(item);
    setEditing(false);
  };

  const closeModal = () => {
    setSelected(null);
    setEditing(false);
  };

  const startEdit = () => {
    if (!selected) return;
    if (!canEditRequest(selected)) {
      Alert.alert('Editing locked', 'This request has already been approved and can no longer be edited.');
      return;
    }
    setAssetCode(selected.assetCode);
    setOperatorName(selected.operatorName);
    setPhoneNumber(selected.phoneNumber);
    setMaintenanceWorks(selected.maintenanceWorks);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    if (!assetCode.trim() || !operatorName.trim() || !phoneNumber.trim() || !maintenanceWorks.trim()) {
      Alert.alert('Check inputs', 'Fill in asset code, operator name, phone number and maintenance works.');
      return;
    }

    try {
      setSaving(true);
      const updated = await updateServiceRequest({
        ...selected,
        assetCode: assetCode.trim(),
        operatorName: operatorName.trim(),
        phoneNumber: phoneNumber.trim(),
        maintenanceWorks: maintenanceWorks.trim(),
      });
      setItems(current => current.map(row => (row.serviceRequestId === selected.serviceRequestId ? updated : row)));
      setSelected(updated);
      setEditing(false);
      Alert.alert('Saved', 'Service request updated successfully.');
    } catch (error: any) {
      Alert.alert('Could not save', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <PrimaryButton title="+ Add Service Request" onPress={() => navigation.navigate('AddServiceRequest')} />

        <FlatList
          data={items}
          keyExtractor={(item, index) => item.serviceRequestId ?? String(index)}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
          ListEmptyComponent={<Text style={styles.empty}>No service requests submitted for this project yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.assetCode} numberOfLines={1}>{display(item.assetCode)}</Text>
              <Text style={styles.date} numberOfLines={1}>{formatDate(item.requestedDate)}</Text>
              <View style={[styles.statusBadge, item.isApproved ? styles.statusApproved : styles.statusPending]}>
                <Text style={[styles.statusText, item.isApproved ? styles.statusApprovedText : styles.statusPendingText]}>
                  {item.isApproved ? 'APPROVED' : 'PENDING'}
                </Text>
              </View>
              <View style={styles.divider} />
              <Pressable style={styles.eyeButton} onPress={() => openDetails(item)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color="#1D5FA8" />
              </Pressable>
            </View>
          )}
        />
      </View>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={closeModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit request' : 'Service request details'}</Text>
              {selected && !editing ? (
                <Pressable
                  onPress={startEdit}
                  hitSlop={8}
                  style={[styles.editButton, !canEditRequest(selected) && styles.editButtonDisabled]}
                >
                  <Ionicons name="pencil-outline" size={18} color={canEditRequest(selected) ? '#1D5FA8' : '#A9AFAC'} />
                </Pressable>
              ) : null}
            </View>

            {selected && !editing ? (
              <View style={styles.detailList}>
                <DetailRow label="Service Code" value={display(selected.serviceRequestCode)} />
                <DetailRow label="Asset Code" value={display(selected.assetCode)} />
                <DetailRow label="Project" value={display(selected.projectCode)} />
                <DetailRow label="Operator Name" value={display(selected.operatorName)} />
                <DetailRow label="Phone Number" value={display(selected.phoneNumber)} />
                <DetailRow label="Maintenance Works" value={display(selected.maintenanceWorks)} />
                <DetailRow label="Requested Date" value={formatDate(selected.requestedDate)} />
                <DetailRow label="Submitted By" value={display(selected.submittedBy)} />
                <DetailRow label="Status" value={selected.isApproved ? 'Approved' : 'Pending'} />
              </View>
            ) : null}

            {selected && editing ? (
              <View style={styles.editForm}>
                <FormField label="Asset Code" autoCapitalize="characters" value={assetCode} onChangeText={setAssetCode} />
                <FormField label="Operator Name" value={operatorName} onChangeText={setOperatorName} />
                <FormField label="Phone Number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
                <FormField
                  label="Maintenance Works"
                  multiline
                  numberOfLines={4}
                  value={maintenanceWorks}
                  onChangeText={setMaintenanceWorks}
                  textAlignVertical="top"
                />
                <PrimaryButton title="Save Changes" onPress={saveEdit} loading={saving} />
              </View>
            ) : null}

            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, padding: 18, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  list: { gap: 8, paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#77807B', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E8E6',
  },
  assetCode: { flex: 1.2, fontSize: 13, fontWeight: '800', color: '#1D5FA8' },
  date: { flex: 1, color: '#7A817D', fontSize: 12 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusApproved: { backgroundColor: '#E1F1E9' },
  statusPending: { backgroundColor: '#FFF2D6' },
  statusText: { fontSize: 10, fontWeight: '900' },
  statusApprovedText: { color: '#176B4D' },
  statusPendingText: { color: '#9A6812' },
  divider: { width: 1, alignSelf: 'stretch', marginVertical: 4, backgroundColor: '#E5E8E6' },
  eyeButton: { padding: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C' },
  editButton: { padding: 6, backgroundColor: '#E4EDF8', borderRadius: 10 },
  editButtonDisabled: { backgroundColor: '#F0F2F1' },
  detailList: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { color: '#8B929A', fontSize: 13, fontWeight: '600' },
  detailValue: { color: '#17201C', fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  editForm: { gap: 14 },
  closeButton: { marginTop: 20, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
