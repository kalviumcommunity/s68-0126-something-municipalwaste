export interface WasteSegregationReport {
  id: string;
  communityId: string;
  communityName: string;
  reporterId: string;
  reporterName: string;
  reportDate: Date;
  wasteCategories: WasteCategory[];
  totalWasteKg: number;
  segregationScore: number; // 0-100 percentage
  location: {
    ward: string;
    zone: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: "pending" | "verified" | "rejected";
  notes?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WasteCategory {
  type: "organic" | "recyclable" | "hazardous" | "electronic" | "general";
  weightKg: number;
  isProperlySegregated: boolean;
}

export interface CreateWasteReportRequest {
  communityId: string;
  communityName: string;
  reporterId: string;
  reporterName: string;
  wasteCategories: WasteCategory[];
  location: {
    ward: string;
    zone: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  notes?: string;
  images?: string[];
}

export interface WasteReportResponse {
  success: boolean;
  data?: WasteSegregationReport | WasteSegregationReport[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: string;
  message?: string;
}

export interface WasteReportFilters {
  communityId?: string;
  status?: "pending" | "verified" | "rejected";
  ward?: string;
  zone?: string;
  startDate?: string;
  endDate?: string;
  minScore?: number;
  maxScore?: number;
}
