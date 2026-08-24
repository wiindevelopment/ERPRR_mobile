import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
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
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

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
    const id = item.fuelReceivedId ?? item.id;
    try {
      setUpdatingId(id ?? null);
      await markFuelAsReceived(item, user.employeeCode);
      setItems(current => current.map(row =>
        (row.fuelReceivedId ?? row.id) === id ? { ...row, status: 'RECEIVED', receivedBy: user.employeeCode } : row,
      ));
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
        keyExtractor={(item, index) => String(item.fuelReceivedId ?? item.id ?? index)}
        contentContainerStyle={items.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No fuel received entries are assigned to you.</Text>}
        renderItem={({ item }) => {
          const id = item.fuelReceivedId ?? item.id;
          const isReceived = String(item.status ?? '').toUpperCase() === 'RECEIVED';
          const busy = updatingId === id;
          return (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{display(item.fuelType, 'Fuel Delivery')}</Text>
                <View style={[styles.status, isReceived ? styles.statusDone : styles.statusPending]}>
                  <Text style={[styles.statusText, isReceived ? styles.statusDoneText : styles.statusPendingText]}>
                    {isReceived ? 'RECEIVED' : display(item.status, 'PENDING')}
                  </Text>
                </View>
              </View>

              <Text style={styles.quantity}>{display(item.quantity ?? item.amount)} <Text style={styles.unit}>units</Text></Text>
              <Text style={styles.meta}>Date: {display(item.receivedDate ?? item.date)}</Text>
              <Text style={styles.meta}>Supplier: {display(item.supplier)}</Text>
              <Text style={styles.meta}>Vehicle: {display(item.vehicleNumber)}</Text>
              <Text style={styles.meta}>Reference: {display(item.referenceNo)}</Text>

              {!isReceived && (
                <Pressable disabled={busy} onPress={() => markReceived(item)} style={[styles.receiveButton, busy && styles.disabled]}>
                  {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.receiveButtonText}>Mark as Received</Text>}
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  list: { padding: 18, gap: 12, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  empty: { color: '#77807B', textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 16, borderWidth: 1, borderColor: '#E5E8E6', gap: 7 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  title: { flex: 1, fontSize: 17, fontWeight: '800', color: '#17201C' },
  quantity: { fontSize: 25, fontWeight: '900', color: '#176B4D', marginVertical: 2 },
  unit: { fontSize: 12, color: '#727A76', fontWeight: '600' },
  meta: { color: '#6E7672', fontSize: 13 },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusDone: { backgroundColor: '#E1F1E9' },
  statusPending: { backgroundColor: '#FFF2D6' },
  statusText: { fontSize: 10, fontWeight: '900' },
  statusDoneText: { color: '#176B4D' },
  statusPendingText: { color: '#9A6812' },
  receiveButton: { marginTop: 9, backgroundColor: '#176B4D', borderRadius: 12, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  receiveButtonText: { color: '#FFFFFF', fontWeight: '800' },
  disabled: { opacity: 0.55 },
});
