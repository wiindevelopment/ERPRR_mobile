import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getGinsReceivedBy } from '../api/services';
import { Gin } from '../types';

const PAGE_SIZE = 10;

function display(value: unknown, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function GoodsReceivedScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Gin[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<Gin | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (!user?.employeeCode) return;
    try {
      if (showLoader) setLoading(true);
      const data = await getGinsReceivedBy(user.employeeCode, 0, PAGE_SIZE);
      setItems(data.content ?? []);
      setPage(0);
      setTotalPages(data.totalPages ?? 0);
    } catch (error: any) {
      Alert.alert('Could not load goods received', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.employeeCode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const loadMore = async () => {
    if (!user?.employeeCode || loadingMore || refreshing || page + 1 >= totalPages) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getGinsReceivedBy(user.employeeCode, nextPage, PAGE_SIZE);
      setItems(current => [...current, ...(data.content ?? [])]);
      setPage(nextPage);
      setTotalPages(data.totalPages ?? totalPages);
    } catch (error: any) {
      Alert.alert('Could not load more', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.ginId ?? String(index)}
        contentContainerStyle={items.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} /> : null}
        ListEmptyComponent={<Text style={styles.empty}>No goods have been issued to you.</Text>}
        renderItem={({ item }) => {
          const arrived = !!item.isArrivalGateVerified;
          return (
            <View style={styles.row}>
              <Text style={styles.code} numberOfLines={1}>{display(item.ginCode)}</Text>
              <Text style={styles.date} numberOfLines={1}>{formatDate(item.issuedDate)}</Text>
              <View style={[styles.statusBadge, arrived ? styles.statusDone : styles.statusPending]}>
                <Text style={[styles.statusText, arrived ? styles.statusDoneText : styles.statusPendingText]}>
                  {arrived ? 'ARRIVED' : 'IN TRANSIT'}
                </Text>
              </View>
              <View style={styles.divider} />
              <Pressable style={styles.eyeButton} onPress={() => setSelected(item)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color="#176B4D" />
              </Pressable>
            </View>
          );
        }}
      />

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>GIN details</Text>
            {selected ? (
              <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailList} showsVerticalScrollIndicator>
                <DetailRow label="GIN Code" value={display(selected.ginCode)} />
                <DetailRow label="Issued Date" value={formatDate(selected.issuedDate)} />
                <DetailRow label="Issued Project" value={display(selected.issuedProjectCode)} />
                <DetailRow label="Received Project" value={display(selected.receivedProjectCode)} />
                <DetailRow label="Received Person" value={display(selected.receivedPerson)} />
                <DetailRow label="For Asset" value={display(selected.forAssetCode)} />
                <DetailRow label="Vehicle No" value={display(selected.vehicleNo)} />
                <DetailRow label="Vehicle Asset" value={display(selected.vehicleAssetCode)} />
                <DetailRow label="Receiver Name" value={display(selected.receiverName)} />
                <DetailRow label="Receiver NIC" value={display(selected.receiverNIC)} />
                <DetailRow label="Expected Return" value={display(selected.expectedReturnDate)} />
                <DetailRow label="Approved By" value={display(selected.approvedBy)} />
                <DetailRow label="Approved Date" value={formatDate(selected.approvedDate)} />
                <DetailRow label="Authorized" value={selected.isAuthorized ? 'Yes' : 'No'} />
                <DetailRow label="Gate Verified" value={selected.isGateVerified ? 'Yes' : 'No'} />
                <DetailRow label="Arrival Verified" value={selected.isArrivalGateVerified ? 'Yes' : 'No'} />
                <View style={styles.itemsSection}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemsTitle}>Item breakdown ({selected.items?.length ?? 0})</Text>
                    {selected.items?.some(lineItem => lineItem.amount != null) ? (
                      <Text style={styles.itemsTotal}>
                        Total {formatNumber(selected.items.reduce((sum, lineItem) => sum + (lineItem.amount ?? 0), 0))}
                      </Text>
                    ) : null}
                  </View>
                  {!selected.items?.length ? <Text style={styles.itemMeta}>No items on this GIN.</Text> : null}
                  {selected.items?.map((lineItem, index) => (
                      <View key={lineItem.ginItemId ?? index} style={styles.itemCard}>
                        <View style={styles.itemRow}>
                          <Text style={styles.itemIndex}>{index + 1}.</Text>
                          <Text style={styles.itemName}>{display(lineItem.description, lineItem.itemCode)}</Text>
                        </View>
                        <ItemField label="Item Code" value={lineItem.itemCode} />
                        <ItemField label="Size" value={lineItem.size} />
                        <ItemField label="Quantity" value={lineItem.quantity} />
                        <ItemField label="UOM" value={lineItem.uom} />
                        <ItemField label="Length (m)" value={lineItem.lengthM || undefined} />
                        <ItemField label="Width (m)" value={lineItem.widthM || undefined} />
                        <ItemField label="Unit Price" value={lineItem.unitPrice != null ? formatNumber(lineItem.unitPrice) : undefined} />
                        <ItemField label="Amount" value={lineItem.amount != null ? formatNumber(lineItem.amount) : undefined} />
                        <ItemField label="Asset Code" value={lineItem.assetCode} />
                        <ItemField label="Remarks" value={lineItem.remarks} />
                        {lineItem.packItems?.length ? (
                          <View style={styles.packList}>
                            <Text style={styles.packTitle}>Pack items</Text>
                            {lineItem.packItems.map((pack, packIndex) => (
                              <View key={pack.packItemId ?? packIndex} style={styles.packRow}>
                                <Ionicons
                                  name={pack.included ? 'checkmark-circle' : 'close-circle'}
                                  size={14}
                                  color={pack.included ? '#176B4D' : '#A9AFAC'}
                                />
                                <Text style={styles.packName}>{display(pack.name)}</Text>
                                <Text style={styles.itemQty}>{display(pack.quantity)}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    ))}
                </View>
              </ScrollView>
            ) : null}
            <Pressable style={styles.closeButton} onPress={() => setSelected(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ItemField({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.itemFieldRow}>
      <Text style={styles.itemFieldLabel}>{label}</Text>
      <Text style={styles.itemFieldValue}>{String(value)}</Text>
    </View>
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
  footerLoader: { marginVertical: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E8E6',
  },
  code: { flex: 1.3, fontSize: 13, fontWeight: '800', color: '#176B4D' },
  date: { flex: 1, color: '#7A817D', fontSize: 12 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusDone: { backgroundColor: '#E1F1E9' },
  statusPending: { backgroundColor: '#FFF2D6' },
  statusText: { fontSize: 10, fontWeight: '900' },
  statusDoneText: { color: '#176B4D' },
  statusPendingText: { color: '#9A6812' },
  divider: { width: 1, alignSelf: 'stretch', marginVertical: 4, backgroundColor: '#E5E8E6' },
  eyeButton: { padding: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C', marginBottom: 14 },
  detailScroll: { flexShrink: 1 },
  detailList: { gap: 12, paddingBottom: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { color: '#8B929A', fontSize: 13, fontWeight: '600' },
  detailValue: { color: '#17201C', fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  itemsSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#EEF0EF', paddingTop: 12, gap: 8 },
  itemsTitle: { fontSize: 13, fontWeight: '800', color: '#343A40' },
  itemCard: { backgroundColor: '#F7F8FA', borderRadius: 10, padding: 10, gap: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  itemName: { flex: 1, color: '#17201C', fontSize: 13, fontWeight: '700' },
  itemQty: { color: '#6E7672', fontSize: 13, fontWeight: '700' },
  itemMeta: { color: '#7A817D', fontSize: 12 },
  itemsTotal: { color: '#176B4D', fontSize: 13, fontWeight: '800' },
  itemIndex: { color: '#176B4D', fontSize: 13, fontWeight: '800' },
  itemFieldRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  itemFieldLabel: { color: '#8B929A', fontSize: 12, fontWeight: '600' },
  itemFieldValue: { color: '#17201C', fontSize: 12, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  packList: { marginTop: 6, gap: 4, borderTopWidth: 1, borderTopColor: '#E5E8E6', paddingTop: 6 },
  packTitle: { color: '#343A40', fontSize: 12, fontWeight: '800' },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  packName: { flex: 1, color: '#49504C', fontSize: 12 },
  closeButton: { marginTop: 20, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
