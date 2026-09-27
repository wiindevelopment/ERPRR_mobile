import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function SecurityGatePassScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'SecurityGatePass'>) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable
          style={[styles.button, styles.buttonIn]}
          onPress={() => navigation.navigate('IncomingGatePasses')}
        >
          <View style={[styles.iconWrap, styles.iconWrapIn]}>
            <Ionicons name="arrow-down-circle-outline" size={40} color="#176B4D" />
          </View>
          <Text style={[styles.buttonTitle, styles.buttonTitleIn]}>Stock In</Text>
          <Text style={styles.buttonSubtitle}>View incoming GINs and returns</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOut]}
          onPress={() => navigation.navigate('OutgoingGatePasses')}
        >
          <View style={[styles.iconWrap, styles.iconWrapOut]}>
            <Ionicons name="arrow-up-circle-outline" size={40} color="#B9560F" />
          </View>
          <Text style={[styles.buttonTitle, styles.buttonTitleOut]}>Stock Out</Text>
          <Text style={styles.buttonSubtitle}>View created GINs and returns</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 20 },
  button: {
    alignItems: 'center', borderRadius: 24, paddingVertical: 36, paddingHorizontal: 20,
    borderWidth: 1, backgroundColor: '#FFFFFF', gap: 8,
  },
  buttonIn: { borderColor: '#E7F1ED' },
  buttonOut: { borderColor: '#FBEAD9' },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  iconWrapIn: { backgroundColor: '#E7F1ED' },
  iconWrapOut: { backgroundColor: '#FBEAD9' },
  buttonTitle: { fontSize: 22, fontWeight: '800' },
  buttonTitleIn: { color: '#176B4D' },
  buttonTitleOut: { color: '#B9560F' },
  buttonSubtitle: { fontSize: 14, color: '#737B77', textAlign: 'center' },
});
