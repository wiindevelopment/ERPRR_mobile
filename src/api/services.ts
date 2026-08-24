import apiClient from './client';
import { ENDPOINTS } from './config';
import { FuelReceived, LoginResponse, MeterReading } from '../types';

export async function login(username: string, password: string) {
  const response = await apiClient.post<LoginResponse>(ENDPOINTS.login, {
    username,
    password,
  });
  return response.data;
}

export async function getMeterReadings(employeeCode: string) {
  const response = await apiClient.get<MeterReading[]>(
    ENDPOINTS.meterReadingsByUser(employeeCode),
  );
  return response.data;
}

export async function createMeterReading(payload: MeterReading) {
  const response = await apiClient.post<MeterReading>(
    ENDPOINTS.meterReadingCreate,
    payload,
  );
  return response.data;
}

export async function getFuelReceived(employeeCode: string) {
  const response = await apiClient.get<FuelReceived[]>(
    ENDPOINTS.fuelReceivedByUser(employeeCode),
  );
  return response.data;
}

export async function markFuelAsReceived(item: FuelReceived, employeeCode: string) {
  const id = item.fuelReceivedId ?? item.id;
  if (id === undefined || id === null) {
    throw new Error('Fuel record does not contain an id.');
  }

  // Update this payload if your backend expects a different status field.
  const response = await apiClient.put<FuelReceived>(
    ENDPOINTS.fuelReceivedUpdate(id),
    {
      ...item,
      status: 'RECEIVED',
      receivedBy: employeeCode,
    },
  );

  return response.data;
}
