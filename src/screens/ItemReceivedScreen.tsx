import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function ItemReceivedScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'ItemReceived'>) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable
          style={[styles.button, styles.buttonFuel]}
          onPress={() => navigation.navigate('FuelReceived')}
        >
          <View style={[styles.iconWrap, styles.iconWrapFuel]}>
            <Ionicons name="flame-outline" size={40} color="#B9560F" />
          </View>
          <Text style={[styles.buttonTitle, styles.buttonTitleFuel]}>Fuel Received</Text>
          <Text style={styles.buttonSubtitle}>Review fuel deliveries and mark them received</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonGoods]}
          onPress={() => navigation.navigate('GoodsReceived')}
        >
          <View style={[styles.iconWrap, styles.iconWrapGoods]}>
            <Ionicons name="cube-outline" size={40} color="#176B4D" />
          </View>
          <Text style={[styles.buttonTitle, styles.buttonTitleGoods]}>Goods Received</Text>
          <Text style={styles.buttonSubtitle}>View GINs issued to you</Text>
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
  buttonFuel: { borderColor: '#FBEAD9' },
  buttonGoods: { borderColor: '#E7F1ED' },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  iconWrapFuel: { backgroundColor: '#FBEAD9' },
  iconWrapGoods: { backgroundColor: '#E7F1ED' },
  buttonTitle: { fontSize: 22, fontWeight: '800' },
  buttonTitleFuel: { color: '#B9560F' },
  buttonTitleGoods: { color: '#176B4D' },
  buttonSubtitle: { fontSize: 14, color: '#737B77', textAlign: 'center' },
});
