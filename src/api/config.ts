// IMPORTANT:
// If you are testing on a physical phone, do NOT use localhost here.
// Use your computer/server LAN IP, e.g. http://192.168.1.20:8080
export const API_BASE_URL = 'http://ec2-13-126-81-39.ap-south-1.compute.amazonaws.com:8080';
//export const API_BASE_URL = 'http://192.168.1.13:8080';

export const ENDPOINTS = {
  login: '/api/login',
  meterReadingCreate: '/api/meter_reading/',
  meterReadingsByUser: (employeeCode: string) =>
    `/api/meter_reading/${encodeURIComponent(employeeCode)}`,
  meterReadingUpdate: (meterReadingId: string) =>
    `/api/meter_reading/${encodeURIComponent(meterReadingId)}`,

  assetLocationVerify: (assetCode: string, projectCode: string) =>
    `/api/asset-location/verify/${encodeURIComponent(assetCode)}/${encodeURIComponent(projectCode)}`,

  fuelIssuesReceivedBy: (receivedBy: string) =>
    `/api/fuel_issue/received/${encodeURIComponent(receivedBy)}`,

  fuelIssueMarkReceived: (fuelIssueId: string) =>
    `/api/fuel_issue/received/${encodeURIComponent(fuelIssueId)}`,

  serviceRequestCreate: '/api/service-request/',
  serviceRequestUpdate: '/api/service-request/',
  serviceRequestsByProject: (projectCode: string) =>
    `/api/service-request/created/${encodeURIComponent(projectCode)}`,

  ginIncoming: (receivedProjectCode: string, page: number, size: number) =>
    `/api/gin/incoming/${encodeURIComponent(receivedProjectCode)}?page=${page}&size=${size}`,
  returnIncoming: (toProjectCode: string, page: number, size: number) =>
    `/api/return/incoming/${encodeURIComponent(toProjectCode)}?page=${page}&size=${size}`,
  ginCreated: (issuedProjectCode: string, page: number, size: number) =>
    `/api/gin/created/${encodeURIComponent(issuedProjectCode)}?page=${page}&size=${size}`,
  returnCreated: (fromProjectCode: string, page: number, size: number) =>
    `/api/return/created/${encodeURIComponent(fromProjectCode)}?page=${page}&size=${size}`,

  ginGateVerifyArrival: (ginId: string, gateVerifiedBy: string) =>
    `/api/gin/${encodeURIComponent(ginId)}/gate-verify-arrival?gateVerifiedBy=${encodeURIComponent(gateVerifiedBy)}`,
  returnGateVerifyArrival: (stockReturnId: string, gateVerifiedBy: string) =>
    `/api/return/${encodeURIComponent(stockReturnId)}/gate-verify-arrival?gateVerifiedBy=${encodeURIComponent(gateVerifiedBy)}`,
  ginGateVerify: (ginId: string, gateVerifiedBy: string) =>
    `/api/gin/${encodeURIComponent(ginId)}/gate-verify?gateVerifiedBy=${encodeURIComponent(gateVerifiedBy)}`,
  returnGateVerify: (stockReturnId: string, gateVerifiedBy: string) =>
    `/api/return/${encodeURIComponent(stockReturnId)}/gate-verify?gateVerifiedBy=${encodeURIComponent(gateVerifiedBy)}`,
};
