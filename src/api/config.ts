// IMPORTANT:
// If you are testing on a physical phone, do NOT use localhost here.
// Use your computer/server LAN IP, e.g. http://192.168.1.20:8080
export const API_BASE_URL = ' http://192.168.1.10:8081';

export const ENDPOINTS = {
  login: '/api/login',
  meterReadingCreate: '/api/meter_reading/',
  meterReadingsByUser: (employeeCode: string) =>
    `/api/meter_reading/${encodeURIComponent(employeeCode)}`,

  // Fuel endpoints were not supplied in the requirement.
  // Change only these two paths if your backend uses different URLs.
  fuelReceivedByUser: (employeeCode: string) =>
    `/api/fuel_received/${encodeURIComponent(employeeCode)}`,
  fuelReceivedUpdate: (fuelReceivedId: string | number) =>
    `/api/fuel_received/${fuelReceivedId}`,
};
