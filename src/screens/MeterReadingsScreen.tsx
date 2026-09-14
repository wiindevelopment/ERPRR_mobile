import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { getMeterReadings, updateMeterReading } from '../api/services';
import { MeterReading } from '../types';
import PrimaryButton from '../components/PrimaryButton';
import FormField from '../components/FormField';

const METER_TYPES = ['Odometer - km', 'Hour meter - hr'];

function getUnit(meterType: string) {
  return meterType.split(' - ')[1] ?? '';
}

export default function MeterReadingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'MeterReadings'>) {
  const { user } = useAuth();
  const [items, setItems] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<MeterReading | null>(null);
  const [editing, setEditing] = useState(false);
  const [meterType, setMeterType] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (showLoader = true) => {
    if (!user?.employeeCode) return;
    try {
      if (showLoader) setLoading(true);
      const data = await getMeterReadings(user.employeeCode);
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Could not load readings', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.employeeCode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const readingError = useMemo(() => {
    const current = Number(readingValue);
    const previous = Number(previousReading);
    if (!readingValue || !previousReading || Number.isNaN(current) || Number.isNaN(previous)) return null;
    if (current <= previous) return 'Reading value must be higher than the previous reading.';
    return null;
  }, [readingValue, previousReading]);

  const openDetails = (item: MeterReading) => {
    setSelected(item);
    setEditing(false);
  };

  const startEdit = () => {
    if (!selected) return;
    setMeterType(selected.meterType);
    setReadingValue(String(selected.readingValue));
    setPreviousReading(String(selected.previousReading));
    setRemarks(selected.remarks ?? '');
    setEditing(true);
  };

  const closeModal = () => {
    setSelected(null);
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!selected?.meterReadingId) return;
    const current = Number(readingValue);
    const previous = Number(previousReading);

    if (!readingValue || Number.isNaN(current) || !previousReading || Number.isNaN(previous)) {
      Alert.alert('Check inputs', 'Enter a valid reading value and previous reading value.');
      return;
    }
    if (readingError) {
      Alert.alert('Invalid reading', readingError);
      return;
    }

    try {
      setSaving(true);
      const updated = await updateMeterReading(selected.meterReadingId, {
        ...selected,
        meterType,
        readingValue: current,
        previousReading: previous,
        usageValue: current - previous,
        remarks: remarks.trim(),
      });
      setItems(current => current.map(row => (row.meterReadingId === selected.meterReadingId ? updated : row)));
      setSelected(updated);
      setEditing(false);
      Alert.alert('Saved', 'Meter reading updated successfully.');
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
        <PrimaryButton title="+ Add Meter Reading" onPress={() => navigation.navigate('AddMeterReading')} />

        <FlatList
          data={items}
          keyExtractor={(item, index) => item.meterReadingId ?? String(index)}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
          ListEmptyComponent={<Text style={styles.empty}>No meter readings recorded by you yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.assetCode} numberOfLines={1}>{item.assetCode}</Text>
              <Text style={styles.value} numberOfLines={1}>{item.readingValue} {getUnit(item.meterType)}</Text>
              <Text style={styles.date} numberOfLines={1}>{item.readingDate}</Text>
              <View style={styles.divider} />
              <Pressable style={styles.eyeButton} onPress={() => openDetails(item)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color="#176B4D" />
              </Pressable>
            </View>
          )}
        />
      </View>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={closeModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'Edit reading' : 'Reading details'}</Text>
              {selected && !editing ? (
                <Pressable onPress={startEdit} hitSlop={8} style={styles.editButton}>
                  <Ionicons name="pencil-outline" size={18} color="#176B4D" />
                </Pressable>
              ) : null}
            </View>

            {selected && !editing ? (
              <View style={styles.detailList}>
                <DetailRow label="Asset Code" value={selected.assetCode} />
                <DetailRow label="Meter Type" value={selected.meterType} />
                <DetailRow label="Reading Date" value={selected.readingDate} />
                <DetailRow label="Reading Value" value={`${selected.readingValue} ${getUnit(selected.meterType)}`} />
                <DetailRow label="Previous Reading" value={`${selected.previousReading} ${getUnit(selected.meterType)}`} />
                <DetailRow label="Usage" value={`${selected.usageValue} ${getUnit(selected.meterType)}`} />
                <DetailRow label="Recorded By" value={selected.recordedBy} />
                <DetailRow label="Remarks" value={selected.remarks || 'No remarks'} />
              </View>
            ) : null}

            {selected && editing ? (
              <View style={styles.editForm}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Meter Type</Text>
                  <View style={styles.chips}>
                    {METER_TYPES.map(type => {
                      const isSelected = meterType === type;
                      return (
                        <Pressable key={type} style={[styles.chip, isSelected && styles.chipSelected]} onPress={() => setMeterType(type)}>
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{type}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <FormField label="Reading Value" keyboardType="decimal-pad" value={readingValue} onChangeText={setReadingValue} />
                <FormField label="Previous Reading" keyboardType="decimal-pad" value={previousReading} onChangeText={setPreviousReading} />
                {readingError ? <Text style={styles.errorText}>{readingError}</Text> : null}
                <FormField label="Remarks" placeholder="Optional remarks" multiline numberOfLines={3} value={remarks} onChangeText={setRemarks} textAlignVertical="top" />
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
  assetCode: { flex: 1.2, fontSize: 13, fontWeight: '800', color: '#176B4D' },
  value: { flex: 1, fontSize: 14, fontWeight: '800', color: '#171C19' },
  date: { flex: 1, color: '#7A817D', fontSize: 12 },
  divider: { width: 1, alignSelf: 'stretch', marginVertical: 4, backgroundColor: '#E5E8E6' },
  eyeButton: { padding: 4 },
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
  editForm: { gap: 14 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chipSelected: { backgroundColor: '#E4F0EB', borderColor: '#176B4D' },
  chipText: { color: '#5C6460', fontWeight: '700' },
  chipTextSelected: { color: '#176B4D' },
  errorText: { fontSize: 12, fontWeight: '700', color: '#C0392B', marginTop: -8 },
  closeButton: { marginTop: 20, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
