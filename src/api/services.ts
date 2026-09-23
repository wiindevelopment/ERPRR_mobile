import apiClient from './client';
import { ENDPOINTS } from './config';
import { AssetLocationVerification, FuelReceived, LoginResponse, MeterReading, ServiceRequest } from '../types';

export async function login(username: string, password: string) {
  const response = await apiClient.post<LoginResponse>(ENDPOINTS.login, {
    userName: username,
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

export async function updateMeterReading(meterReadingId: string, payload: MeterReading) {
  const response = await apiClient.put<MeterReading>(
    ENDPOINTS.meterReadingUpdate(meterReadingId),
    payload,
  );
  return response.data;
}

export async function verifyAssetLocation(assetCode: string, projectCode: string) {
  const response = await apiClient.get<AssetLocationVerification>(
    ENDPOINTS.assetLocationVerify(assetCode, projectCode),
  );
  return response.data;
}

export async function getFuelReceived(employeeCode: string) {
  const response = await apiClient.get<FuelReceived[]>(
    ENDPOINTS.fuelIssuesReceivedBy(employeeCode),
  );
  return response.data;
}

export async function markFuelAsReceived(fuelIssueId: string) {
  const response = await apiClient.put<FuelReceived>(
    ENDPOINTS.fuelIssueMarkReceived(fuelIssueId),
  );
  return response.data;
}

export async function createServiceRequest(payload: ServiceRequest) {
  const response = await apiClient.post<ServiceRequest>(
    ENDPOINTS.serviceRequestCreate,
    payload,
  );
  return response.data;
}

export async function getServiceRequestsByProject(projectCode: string) {
  const response = await apiClient.get<ServiceRequest[]>(
    ENDPOINTS.serviceRequestsByProject(projectCode),
  );
  return response.data;
}
