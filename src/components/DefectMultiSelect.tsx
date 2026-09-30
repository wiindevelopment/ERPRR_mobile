import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getServiceFaultTypes } from '../api/services';
import { ServiceFaultType } from '../types';

type Props = {
  label: string;
  value: string[];
  onChange: (defects: string[]) => void;
};

export default function DefectMultiSelect({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [faults, setFaults] = useState<ServiceFaultType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFaults = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getServiceFaultTypes();
      const list = (Array.isArray(data) ? data : []).filter(fault => fault.label?.trim());
      list.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
      setFaults(list);
    } catch (error: any) {
      setLoadError(error?.response?.data?.message ?? error?.message ?? 'Could not load defects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFaults(); }, [loadFaults]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faults;
    return faults.filter(fault => fault.label.toLowerCase().includes(query));
  }, [faults, search]);

  const toggle = (defect: string) => {
    onChange(value.includes(defect) ? value.filter(item => item !== defect) : [...value, defect]);
  };

  const remove = (defect: string) => onChange(value.filter(item => item !== defect));

  const openPicker = () => {
    setSearch('');
    setOpen(true);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        {value.length ? (
          value.map(defect => (
            <View key={defect} style={styles.selectedRow}>
              <Text style={styles.selectedText}>{defect}</Text>
              <Pressable onPress={() => remove(defect)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#A9AFAC" />
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.placeholder}>No defects selected</Text>
        )}
        <Pressable style={styles.addButton} onPress={openPicker}>
          <Ionicons name="add-circle-outline" size={18} color="#1D5FA8" />
          <Text style={styles.addButtonText}>{value.length ? 'Add / change defects' : 'Select defects'}</Text>
        </Pressable>
      </View>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select defects</Text>
            <Text style={styles.modalCount}>{value.length} selected</Text>
          </View>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#8B929A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search defect"
              placeholderTextColor="#8B929A"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close" size={18} color="#8B929A" />
              </Pressable>
            ) : null}
          </View>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" />
          ) : loadError ? (
            <View style={styles.errorWrap}>
              <Text style={styles.empty}>{loadError}</Text>
              <Pressable style={styles.retryButton} onPress={loadFaults}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item, index) => item.faultCode ?? String(index)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.empty}>{search ? `No defects match "${search}".` : 'No defects available.'}</Text>
              }
              renderItem={({ item }) => {
                const checked = value.includes(item.label);
                return (
                  <Pressable style={[styles.option, checked && styles.optionChecked]} onPress={() => toggle(item.label)}>
                    <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color={checked ? '#176B4D' : '#8B929A'} />
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionText}>{item.label}</Text>
                      {item.category ? <Text style={styles.optionCategory}>{item.category}</Text> : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
          <Pressable style={styles.doneButton} onPress={() => setOpen(false)}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  box: {
    borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, backgroundColor: '#FFFFFF',
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  placeholder: { color: '#8B929A', fontSize: 15 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  selectedText: { flex: 1, fontSize: 15, color: '#15191D' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  addButtonText: { color: '#1D5FA8', fontWeight: '700' },
  modalSafe: { flex: 1, backgroundColor: '#F7F8FA' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C' },
  modalCount: { color: '#176B4D', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 18, marginBottom: 10,
    borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 12,
  },
  searchInput: { flex: 1, minHeight: 46, fontSize: 15, color: '#15191D' },
  list: { paddingHorizontal: 18, paddingBottom: 18, gap: 6 },
  empty: { color: '#77807B', textAlign: 'center', marginTop: 24 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E8E6',
  },
  optionChecked: { borderColor: '#176B4D', backgroundColor: '#EEF7F2' },
  optionTextWrap: { flex: 1, gap: 2 },
  optionText: { fontSize: 15, color: '#17201C' },
  optionCategory: { fontSize: 12, color: '#8B929A' },
  loader: { flex: 1 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  retryButton: { backgroundColor: '#176B4D', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  doneButton: { margin: 18, backgroundColor: '#176B4D', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  doneButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
