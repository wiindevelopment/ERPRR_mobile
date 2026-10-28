import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AssetCodeSelect from './AssetCodeSelect';
import FormField from './FormField';
import FuelTypeSelect from './FuelTypeSelect';
import { FuelType, VehicleFuelLog } from '../types';
import { getTodayYYYYMMDD } from '../utils/date';
import { formatNumber, formatNumberInput, parseNumberInput } from '../utils/number';

export const PAYMENT_METHODS = ['Cash', 'Card', 'Credit'];

/** Form state; numeric fields hold the comma-formatted text the user sees. */
export type FuelLogFormValues = {
  assetCode: string;
  fillingStationName: string;
  fillingStationLocation: string;
  fuelDate: string;
  fuelType: string;
  fuelQuantity: string;
  pricePerLiter: string;
  odometerReading: string;
  paymentMethod: string;
  remarks: string;
};

export function emptyFuelLogValues(): FuelLogFormValues {
  return {
    assetCode: '',
    fillingStationName: '',
    fillingStationLocation: '',
    fuelDate: getTodayYYYYMMDD(),
    fuelType: '',
    fuelQuantity: '',
    pricePerLiter: '',
    odometerReading: '',
    paymentMethod: '',
    remarks: '',
  };
}

export function fuelLogToValues(log: VehicleFuelLog): FuelLogFormValues {
  const numberText = (value?: number | null) => (value === null || value === undefined ? '' : formatNumberInput(String(value), 2));
  return {
    assetCode: log.assetCode ?? '',
    fillingStationName: log.fillingStationName ?? '',
    fillingStationLocation: log.fillingStationLocation ?? '',
    fuelDate: log.fuelDate ?? '',
    fuelType: log.fuelType ?? '',
    fuelQuantity: numberText(log.fuelQuantity),
    pricePerLiter: numberText(log.pricePerLiter),
    odometerReading: numberText(log.odometerReading),
    paymentMethod: log.paymentMethod ?? '',
    remarks: log.remarks ?? '',
  };
}

/** Quantity x price, rounded to cents like the server; 0 until both are valid. */
export function fuelLogTotal(values: FuelLogFormValues) {
  const quantity = parseNumberInput(values.fuelQuantity);
  const price = parseNumberInput(values.pricePerLiter);
  if (!values.fuelQuantity || !values.pricePerLiter || Number.isNaN(quantity) || Number.isNaN(price)) return 0;
  return Math.round(quantity * price * 100) / 100;
}

/** Mirrors the server's checks so the user gets the message before submitting. */
export function validateFuelLog(values: FuelLogFormValues): string | null {
  if (!values.assetCode.trim()) return 'Select the vehicle asset code.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fuelDate) || Number.isNaN(new Date(values.fuelDate).getTime())) {
    return 'Enter the fuel date as YYYY-MM-DD.';
  }
  if (values.fuelDate > getTodayYYYYMMDD()) return 'Fuel date cannot be in the future.';
  if (!values.fillingStationName.trim()) return 'Enter the filling station name.';
  if (!values.fuelType) return 'Select the fuel type.';
  const quantity = parseNumberInput(values.fuelQuantity);
  if (!values.fuelQuantity || Number.isNaN(quantity) || quantity <= 0) return 'Enter a fuel quantity greater than 0.';
  if (!values.pricePerLiter || Number.isNaN(parseNumberInput(values.pricePerLiter))) return 'Enter the price per liter.';
  if (values.odometerReading && Number.isNaN(parseNumberInput(values.odometerReading))) return 'Enter a valid odometer reading.';
  return null;
}

/** Builds the API payload; call only after validateFuelLog passes. */
export function fuelLogPayload(values: FuelLogFormValues, driver: string, base?: VehicleFuelLog): VehicleFuelLog {
  return {
    ...base,
    assetCode: values.assetCode.trim(),
    driver,
    fillingStationName: values.fillingStationName.trim(),
    fillingStationLocation: values.fillingStationLocation.trim() || undefined,
    fuelDate: values.fuelDate,
    fuelType: values.fuelType,
    fuelQuantity: parseNumberInput(values.fuelQuantity),
    pricePerLiter: parseNumberInput(values.pricePerLiter),
    totalAmount: fuelLogTotal(values),
    odometerReading: values.odometerReading ? parseNumberInput(values.odometerReading) : null,
    paymentMethod: values.paymentMethod || undefined,
    remarks: values.remarks.trim() || undefined,
  };
}

type Props = {
  values: FuelLogFormValues;
  onChange: (values: FuelLogFormValues) => void;
  fuelTypes: FuelType[];
  fuelTypesLoading: boolean;
};

export default function VehicleFuelLogForm({ values, onChange, fuelTypes, fuelTypesLoading }: Props) {
  const set = <K extends keyof FuelLogFormValues>(key: K) => (value: FuelLogFormValues[K]) => onChange({ ...values, [key]: value });
  const setNumber = (key: 'fuelQuantity' | 'pricePerLiter' | 'odometerReading') => (text: string) => set(key)(formatNumberInput(text, 2));

  return (
    <View style={styles.form}>
      <AssetCodeSelect label="Vehicle Asset Code" value={values.assetCode} onChange={set('assetCode')} />
      <FormField label="Fuel Date" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" maxLength={10} value={values.fuelDate} onChangeText={set('fuelDate')} />
      <FormField label="Filling Station Name" placeholder="Enter filling station name" value={values.fillingStationName} onChangeText={set('fillingStationName')} />
      <FormField label="Filling Station Location" placeholder="Optional location" value={values.fillingStationLocation} onChangeText={set('fillingStationLocation')} />
      <FuelTypeSelect label="Fuel Type" value={values.fuelType} onChange={set('fuelType')} fuelTypes={fuelTypes} loading={fuelTypesLoading} />
      <FormField label="Fuel Quantity (L)" placeholder="Enter liters filled" keyboardType="decimal-pad" value={values.fuelQuantity} onChangeText={setNumber('fuelQuantity')} />
      <FormField label="Price per Liter" placeholder="Enter price per liter" keyboardType="decimal-pad" value={values.pricePerLiter} onChangeText={setNumber('pricePerLiter')} />
      <FormField label="Total Amount (auto calculated)" value={formatNumber(fuelLogTotal(values), 2)} editable={false} />
      <FormField label="Odometer Reading (km)" placeholder="Optional odometer reading" keyboardType="decimal-pad" value={values.odometerReading} onChangeText={setNumber('odometerReading')} />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.chips}>
          {PAYMENT_METHODS.map(method => {
            const selected = values.paymentMethod === method;
            return (
              // Tapping the selected chip again clears it, since payment method is optional.
              <Pressable key={method} style={[styles.chip, selected && styles.chipSelected]} onPress={() => set('paymentMethod')(selected ? '' : method)}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{method}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FormField label="Remarks" placeholder="Optional remarks" multiline numberOfLines={3} value={values.remarks} onChangeText={set('remarks')} style={styles.remarksInput} textAlignVertical="top" />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#343A40' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE1E6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  chipSelected: { backgroundColor: '#E4F0EB', borderColor: '#176B4D' },
  chipText: { color: '#5C6460', fontWeight: '700' },
  chipTextSelected: { color: '#176B4D' },
  remarksInput: { minHeight: 80, paddingTop: 14 },
});
