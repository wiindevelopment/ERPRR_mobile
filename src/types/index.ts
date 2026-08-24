export type LoginResponse = {
  employeeCode: string;
  assignedProjects?: Array<string | number>;
  token?: string;
  [key: string]: unknown;
};

export type MeterReading = {
  meterReadingId?: string;
  assetCodeId: number;
  meterType: string;
  readingDate: string;
  readingValue: number;
  previousReading: number;
  usageValue: number;
  remarks: string;
  recordedBy: string;
};

export type FuelReceived = {
  fuelReceivedId?: string | number;
  id?: string | number;
  fuelType?: string;
  quantity?: number;
  amount?: number;
  receivedDate?: string;
  date?: string;
  supplier?: string;
  vehicleNumber?: string;
  referenceNo?: string;
  status?: string;
  receivedBy?: string;
  [key: string]: unknown;
};
