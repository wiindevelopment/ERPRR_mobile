import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getFuelReceived, markFuelAsReceived } from '../api/services';
import { FuelReceived } from '../types';

function display(value: unknown, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

export default function FuelReceivedScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<FuelReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<FuelReceived | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (!user?.employeeCode) return;
    try {
      if (showLoader) setLoading(true);
      const data = await getFuelReceived(user.employeeCode);
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Could not load fuel entries', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.employeeCode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markReceived = async (item: FuelReceived) => {
    if (!user?.employeeCode) return;
    try {
      setUpdatingId(item.fuelIssueId);
      await markFuelAsReceived(item.fuelIssueId);
      const updated = { ...item, isReceived: true, receivedBy: user.employeeCode };
      setItems(current => current.map(row => (row.fuelIssueId === item.fuelIssueId ? updated : row)));
      setSelected(current => (current?.fuelIssueId === item.fuelIssueId ? updated : current));
    } catch (error: any) {
      Alert.alert('Update failed', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.fuelIssueId ?? String(index)}
        contentContainerStyle={items.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No fuel issues are assigned to you.</Text>}
        renderItem={({ item }) => {
          const isReceived = !!item.isReceived;
          return (
            <View style={styles.row}>
              <Text style={styles.assetCode} numberOfLines={1}>{display(item.assetCode)}</Text>
              <Text style={styles.value} numberOfLines={1}>{display(item.quantity)} {display(item.fuelType, '')}</Text>
              <Text style={styles.date} numberOfLines={1}>{display(item.issuedDate)}</Text>
              <View style={[styles.statusDot, isReceived ? styles.statusDotDone : styles.statusDotPending]} />
              <View style={styles.divider} />
              <Pressable style={styles.eyeButton} onPress={() => setSelected(item)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color="#176B4D" />
              </Pressable>
            </View>
          );
        }}
      />

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fuel issue details</Text>
              {selected ? (
                <View style={[styles.status, selected.isReceived ? styles.statusDone : styles.statusPending]}>
                  <Text style={[styles.statusText, selected.isReceived ? styles.statusDoneText : styles.statusPendingText]}>
                    {selected.isReceived ? 'RECEIVED' : 'PENDING'}
                  </Text>
                </View>
              ) : null}
            </View>

            {selected ? (
              <View style={styles.detailList}>
                <DetailRow label="Asset Code" value={display(selected.assetCode)} />
                <DetailRow label="Fuel Type" value={display(selected.fuelType)} />
                <DetailRow label="Quantity" value={display(selected.quantity)} />
                <DetailRow label="Issue Code" value={display(selected.fuelIssueCode)} />
                <DetailRow label="Issued Date" value={display(selected.issuedDate)} />
                <DetailRow label="Project" value={display(selected.projectCode)} />
                <DetailRow label="Issued By" value={display(selected.issuedBy)} />
                <DetailRow label="Received By" value={display(selected.receivedBy)} />
                <DetailRow label="Meter Reading" value={display(selected.meterReading)} />
                <DetailRow label="Remarks" value={selected.remarks || 'No remarks'} />
              </View>
            ) : null}

            {selected && !selected.isReceived ? (
              <Pressable
                disabled={updatingId === selected.fuelIssueId}
                onPress={() => markReceived(selected)}
                style={[styles.receiveButton, updatingId === selected.fuelIssueId && styles.disabled]}
              >
                {updatingId === selected.fuelIssueId ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.receiveButtonText}>Mark as Received</Text>
                )}
              </Pressable>
            ) : null}

            <Pressable style={styles.closeButton} onPress={() => setSelected(null)}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  list: { padding: 18, gap: 8, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  empty: { color: '#77807B', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E8E6',
  },
  assetCode: { flex: 1.2, fontSize: 13, fontWeight: '800', color: '#176B4D' },
  value: { flex: 1, fontSize: 14, fontWeight: '800', color: '#171C19' },
  date: { flex: 1, color: '#7A817D', fontSize: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotDone: { backgroundColor: '#176B4D' },
  statusDotPending: { backgroundColor: '#C98A1B' },
  divider: { width: 1, alignSelf: 'stretch', marginVertical: 4, backgroundColor: '#E5E8E6' },
  eyeButton: { padding: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C' },
  detailList: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { color: '#8B929A', fontSize: 13, fontWeight: '600' },
  detailValue: { color: '#17201C', fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusDone: { backgroundColor: '#E1F1E9' },
  statusPending: { backgroundColor: '#FFF2D6' },
  statusText: { fontSize: 10, fontWeight: '900' },
  statusDoneText: { color: '#176B4D' },
  statusPendingText: { color: '#9A6812' },
  receiveButton: { marginTop: 20, backgroundColor: '#176B4D', borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  receiveButtonText: { color: '#FFFFFF', fontWeight: '800' },
  disabled: { opacity: 0.55 },
  closeButton: { marginTop: 12, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
