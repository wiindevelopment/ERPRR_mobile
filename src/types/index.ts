export type AssignedProject = {
  projectCode: string;
  projectName: string;
};

export type LoginResponse = {
  employeeCode: string;
  employeeName?: string;
  assignedProjects?: AssignedProject[];
  token?: string;
  [key: string]: unknown;
};

export type AssetLocationVerification = {
  assetCode: string;
  projectCode: string;
  currentLocation: string | null;
  correctLocation: boolean;
};

export type MeterReading = {
  meterReadingId?: string;
  assetCode: string;
  meterType: string;
  readingDate: string;
  readingValue: number;
  previousReading: number;
  usageValue: number;
  remarks: string;
  recordedBy: string;
  submittedAt?: string;
  editedAt?: string;
};

export type FuelReceived = {
  fuelIssueId: string;
  fuelIssueCode?: string;
  issuedDate?: string;
  projectCode?: string;
  issuedBy?: string;
  receivedBy?: string | null;
  remarks?: string;
  assetCode?: string;
  fuelType?: string;
  quantity?: number;
  meterReading?: number;
  isIssued?: boolean;
  isReceived?: boolean;
  isActive?: boolean;
};
