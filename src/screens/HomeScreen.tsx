import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../context/AuthContext';
import { AssignedProject } from '../types';

const AVATAR_ICON = require('../icon/profile.png');

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { user, selectedProject, selectProject, signOut } = useAuth();
  const [pickerVisible, setPickerVisible] = useState(false);
  const projects = user?.assignedProjects ?? [];

  const handleSelect = (project: AssignedProject) => {
    selectProject(project);
    setPickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Image source={AVATAR_ICON} style={styles.avatarImage} contentFit="cover" />
            </View>
            <View>
              <Text style={styles.hello}>Welcome</Text>
              <Text style={styles.employee}>{user?.employeeName}</Text>
              <Text style={styles.employeeCode}>{user?.employeeCode}</Text>
            </View>
          </View>
          <Pressable onPress={signOut} style={styles.logout} hitSlop={8}>
            <Ionicons name="log-out-outline" size={22} color="#49504C" />
          </Pressable>
        </View>

        <Pressable
          style={styles.projectCard}
          onPress={() => setPickerVisible(true)}
          disabled={projects.length === 0}
        >
          <View style={styles.projectTextWrap}>
            <Text style={styles.projectLabel}>Project</Text>
            {selectedProject ? (
              <View style={styles.projectBadge}>
                <Text style={styles.projectBadgeText}>{selectedProject.projectName}</Text>
              </View>
            ) : (
              <Text style={styles.projectPlaceholder}>
                {projects.length === 0 ? 'No projects assigned' : 'Select a project'}
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Choose an activity</Text>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('MeterReadings')}>
          <View style={[styles.icon, styles.iconMeter]}>
            <Ionicons name="speedometer-outline" size={24} color="#176B4D" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Meter Readings</Text>
            <Text style={styles.actionSubtitle}>View history and record a new reading</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('FuelReceived')}>
          <View style={[styles.icon, styles.iconFuel]}>
            <Ionicons name="flame-outline" size={24} color="#B9560F" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Fuel Received</Text>
            <Text style={styles.actionSubtitle}>Review deliveries and mark them received</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('ServiceRequests')}>
          <View style={[styles.icon, styles.iconService]}>
            <Ionicons name="construct-outline" size={24} color="#1D5FA8" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Service Request</Text>
            <Text style={styles.actionSubtitle}>Report an issue or request maintenance</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate('SecurityGatePass')}>
          <View style={[styles.icon, styles.iconGin]}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#6A3FA0" />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Security Gate Pass</Text>
            <Text style={styles.actionSubtitle}>Track incoming, created passes and returns</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select project</Text>
            <FlatList
              data={projects}
              keyExtractor={(item) => item.projectCode}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.projectCode === selectedProject?.projectCode;
                return (
                  <Pressable
                    style={[styles.projectRow, isSelected && styles.projectRowSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <View>
                      <Text style={[styles.projectRowName, isSelected && styles.projectRowNameSelected]}>
                        {item.projectName}
                      </Text>
                      <Text style={styles.projectRowCode}>{item.projectCode}</Text>
                    </View>
                    {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, padding: 20, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: '#E7F1ED' },
  avatarImage: { width: '100%', height: '100%' },
  hello: { color: '#747B82', fontSize: 14 },
  employee: { color: '#161B18', fontSize: 22, fontWeight: '800' },
  employeeCode: { color: '#747B82', fontSize: 13, fontWeight: '600', marginTop: 1 },
  logout: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECEFED',
    alignItems: 'center', justifyContent: 'center',
  },
  projectCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#E7EAE8', marginBottom: 4,
  },
  projectTextWrap: { flex: 1, gap: 6 },
  projectLabel: { fontSize: 12, fontWeight: '700', color: '#8B929A', letterSpacing: 0.5 },
  projectPlaceholder: { fontSize: 15, color: '#8B929A' },
  projectBadge: {
    alignSelf: 'flex-start', backgroundColor: '#E7F1ED', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#176B4D',
  },
  projectBadgeText: { color: '#176B4D', fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#252B28', marginBottom: 2 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: '#E7EAE8'
  },
  icon: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  iconMeter: { backgroundColor: '#E7F1ED' },
  iconFuel: { backgroundColor: '#FBEAD9' },
  iconService: { backgroundColor: '#E4EDF8' },
  iconGin: { backgroundColor: '#EFE7F8' },
  actionTextWrap: { flex: 1, gap: 3 },
  actionTitle: { fontSize: 17, fontWeight: '800', color: '#17201C' },
  actionSubtitle: { fontSize: 13, lineHeight: 18, color: '#737B77' },
  chevron: { fontSize: 30, color: '#98A09C', marginTop: -3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#17201C', marginBottom: 12 },
  separator: { height: 1, backgroundColor: '#EEF0EF' },
  projectRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12,
  },
  projectRowSelected: { backgroundColor: '#E7F1ED' },
  projectRowName: { fontSize: 15, fontWeight: '700', color: '#17201C' },
  projectRowNameSelected: { color: '#176B4D' },
  projectRowCode: { fontSize: 12, color: '#8B929A', marginTop: 2 },
  checkmark: { fontSize: 18, fontWeight: '900', color: '#176B4D' },
});
