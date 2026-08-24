import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Welcome</Text>
            <Text style={styles.employee}>{user?.employeeCode}</Text>
          </View>
          <Pressable onPress={signOut} style={styles.logout}><Text style={styles.logoutText}>Logout</Text></Pressable>
        </View>

        <Text style={styles.sectionTitle}>Choose an activity</Text>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('MeterReadings')}>
          <View style={styles.icon}><Text style={styles.iconText}>MR</Text></View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Meter Readings</Text>
            <Text style={styles.actionSubtitle}>View history and record a new reading</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('FuelReceived')}>
          <View style={styles.icon}><Text style={styles.iconText}>FR</Text></View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Fuel Received</Text>
            <Text style={styles.actionSubtitle}>Review deliveries and mark them received</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, padding: 20, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  hello: { color: '#747B82', fontSize: 14 },
  employee: { color: '#161B18', fontSize: 22, fontWeight: '800' },
  logout: { backgroundColor: '#ECEFED', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  logoutText: { color: '#49504C', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#252B28', marginBottom: 2 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: '#E7EAE8'
  },
  icon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E7F1ED', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#176B4D', fontWeight: '900' },
  actionTextWrap: { flex: 1, gap: 3 },
  actionTitle: { fontSize: 17, fontWeight: '800', color: '#17201C' },
  actionSubtitle: { fontSize: 13, lineHeight: 18, color: '#737B77' },
  chevron: { fontSize: 30, color: '#98A09C', marginTop: -3 },
});
