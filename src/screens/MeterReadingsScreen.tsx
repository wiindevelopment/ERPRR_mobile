import React, { useCallback, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { getMeterReadings } from '../api/services';
import { MeterReading } from '../types';
import PrimaryButton from '../components/PrimaryButton';

export default function MeterReadingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'MeterReadings'>) {
  const { user } = useAuth();
  const [items, setItems] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.type}>{item.meterType}</Text>
                <Text style={styles.date}>{item.readingDate}</Text>
              </View>
              <Text style={styles.value}>{item.readingValue}</Text>
              <Text style={styles.meta}>Asset ID: {item.assetCodeId}</Text>
              <View style={styles.stats}>
                <View><Text style={styles.statLabel}>Previous</Text><Text style={styles.statValue}>{item.previousReading}</Text></View>
                <View><Text style={styles.statLabel}>Usage</Text><Text style={styles.statValue}>{item.usageValue}</Text></View>
              </View>
              {!!item.remarks && <Text style={styles.remarks}>{item.remarks}</Text>}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, padding: 18, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FA' },
  list: { gap: 12, paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#77807B', textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 16, borderWidth: 1, borderColor: '#E5E8E6', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontSize: 15, fontWeight: '800', color: '#176B4D' },
  date: { color: '#7A817D', fontSize: 12 },
  value: { fontSize: 27, fontWeight: '900', color: '#171C19' },
  meta: { color: '#6F7773', fontSize: 12 },
  stats: { flexDirection: 'row', gap: 40, marginTop: 4 },
  statLabel: { color: '#89908C', fontSize: 11 },
  statValue: { color: '#343A37', fontWeight: '800', fontSize: 15 },
  remarks: { marginTop: 4, borderTopWidth: 1, borderTopColor: '#EDF0EE', paddingTop: 10, color: '#626A66', lineHeight: 19 },
});
