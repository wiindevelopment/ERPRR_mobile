import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MeterReadingsScreen from '../screens/MeterReadingsScreen';
import AddMeterReadingScreen from '../screens/AddMeterReadingScreen';
import FuelReceivedScreen from '../screens/FuelReceivedScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  MeterReadings: undefined;
  AddMeterReading: undefined;
  FuelReceived: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#F7F8FA' },
        contentStyle: { backgroundColor: '#F7F8FA' },
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Operator App' }} />
          <Stack.Screen name="MeterReadings" component={MeterReadingsScreen} options={{ title: 'Meter Readings' }} />
          <Stack.Screen name="AddMeterReading" component={AddMeterReadingScreen} options={{ title: 'New Meter Reading' }} />
          <Stack.Screen name="FuelReceived" component={FuelReceivedScreen} options={{ title: 'Fuel Received' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
