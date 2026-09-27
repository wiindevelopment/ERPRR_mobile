import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from './PrimaryButton';
import { Gin, PaginatedResponse, StockReturn } from '../types';

function display(value: unknown, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

type Props = {
  ginLabel: string;
  returnLabel: string;
  accentColor: string;
  fetchGins: (projectCode: string) => Promise<PaginatedResponse<Gin>>;
  fetchReturns: (projectCode: string) => Promise<PaginatedResponse<StockReturn>>;
  ginVerified: (item: Gin) => boolean;
  returnVerified: (item: StockReturn) => boolean;
  ginFilter?: (item: Gin) => boolean;
  returnFilter?: (item: StockReturn) => boolean;
  onVerifyGin?: (item: Gin) => Promise<Gin>;
  onVerifyReturn?: (item: StockReturn) => Promise<StockReturn>;
};

export default function GinReturnTabList({
  ginLabel, returnLabel, accentColor, fetchGins, fetchReturns, ginVerified, returnVerified, ginFilter, returnFilter,
  onVerifyGin, onVerifyReturn,
}: Props) {
  const { selectedProject } = useAuth();
  const [activeTab, setActiveTab] = useState<'GIN' | 'RETURN'>('GIN');
  const [gins, setGins] = useState<Gin[]>([]);
  const [returns, setReturns] = useState<StockReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGin, setSelectedGin] = useState<Gin | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<StockReturn | null>(null);
  const [verifying, setVerifying] = useState(false);

  const load = useCallback(async (showLoader = true) => {
    if (!selectedProject?.projectCode) return;
    try {
      if (showLoader) setLoading(true);
      const [ginData, returnData] = await Promise.all([
        fetchGins(selectedProject.projectCode),
        fetchReturns(selectedProject.projectCode),
      ]);
      const ginContent = ginData.content ?? [];
      const returnContent = returnData.content ?? [];
      setGins(ginFilter ? ginContent.filter(ginFilter) : ginContent);
      setReturns(returnFilter ? returnContent.filter(returnFilter) : returnContent);
    } catch (error: any) {
      Alert.alert('Could not load records', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedProject?.projectCode, fetchGins, fetchReturns, ginFilter, returnFilter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleVerifyGin = async () => {
    if (!selectedGin || !onVerifyGin) return;
    try {
      setVerifying(true);
      const updated = await onVerifyGin(selectedGin);
      setSelectedGin(updated);
      setGins(current => current.map(item => (item.ginId === updated.ginId ? updated : item)));
    } catch (error: any) {
      Alert.alert('Verification failed', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyReturn = async () => {
    if (!selectedReturn || !onVerifyReturn) return;
    try {
      setVerifying(true);
      const updated = await onVerifyReturn(selectedReturn);
      setSelectedReturn(updated);
      setReturns(current => current.map(item => (item.stockReturnId === updated.stockReturnId ? updated : item)));
    } catch (error: any) {
      Alert.alert('Verification failed', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'GIN' && styles.tabActive]}
            onPress={() => setActiveTab('GIN')}
          >
            <Text style={[styles.tabText, activeTab === 'GIN' && { color: accentColor }]}>{ginLabel}</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'RETURN' && styles.tabActive]}
            onPress={() => setActiveTab('RETURN')}
          >
            <Text style={[styles.tabText, activeTab === 'RETURN' && { color: accentColor }]}>{returnLabel}</Text>
          </Pressable>
        </View>

        {activeTab === 'GIN' ? (
          <FlatList
            data={gins}
            keyExtractor={(item, index) => item.ginId ?? String(index)}
            contentContainerStyle={gins.length ? styles.list : styles.emptyList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {selectedProject ? `No ${ginLabel.toLowerCase()} yet.` : 'Select a project on the home screen first.'}
              </Text>
            }
            renderItem={({ item }) => {
              const verified = ginVerified(item);
              return (
                <View style={styles.row}>
                  <Text style={[styles.code, { color: accentColor }]} numberOfLines={1}>{display(item.ginCode)}</Text>
                  <View style={[styles.statusBadge, verified ? styles.statusVerified : styles.statusPending]}>
                    <Text style={[styles.statusText, verified ? styles.statusVerifiedText : styles.statusPendingText]}>
                      {verified ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <Pressable style={styles.eyeButton} onPress={() => setSelectedGin(item)} hitSlop={8}>
                    <Ionicons name="eye-outline" size={20} color={accentColor} />
                  </Pressable>
                </View>
              );
            }}
          />
        ) : (
          <FlatList
            data={returns}
            keyExtractor={(item, index) => item.stockReturnId ?? String(index)}
            contentContainerStyle={returns.length ? styles.list : styles.emptyList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {selectedProject ? `No ${returnLabel.toLowerCase()} yet.` : 'Select a project on the home screen first.'}
              </Text>
            }
            renderItem={({ item }) => {
              const verified = returnVerified(item);
              return (
                <View style={styles.row}>
                  <Text style={[styles.code, { color: accentColor }]} numberOfLines={1}>{display(item.stockReturnCode)}</Text>
                  <View style={[styles.statusBadge, verified ? styles.statusVerified : styles.statusPending]}>
                    <Text style={[styles.statusText, verified ? styles.statusVerifiedText : styles.statusPendingText]}>
                      {verified ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <Pressable style={styles.eyeButton} onPress={() => setSelectedReturn(item)} hitSlop={8}>
                    <Ionicons name="eye-outline" size={20} color={accentColor} />
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </View>

      <Modal visible={!!selectedGin} animationType="slide" transparent onRequestClose={() => setSelectedGin(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedGin(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>GIN details</Text>
            {selectedGin ? (
              <View style={styles.detailList}>
                <DetailRow label="GIN Code" value={display(selectedGin.ginCode)} />
                <DetailRow label="Issued Project" value={display(selectedGin.issuedProjectCode)} />
                <DetailRow label="Received Project" value={display(selectedGin.receivedProjectCode)} />
                <DetailRow label="Issued Date" value={formatDate(selectedGin.issuedDate)} />
                <DetailRow label="Expected Return" value={display(selectedGin.expectedReturnDate)} />
                <DetailRow label="Vehicle No" value={display(selectedGin.vehicleNo)} />
                <DetailRow label="Received Person" value={display(selectedGin.receivedPerson)} />
                <DetailRow label="Receiver Name" value={display(selectedGin.receiverName)} />
                <DetailRow label="Approved By" value={display(selectedGin.approvedBy)} />
                <DetailRow label="Authorized" value={selectedGin.isAuthorized ? 'Yes' : 'No'} />
                <DetailRow label="Gate Verified" value={selectedGin.isGateVerified ? 'Yes' : 'No'} />
                <DetailRow label="Arrival Verified" value={selectedGin.isArrivalGateVerified ? 'Yes' : 'No'} />
                {selectedGin.items?.length ? (
                  <View style={styles.itemsSection}>
                    <Text style={styles.itemsTitle}>Items</Text>
                    {selectedGin.items.map((lineItem, index) => (
                      <View key={lineItem.ginItemId ?? index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{display(lineItem.description, lineItem.itemCode)}</Text>
                        <Text style={styles.itemQty}>{display(lineItem.quantity)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
            {selectedGin && onVerifyGin && !ginVerified(selectedGin) ? (
              <View style={styles.verifyButtonWrap}>
                <PrimaryButton title="Verify Arrival" onPress={handleVerifyGin} loading={verifying} />
              </View>
            ) : null}
            <Pressable style={styles.closeButton} onPress={() => setSelectedGin(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!selectedReturn} animationType="slide" transparent onRequestClose={() => setSelectedReturn(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedReturn(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Return details</Text>
            {selectedReturn ? (
              <View style={styles.detailList}>
                <DetailRow label="Return Code" value={display(selectedReturn.stockReturnCode)} />
                <DetailRow label="From Project" value={display(selectedReturn.fromProjectCode)} />
                <DetailRow label="To Project" value={display(selectedReturn.toProjectCode)} />
                <DetailRow label="Return Type" value={display(selectedReturn.returnType)} />
                <DetailRow label="Reason" value={display(selectedReturn.reason)} />
                <DetailRow label="Return Date" value={formatDate(selectedReturn.returnDate)} />
                <DetailRow label="Return By" value={display(selectedReturn.returnBy)} />
                <DetailRow label="Approved By" value={display(selectedReturn.approvedBy)} />
                <DetailRow label="Approved" value={selectedReturn.isApproved ? 'Yes' : 'No'} />
                <DetailRow label="Gate Verified" value={selectedReturn.isGateVerified ? 'Yes' : 'No'} />
                <DetailRow label="Arrival Verified" value={selectedReturn.isArrivalGateVerified ? 'Yes' : 'No'} />
                <DetailRow label="Remark" value={display(selectedReturn.remark)} />
                {selectedReturn.items?.length ? (
                  <View style={styles.itemsSection}>
                    <Text style={styles.itemsTitle}>Items</Text>
                    {selectedReturn.items.map((lineItem, index) => (
                      <View key={lineItem.stockReturnItemId ?? index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{display(lineItem.description, lineItem.itemCode)}</Text>
                        <Text style={styles.itemQty}>{display(lineItem.quantity)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
            {selectedReturn && onVerifyReturn && !returnVerified(selectedReturn) ? (
              <View style={styles.verifyButtonWrap}>
                <PrimaryButton title="Verify Arrival" onPress={handleVerifyReturn} loading={verifying} />
              </View>
            ) : null}
            <Pressable style={styles.closeButton} onPress={() => setSelectedReturn(null)}>
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
  container: { flex: 1, padding: 18, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  tabs: { flexDirection: 'row', backgroundColor: '#ECEFED', borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, borderRadius: 9, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6B7278' },
  list: { gap: 8, paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#77807B', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E8E6',
  },
  code: { flex: 1, fontSize: 13, fontWeight: '800' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusVerified: { backgroundColor: '#E1F1E9' },
  statusPending: { backgroundColor: '#FFF2D6' },
  statusText: { fontSize: 10, fontWeight: '900' },
  statusVerifiedText: { color: '#176B4D' },
  statusPendingText: { color: '#9A6812' },
  divider: { width: 1, alignSelf: 'stretch', marginVertical: 4, backgroundColor: '#E5E8E6' },
  eyeButton: { padding: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C', marginBottom: 14 },
  detailList: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detailLabel: { color: '#8B929A', fontSize: 13, fontWeight: '600' },
  detailValue: { color: '#17201C', fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  itemsSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#EEF0EF', paddingTop: 12, gap: 8 },
  itemsTitle: { fontSize: 13, fontWeight: '800', color: '#343A40' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { flex: 1, color: '#17201C', fontSize: 13 },
  itemQty: { color: '#6E7672', fontSize: 13, fontWeight: '700' },
  verifyButtonWrap: { marginTop: 16 },
  closeButton: { marginTop: 20, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
