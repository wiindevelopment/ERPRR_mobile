import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import PrimaryButton from '../components/PrimaryButton';
import { useFuelTypes } from '../components/FuelTypeSelect';
import VehicleFuelLogForm, { emptyFuelLogValues, fuelLogPayload, validateFuelLog } from '../components/VehicleFuelLogForm';
import { useAuth } from '../context/AuthContext';
import { createVehicleFuelLog } from '../api/services';

export default function AddVehicleFuelLogScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddVehicleFuelLog'>) {
  const { user } = useAuth();
  const { fuelTypes, loading: fuelTypesLoading } = useFuelTypes();
  const [values, setValues] = useState(emptyFuelLogValues);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const error = validateFuelLog(values);
    if (error) {
      Alert.alert('Check inputs', error);
      return;
    }
    if (!user?.employeeCode) return;

    try {
      setSubmitting(true);
      await createVehicleFuelLog(fuelLogPayload(values, user.employeeCode));
      Alert.alert('Saved', 'Fuel log recorded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Could not save', error?.response?.data?.message ?? error?.message ?? 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <VehicleFuelLogForm values={values} onChange={setValues} fuelTypes={fuelTypes} fuelTypesLoading={fuelTypesLoading} />
        <PrimaryButton title="Submit Fuel Log" onPress={submit} loading={submitting} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { padding: 18, gap: 16, paddingBottom: 36 },
});
