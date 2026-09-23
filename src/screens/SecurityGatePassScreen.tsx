import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getGatePasses } from '../storage/gatePasses';
import { GatePass, GatePassStatus } from '../types';

const TABS: { key: GatePassStatus; label: string }[] = [
  { key: 'INCOMING', label: 'Incoming' },
  { key: 'CREATED', label: 'Created' },
  { key: 'RETURNED', label: 'Returns' },
];

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export default function SecurityGatePassScreen() {
  const { selectedProject } = useAuth();
  const [activeTab, setActiveTab] = useState<GatePassStatus>('CREATED');
  const [items, setItems] = useState<GatePass[]>([]);
  const [selected, setSelected] = useState<GatePass | null>(null);

  const load = useCallback(async () => {
    if (!selectedProject?.projectCode) return;
    const data = await getGatePasses(selectedProject.projectCode);
    setItems(data);
  }, [selectedProject?.projectCode]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => items.filter(item => item.status === activeTab), [items, activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.tabs}>
          {TABS.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.passId ?? String(index)}
          contentContainerStyle={filtered.length ? styles.list : styles.emptyList}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {selectedProject ? 'No records in this category yet.' : 'Select a project on the home screen first.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.code} numberOfLines={1}>{item.passCode ?? '—'}</Text>
              <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
              <Text style={styles.date} numberOfLines={1}>{formatDate(item.createdDate)}</Text>
              <View style={styles.divider} />
              <Pressable style={styles.eyeButton} onPress={() => setSelected(item)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color="#6A3FA0" />
              </Pressable>
            </View>
          )}
        />
      </View>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Gate pass details</Text>
            {selected ? (
              <View style={styles.detailList}>
                <DetailRow label="Pass Code" value={selected.passCode ?? '-'} />
                <DetailRow label="Status" value={TABS.find(t => t.key === selected.status)?.label ?? selected.status} />
                <DetailRow label="Description" value={selected.description} />
                {selected.quantity !== undefined ? <DetailRow label="Quantity" value={String(selected.quantity)} /> : null}
                <DetailRow label="Project" value={selected.projectCode} />
                <DetailRow label="Issued By" value={selected.issuedBy ?? '-'} />
                <DetailRow label="Created By" value={selected.createdBy} />
                <DetailRow label="Date" value={formatDate(selected.createdDate)} />
                <DetailRow label="Remarks" value={selected.remarks || 'No remarks'} />
              </View>
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
  container: { flex: 1, padding: 18, gap: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#ECEFED', borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, borderRadius: 9, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6B7278' },
  tabTextActive: { color: '#6A3FA0' },
  list: { gap: 8, paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#77807B', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E8E6',
  },
  code: { flex: 1, fontSize: 13, fontWeight: '800', color: '#6A3FA0' },
  description: { flex: 1.3, fontSize: 13, fontWeight: '700', color: '#171C19' },
  date: { flex: 1, color: '#7A817D', fontSize: 12 },
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
  closeButton: { marginTop: 20, backgroundColor: '#ECEFED', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeButtonText: { color: '#49504C', fontWeight: '800' },
});
