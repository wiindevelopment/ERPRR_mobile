import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { getVehicleFuelLogs, updateVehicleFuelLog } from '../api/services';
import { VehicleFuelLog } from '../types';
import { formatNumber } from '../utils/number';
import PrimaryButton from '../components/PrimaryButton';
import KeyboardAwareScrollView, { useModalKeyboardInset } from '../components/KeyboardAwareScrollView';
import { fuelTypeName, useFuelTypes } from '../components/FuelTypeSelect';
import VehicleFuelLogForm, { FuelLogFormValues, fuelLogPayload, fuelLogToValues, validateFuelLog } from '../components/VehicleFuelLogForm';

function formatFuelDate(value: string) {
  // Parse YYYY-MM-DD as a local date so it doesn't shift a day in other time zones.
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function display(value: unknown, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

export default function VehicleFuelLogsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'VehicleFuelLogs'>) {
  const { user } = useAuth();
  const { fuelTypes, loading: fuelTypesLoading } = useFuelTypes();
  const [items, setItems] = useState<VehicleFuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<VehicleFuelLog | null>(null);
  const [editValues, setEditValues] = useState<FuelLogFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const keyboardHeight = useModalKeyboardInset();

  const load = useCallback(async (showLoader = true) => {
    if (!user?.employeeCode) return;
    try {
      if (showLoader) setLoading(true);
      const data = await getVehicleFuelLogs(user.employeeCode);
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Could not load fuel logs', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.employeeCode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const closeModal = () => {
    setSelected(null);
    setEditValues(null);
  };

  const saveEdit = async () => {
    if (!selected?.vehicleFuelLogId || !editValues || !user?.employeeCode) return;
    const error = validateFuelLog(editValues);
    if (error) {
      Alert.alert('Check inputs', error);
      return;
    }

    try {
      setSaving(true);
      const updated = await updateVehicleFuelLog(selected.vehicleFuelLogId, fuelLogPayload(editValues, selected.driver || user.employeeCode, selected));
      setItems(current => current.map(row => (row.vehicleFuelLogId === selected.vehicleFuelLogId ? updated : row)));
      setSelected(updated);
      setEditValues(null);
      Alert.alert('Saved', 'Fuel log updated successfully.');
    } catch (error: any) {
      Alert.alert('Could not save', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  const editing = !!editValues;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <PrimaryButton title="+ Add Fuel Log" onPress={() => navigation.navigate('AddVehicleFuelLog')} />

        <FlatList
          data={items}
          keyExtractor={(item, index) => item.vehicleFuelLogId ?? String(index)}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
          ListEmptyComponent={<Text style={styles.empty}>No fuel logs recorded by you yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.assetCode} numberOfLines={1}>{item.assetCode}</Text>
                <Text style={styles.station} numberOfLines={1}>{item.fillingStationName}</Text>
              </View>
              <View style={styles.rowAmounts}>
                <Text style={styles.value} numberOfLines={1}>{formatNumber(item.fuelQuantity)} L</Text>
                <Text style={styles.date} numberOfLines={1}>{formatFuelDate(item.fuelDate)}</Text>
              </View>
              <View style={styles.divider} />
              <Pressable style={styles.eyeButton} onPress={() => setSelected(item)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color="#176B4D" />
              </Pressable>
            </View>
          )}
        />
      </View>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={[styles.modalBackdrop, { paddingBottom: keyboardHeight }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit fuel log' : 'Fuel log details'}</Text>
              {selected && !editing ? (
                <Pressable onPress={() => setEditValues(fuelLogToValues(selected))} hitSlop={8} style={styles.editButton}>
                  <Ionicons name="pencil-outline" size={18} color="#176B4D" />
                </Pressable>
              ) : null}
            </View>

            <KeyboardAwareScrollView style={styles.modalScroll} padForKeyboard={false}>
              {selected && !editing ? (
                <View style={styles.detailList}>
                  <DetailRow label="Asset Code" value={display(selected.assetCode)} />
                  <DetailRow label="Fuel Date" value={formatFuelDate(selected.fuelDate)} />
                  <DetailRow label="Filling Station" value={display(selected.fillingStationName)} />
                  <DetailRow label="Location" value={display(selected.fillingStationLocation)} />
                  <DetailRow label="Fuel Type" value={display(fuelTypeName(fuelTypes, selected.fuelType))} />
                  <DetailRow label="Quantity" value={`${formatNumber(selected.fuelQuantity)} L`} />
                  <DetailRow label="Price per Liter" value={formatNumber(selected.pricePerLiter, 2)} />
                  <DetailRow label="Total Amount" value={formatNumber(selected.totalAmount, 2)} />
                  <DetailRow label="Odometer" value={selected.odometerReading != null ? `${formatNumber(selected.odometerReading)} km` : '-'} />
                  <DetailRow label="Payment Method" value={display(selected.paymentMethod)} />
                  <DetailRow label="Driver" value={display(selected.driverName, selected.driver)} />
                  <DetailRow label="Remarks" value={selected.remarks || 'No remarks'} />
                </View>
              ) : null}

              {editValues ? (
                <View style={styles.editForm}>
                  <VehicleFuelLogForm values={editValues} onChange={setEditValues} fuelTypes={fuelTypes} fuelTypesLoading={fuelTypesLoading} />
                  <PrimaryButton title="Save Changes" onPress={saveEdit} loading={saving} />
                </View>
              ) : null}
            </KeyboardAwareScrollView>

            <Pressable style={styles.closeButton} onPress={editing ? () => setEditValues(null) : closeModal}>
              <Text style={styles.closeButtonText}>{editing ? 'Cancel' : 'Close'}</Text>
            </Pressable>
          </View>
        </View>
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
  rowMain: { flex: 1.3, gap: 2 },
  rowAmounts: { flex: 1, gap: 2, alignItems: 'flex-end' },
  assetCode: { fontSize: 13, fontWeight: '800', color: '#176B4D' },
  station: { fontSize: 12, color: '#5C6460' },
  value: { fontSize: 14, fontWeight: '800', color: '#171C19' },
  date: { color: '#7A817D', fontSize: 12 },
  divider: { width: 1, alignSelf: 'stretch', marginVertical: 4, backgroundColor: '#E5E8E6' },
  eyeButton: { padding: 4 },
  modalScroll: { flexShrink: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C' },
  editButton: { padding: 6, backgroundColor: '#E7F1ED', borderRadius: 10 },
  detailList: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { color: '#8B929A', fontSize: 13, fontWeight: '600' },
  detailValue: { color: '#17201C', fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  editForm: { gap: 16 },
  closeButton: { marginTop: 20, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
