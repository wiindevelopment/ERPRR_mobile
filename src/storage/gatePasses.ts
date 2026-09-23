import AsyncStorage from '@react-native-async-storage/async-storage';
import { GatePass } from '../types';

function storageKey(projectCode: string) {
  return `meter_fuel_gate_passes_${projectCode}`;
}

export async function getGatePasses(projectCode: string): Promise<GatePass[]> {
  const stored = await AsyncStorage.getItem(storageKey(projectCode));
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  return Array.isArray(parsed) ? parsed : [];
}
