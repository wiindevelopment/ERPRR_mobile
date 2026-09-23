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

export type ServiceRequest = {
  serviceRequestId?: string;
  serviceRequestCode?: string;
  submittedBy: string;
  requestedDate: string;
  projectCode: string;
  assetCode: string;
  operatorName: string;
  phoneNumber: string;
  maintenanceWorks: string;
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type GinItem = {
  ginItemId?: string;
  ginId?: string;
  itemCode?: string;
  description?: string;
  size?: string;
  uom?: number;
  quantity?: number;
  remarks?: string;
  issueItemTypeId?: number;
  unitPrice?: number;
  amount?: number;
  lengthM?: number;
  widthM?: number;
  assetCode?: string;
};

export type Gin = {
  ginId: string;
  ginCode?: string;
  ginTypeId?: number;
  issuedDate?: string;
  issuedProjectCode?: string;
  receivedProjectCode?: string;
  receivedPerson?: string;
  vehicleNo?: string;
  vehicleAssetCode?: string;
  approvedBy?: string;
  approvedDate?: string;
  isAuthorized?: boolean;
  expectedReturnDate?: string;
  receiverName?: string;
  receiverNIC?: string;
  subContractorId?: number;
  mrId?: string;
  gateVerifiedBy?: string;
  gateVerifiedDate?: string;
  isGateVerified?: boolean;
  arrivalGateVerifiedBy?: string;
  arrivalGateVerifiedDate?: string;
  isArrivalGateVerified?: boolean;
  items?: GinItem[];
};

export type StockReturnItem = {
  stockReturnItemId?: string;
  itemCode?: string;
  description?: string;
  size?: string;
  uomId?: number;
  quantity?: number;
  remarks?: string;
  unitPrice?: number;
  amount?: number;
};

export type StockReturn = {
  stockReturnId: string;
  stockReturnCode?: string;
  fromProjectCode?: string;
  toProjectCode?: string;
  ginId?: string;
  returnType?: string;
  poCode?: string;
  supplierCode?: string;
  reason?: string;
  remark?: string;
  returnDate?: string;
  returnBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  isApproved?: boolean;
  gateVerifiedBy?: string;
  gateVerifiedDate?: string;
  isGateVerified?: boolean;
  arrivalGateVerifiedBy?: string;
  arrivalGateVerifiedDate?: string;
  isArrivalGateVerified?: boolean;
  items?: StockReturnItem[];
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
