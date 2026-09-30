import apiClient from './client';
import { ENDPOINTS } from './config';
import { FuelReceived, Gin, LoginResponse, MeterReading, OperatorAsset, PaginatedResponse, ServiceFaultType, ServiceRequest, StockReturn } from '../types';

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

export async function getAssetsByOperator(employeeCode: string) {
  const response = await apiClient.get<OperatorAsset[]>(
    ENDPOINTS.assetsByOperator(employeeCode),
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

export async function getServiceFaultTypes() {
  const response = await apiClient.get<ServiceFaultType[]>(ENDPOINTS.serviceFaultTypes);
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

export async function updateServiceRequest(payload: ServiceRequest) {
  const response = await apiClient.put<ServiceRequest>(
    ENDPOINTS.serviceRequestUpdate,
    payload,
  );
  return response.data;
}

export async function getIncomingGins(receivedProjectCode: string, page = 0, size = 10) {
  const response = await apiClient.get<PaginatedResponse<Gin>>(
    ENDPOINTS.ginIncoming(receivedProjectCode, page, size),
  );
  return response.data;
}

export async function getIncomingReturns(toProjectCode: string, page = 0, size = 10) {
  const response = await apiClient.get<PaginatedResponse<StockReturn>>(
    ENDPOINTS.returnIncoming(toProjectCode, page, size),
  );
  return response.data;
}

export async function getGinsReceivedBy(employeeCode: string, page = 0, size = 10) {
  const response = await apiClient.get<PaginatedResponse<Gin>>(
    ENDPOINTS.ginReceivedBy(employeeCode, page, size),
  );
  return response.data;
}

export async function getCreatedGins(issuedProjectCode: string, page = 0, size = 10) {
  const response = await apiClient.get<PaginatedResponse<Gin>>(
    ENDPOINTS.ginCreated(issuedProjectCode, page, size),
  );
  return response.data;
}

export async function getCreatedReturns(fromProjectCode: string, page = 0, size = 10) {
  const response = await apiClient.get<PaginatedResponse<StockReturn>>(
    ENDPOINTS.returnCreated(fromProjectCode, page, size),
  );
  return response.data;
}

export async function verifyGinArrival(ginId: string, gateVerifiedBy: string) {
  const response = await apiClient.put<Gin>(
    ENDPOINTS.ginGateVerifyArrival(ginId, gateVerifiedBy),
  );
  return response.data;
}

export async function verifyReturnArrival(stockReturnId: string, gateVerifiedBy: string) {
  const response = await apiClient.put<StockReturn>(
    ENDPOINTS.returnGateVerifyArrival(stockReturnId, gateVerifiedBy),
  );
  return response.data;
}

export async function verifyGinGate(ginId: string, gateVerifiedBy: string) {
  const response = await apiClient.put<Gin>(
    ENDPOINTS.ginGateVerify(ginId, gateVerifiedBy),
  );
  return response.data;
}

export async function verifyReturnGate(stockReturnId: string, gateVerifiedBy: string) {
  const response = await apiClient.put<StockReturn>(
    ENDPOINTS.returnGateVerify(stockReturnId, gateVerifiedBy),
  );
  return response.data;
}
